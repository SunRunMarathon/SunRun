import { queryWithRetry } from "@/lib/db";
import { getClientIp, detectDeviceType, detectTrafficSource } from "@/lib/request-meta";
import { lookupGeoIp } from "@/lib/geo";
import { SURVEY_OPTIONS } from "@/lib/survey-options";
import { isAuthorizedRequest } from "@/lib/admin-session";
import crypto from "crypto";

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
  // Kolumna doszla po pierwszym wdrozeniu - ADD COLUMN IF NOT EXISTS bezpiecznie
  // dogania istniejace tabele na produkcji bez migracji recznej. Unikalny indeks
  // (a nie ograniczenie w CREATE TABLE) toleruje NULL-e w starych wierszach -
  // Postgres nie traktuje wielu NULL-i jako duplikatow.
  await queryWithRetry(`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS client_token UUID`);
  await queryWithRetry(
    `CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_client_token_key ON survey_responses (client_token)`
  );
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
  const validValues = SURVEY_OPTIONS.map((o) => o.value);
  if (!validValues.includes(answer)) {
    return Response.json({ error: "Nieprawidłowa odpowiedź" }, { status: 400 });
  }

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
        (answer, ip, city, region, country, referrer, traffic_source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path, client_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (client_token) DO NOTHING`,
      [
        answer,
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
      `SELECT id, created_at, answer, ip, city, region, country, referrer, traffic_source,
              utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path
       FROM survey_responses ORDER BY created_at DESC`
    );
    return Response.json({ responses: result.rows });
  } catch (err) {
    console.error("[survey] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
