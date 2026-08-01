import pool from "@/lib/db";
import type { PoolClient } from "pg";

// Egzekwowanie obietnicy z polityki prywatnosci ("dane z ankiety i statystyki
// wewnetrzne przechowujemy nie dluzej niz 24 miesiace") - patrz punkt AD/7
// przegladu zgodnosci: samo napisanie tego w polityce niczego nie gwarantuje,
// jesli nic tego faktycznie nie usuwa.
//
// ANONIMIZACJA, NIE USUNIECIE, dla danych zasilajacych statystyki w /admin:
// survey_responses i page_visits traca IP / geolokalizacje / user-agent /
// wolny tekst "Inne" (to pole jest niekontrolowanym wejsciem uzytkownika -
// patrz punkt AD/4), ale ZACHOWUJA odpowiedz, kanal, urzadzenie, UTM-y - dzieki
// temu wykresy w /admin dla starych wierszy dalej maja sens, tylko bez
// mozliwosci zidentyfikowania konkretnej osoby.
//
// USUNIECIE (nie anonimizacja) dla `submissions` (martwy formularz kontaktowy
// z usunietej podstrony /partnerzy) - te dane (nazwa firmy, imie, telefon,
// wiadomosc) nie zasilaja zadnej statystyki i nie sluza juz zadnemu celowi,
// wiec zasada minimalizacji (art. 5.1.e RODO) przemawia za usunieciem, nie
// za trzymaniem ich "na wszelki wypadek" po wygasnieciu okresu.
//
// URUCHAMIANIE: bez zewnetrznego harmonogramu (Railway usypia, cron moze nie
// wystartowac) - leniwe wyzwalanie z wnetrza POST /api/survey i POST /api/visit
// (patrz wywolania maybeRunRetentionCleanup w tych plikach). Zabezpieczenia:
//  - blokada wspolbiezna: sesyjny advisory lock Postgresa (dziala tez, gdy
//    kilka requestow trafi tu w tym samym momencie na roznych instancjach) -
//    MUSI byc trzymany i zwalniany na TYM SAMYM polaczeniu, dlatego uzywamy
//    jednego pool.connect() zamiast queryWithRetry (ktore za kazdym razem
//    moze dostac inne polaczenie z puli).
//  - throttling: nie czesciej niz raz na 24h (retention_runs.run_at) - okres
//    retencji liczy sie w miesiacach, wiec nie ma sensu sprawdzac przy kazdym
//    zapisie ankiety.
//  - kazdy przebieg (takze pusty) zapisuje sie w retention_runs, wiec /admin
//    moze pokazac date ostatniego przebiegu bez zagladania do bazy recznie.
//  - blad w trakcie sprzatania NIGDY nie ma prawa zepsuc odpowiedzi API,
//    ktore je wywolalo - stad pelne try/catch na zewnatrz i cichy powrot.

const RETENTION_MONTHS = 24;
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000; // nie czesciej niz raz na dobe
const ADVISORY_LOCK_KEY = 782341; // dowolna stala, byle taka sama przy kazdym wywolaniu

