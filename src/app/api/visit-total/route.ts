import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";

// Absolutnie minimalny licznik wejsc - SAM FAKT, ze ktos wszedl na strone,
// bez zadnych danych osobowych (IP, user-agent, UTM, urzadzenie) i bez
// zadnego identyfikatora zapisywanego w przegladarce. Dziala dlatego
// NIEZALEZNIE od zgody z bannera cookies (patrz VisitTracker.tsx) -
// inaczej niz page_visits (bogaty, ale wymaga zgody, bo zawiera dane
// pozwalajace zidentyfikowac odwiedzajacego).
//
// Uzasadnienie: pusty, anonimowy wiersz (samo id + znacznik czasu) nie
// pozwala zidentyfikowac zadnej osoby (art. 4 ust. 1 RODO), wiec RODO w
// ogole nie dotyczy tego przetwarzania. Zero zapisu na urzadzeniu
// uzytkownika oznacza tez, ze nie dotyczy tego art. 173 Prawa
// telekomunikacyjnego (ePrivacy) - stad brak wymogu zgody z bannera.
async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS page_visits_total (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST() {
  try {
    await ensureTable();
    await queryWithRetry(`INSERT INTO page_visits_total DEFAULT VALUES`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[visit-total] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureTable();
    const result = await queryWithRetry(
      `SELECT COUNT(*)::int AS count FROM page_visits_total`
    );
    const rows = await queryWithRetry(
      `SELECT created_at FROM page_visits_total ORDER BY created_at DESC`
    );
    return Response.json({ count: result.rows[0].count, visits: rows.rows });
  } catch (err) {
    console.error("[visit-total] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
