import { queryWithRetry } from "@/lib/db";
import { getClientIp, detectDeviceType, detectTrafficSource } from "@/lib/request-meta";
import { lookupGeoIp } from "@/lib/geo";
import { SURVEY_OPTIONS } from "@/lib/survey-options";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { maybeRunRetentionCleanup } from "@/lib/retention";
import crypto from "crypto";

function findOption(value: string) {
  return SURVEY_OPTIONS.find((o) => o.value === value) || null;
}

async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      answer VARCHAR(100) NOT NULL,
      ip VARCHAR(64),
      city VARCHAR(120),
      region VARCHAR(120),
      country VARCHAR(120),
      referrer TEXT,
      traffic_source VARCHAR(100),
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(150),
      utm_content VARCHAR(150),
      utm_term VARCHAR(150),
      user_agent TEXT,
      device_type VARCHAR(20),
      landing_path VARCHAR(300)
    )
  `);
  // Kolumny doszly po pierwszym wdrozeniu - ADD COLUMN IF NOT EXISTS bezpiecznie
  // dogania istniejace tabele na produkcji bez migracji recznej i bez utraty
  // juz zebranych odpowiedzi (stare wiersze dostaja po prostu NULL w nowych
  // kolumnach). Unikalny indeks na client_token toleruje NULL-e w starych
  // wierszach - Postgres nie traktuje wielu NULL-i jako duplikatow.
  await queryWithRetry(`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS client_token UUID`);
  await queryWithRetry(
    `CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_client_token_key ON survey_responses (client_token)`
  );
  // answer_detail = doprecyzowanie w ramach odpowiedzi glownej (np. ktore
  // medium spolecznosciowe). other_text = wolny tekst przy "Inne", na
  // dowolnym poziomie pytania. Oba opcjonalne.
  await queryWithRetry(`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS answer_detail VARCHAR(100)`);
  await queryWithRetry(`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS other_text VARCHAR(200)`);
}

function str(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const answer = String(body.answer ?? "").trim();
  const mainOption = findOption(answer);
  if (!mainOption) {
    return Response.json({ error: "Nieprawidłowa odpowiedź" }, { status: 400 });
  }

  // Doprecyzowanie ma sens tylko dla opcji, ktora faktycznie ma podpytanie
  // (np. "Media spolecznosciowe" -> TikTok/Instagram/Facebook/Inne) - w
  // kazdym innym przypadku ignorujemy to pole zamiast odrzucac caly request,
  // zeby nieoczekiwana wartosc z klienta nie zablokowala zapisu reszty.
  const rawDetail = str(body.answerDetail, 100);
  const answerDetail =
    mainOption.subOptions && rawDetail && mainOption.subOptions.some((o) => o.value === rawDetail)
      ? rawDetail
      : null;
  const otherText = str(body.otherText, 200);

  const referrer = str(body.referrer, 2000);
  const utmSource = str(body.utmSource, 100);
  const utmMedium = str(body.utmMedium, 100);
  const utmCampaign = str(body.utmCampaign, 150);
  const utmContent = str(body.utmContent, 150);
  const utmTerm = str(body.utmTerm, 150);
  const landingPath = str(body.landingPath, 300);

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const deviceType = detectDeviceType(userAgent);
  const trafficSource = detectTrafficSource({ utmSource, referrer });
  const geo = await lookupGeoIp(ip);

  // Wygenerowany raz, przed retry - jesli pierwsza proba INSERT-a faktycznie
  // dotrze do bazy, ale odpowiedz zgubi sie po drodze (np. zerwane polaczenie
  // w trakcie budzenia Postgresa), kolejna proba z tym samym tokenem trafi w
  // ON CONFLICT DO NOTHING zamiast zdublowac wiersz.
  const clientToken = crypto.randomUUID();

  try {
    await ensureTable();
    await queryWithRetry(
      `INSERT INTO survey_responses
        (answer, answer_detail, other_text, ip, city, region, country, referrer, traffic_source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path, client_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (client_token) DO NOTHING`,
      [
        answer,
        answerDetail,
        otherText,
        ip,
        geo.city,
        geo.region,
        geo.country,
        referrer,
        trafficSource,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        userAgent,
        deviceType,
        landingPath,
        clientToken,
      ]
    );
    // Leniwe wyzwolenie sprzatania danych starszych niz 24 miesiace (patrz
    // src/lib/retention.ts) - celowo bez await: serwer Next.js na Railway to
    // dlugo dzialajacy proces (nie funkcja serverless znikajaca zaraz po
    // odpowiedzi), wiec dokonczy sie w tle. Throttling i blokada w srodku
    // sprawiaja, ze w 99% wywolan to i tak tylko jeden szybki SELECT.
    maybeRunRetentionCleanup().catch(() => {});
    return Response.json({ ok: true });
  } catch (err) {
    // Zapis sie nie udal nawet po ponowieniach - jawny, grepowalny slad w
    // logach Railway, zeby dalo sie policzyc utracone ankiety.
    console.error("[survey] Zapis do bazy nieudany po ponowieniach:", err);
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
      `SELECT id, created_at, answer, answer_detail, other_text, ip, city, region, country, referrer, traffic_source,
              utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path
       FROM survey_responses ORDER BY created_at DESC`
    );
    return Response.json({ responses: result.rows });
  } catch (err) {
    console.error("[survey] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