async function ensureRetentionTable(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS retention_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cutoff TIMESTAMPTZ NOT NULL,
      survey_anonymized INT NOT NULL DEFAULT 0,
      visits_anonymized INT NOT NULL DEFAULT 0,
      submissions_deleted INT NOT NULL DEFAULT 0,
      error TEXT
    )
  `);
}

// Wywolywane raz, wewnatrz uzyskanej blokady - liczy kandydatow PRZED
// modyfikacja (do logu), potem faktycznie anonimizuje/usuwa. `anonymized_at
// IS NULL` w warunku sprawia, ze funkcja jest bezpieczna do wielokrotnego
// wywolania: raz zanonimizowany wiersz nigdy nie jest przetwarzany ponownie.
async function runCleanup(client: PoolClient) {
  const cutoff = new Date(Date.now() - RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000);

  await client.query(`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ`);
  await client.query(`ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ`);

  const surveyResult = await client.query(
    `UPDATE survey_responses
     SET ip = NULL, city = NULL, region = NULL, country = NULL, user_agent = NULL,
         other_text = NULL, anonymized_at = NOW()
     WHERE created_at < $1 AND anonymized_at IS NULL
     RETURNING id`,
    [cutoff]
  );

  const visitsResult = await client.query(
    `UPDATE page_visits
     SET ip = NULL, user_agent = NULL, anonymized_at = NOW()
     WHERE created_at < $1 AND anonymized_at IS NULL
     RETURNING id`,
    [cutoff]
  );

  const submissionsResult = await client.query(
    `DELETE FROM submissions WHERE date < $1 RETURNING id`,
    [cutoff]
  );

  return {
    cutoff,
    surveyAnonymized: surveyResult.rows.length,
    visitsAnonymized: visitsResult.rows.length,
    submissionsDeleted: submissionsResult.rows.length,
  };
}

// Wywolanie z tras API (fire-and-forget w duchu - blad nigdy nie wychodzi na
// zewnatrz). Zwraca true, jesli faktycznie odpalilo sprzatanie (przydatne w
// testach), false gdy pominieto (throttle/zajeta blokada/blad).
export async function maybeRunRetentionCleanup(): Promise<boolean> {
  let client: PoolClient;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("[retention] Brak polaczenia do sprawdzenia harmonogramu:", err);
    return false;
  }

  try {
    await ensureRetentionTable(client);

    const last = await client.query(
      `SELECT run_at FROM retention_runs ORDER BY run_at DESC LIMIT 1`
    );
    if (last.rows[0] && Date.now() - new Date(last.rows[0].run_at).getTime() < MIN_INTERVAL_MS) {
      return false; // ostatni przebieg byl niedawno - nic do roboty
    }

    const lockResult = await client.query(`SELECT pg_try_advisory_lock($1) AS locked`, [ADVISORY_LOCK_KEY]);
    if (!lockResult.rows[0].locked) {
      return false; // inny request/instancja juz sprzata
    }

    try {
      const { cutoff, surveyAnonymized, visitsAnonymized, submissionsDeleted } = await runCleanup(client);
      await client.query(
        `INSERT INTO retention_runs (cutoff, survey_anonymized, visits_anonymized, submissions_deleted)
         VALUES ($1, $2, $3, $4)`,
        [cutoff, surveyAnonymized, visitsAnonymized, submissionsDeleted]
      );
      if (surveyAnonymized || visitsAnonymized || submissionsDeleted) {
        console.log(
          `[retention] Przebieg zakonczony: ankiety=${surveyAnonymized}, wizyty=${visitsAnonymized}, zgloszenia usuniete=${submissionsDeleted}`
        );
      }
      return true;
    } catch (err) {
      console.error("[retention] Blad podczas sprzatania danych:", err);
      await client
        .query(
          `INSERT INTO retention_runs (cutoff, error) VALUES ($1, $2)`,
          [new Date(Date.now() - RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000), String(err)]
        )
        .catch(() => {});
      return false;
    } finally {
      await client.query(`SELECT pg_advisory_unlock($1)`, [ADVISORY_LOCK_KEY]).catch(() => {});
    }
  } catch (err) {
    console.error("[retention] Nieoczekiwany blad harmonogramu:", err);
    return false;
  } finally {
    client.release();
  }
}

// Ostatni przebieg do wyswietlenia w /admin - osobna, szybka funkcja tylko do
// odczytu (nie dotyka blokady ani throttlingu).
export async function getLastRetentionRun() {
  const client = await pool.connect();
  try {
    await ensureRetentionTable(client);
    const result = await client.query(
      `SELECT run_at, cutoff, survey_anonymized, visits_anonymized, submissions_deleted, error
       FROM retention_runs ORDER BY run_at DESC LIMIT 1`
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}
