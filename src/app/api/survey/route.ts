import pool from "@/lib/db";
import { getClientIp, detectDeviceType, detectTrafficSource } from "@/lib/request-meta";
import { lookupGeoIp } from "@/lib/geo";
import { SURVEY_OPTIONS } from "@/lib/survey-options";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

async function ensureTable() {
  await pool.query(`
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
}

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${ADMIN_PASSWORD}`;
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

  try {
    await ensureTable();
    await pool.query(
      `INSERT INTO survey_responses
        (answer, ip, city, region, country, referrer, traffic_source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
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
      ]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureTable();
    const result = await pool.query(
      `SELECT id, created_at, answer, ip, city, region, country, referrer, traffic_source,
              utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, device_type, landing_path
       FROM survey_responses ORDER BY created_at DESC`
    );
    return Response.json({ responses: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
