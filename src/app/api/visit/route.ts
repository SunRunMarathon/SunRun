import { queryWithRetry } from "@/lib/db";
import { getClientIp, detectDeviceType, detectTrafficSource } from "@/lib/request-meta";
import { isAuthorizedRequest } from "@/lib/admin-session";
import crypto from "crypto";

// Licznik wejść na stronę główną — pozwala policzyć conversion rate ankiety
// (wypełnienia / wejścia) w /admin. Odpalany dopiero po zgodzie na analitykę
// (patrz VisitTracker + consent.ts), więc nie zawiera geolokalizacji — to
// czysto ilościowy licznik, bez dodatkowego zapytania do zewnętrznego API
// przy każdym wejściu.
async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip VARCHAR(64),
      referrer TEXT,
      traffic_source VARCHAR(100),
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(150),
      user_agent TEXT,
      device_type VARCHAR(20),
      landing_path VARCHAR(300)
    )
  `);
  await queryWithRetry(`ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS client_token UUID`);
  await queryWithRetry(
    `CREATE UNIQUE INDEX IF NOT EXISTS page_visits_client_token_key ON page_visits (client_token)`
  );
}

function str(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // brak/uszkodzone body — logujemy wejście i tak, po prostu bez metadanych
  }

  const referrer = str(body.referrer, 2000);
  const utmSource = str(body.utmSource, 100);
  const utmMedium = str(body.utmMedium, 100);
  const utmCampaign = str(body.utmCampaign, 150);
  const landingPath = str(body.landingPath, 300);

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const deviceType = detectDeviceType(userAgent);
  const trafficSource = detectTrafficSource({ utmSource, referrer });

  const clientToken = crypto.randomUUID();

  try {
    await ensureTable();
    await queryWithRetry(
      `INSERT INTO page_visits (ip, referrer, traffic_source, utm_source, utm_medium, utm_campaign, user_agent, device_type, landing_path, client_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (client_token) DO NOTHING`,
      [ip, referrer, trafficSource, utmSource, utmMedium, utmCampaign, userAgent, deviceType, landingPath, clientToken]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[visit] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureTable();
    const result = await queryWithRetry(`SELECT COUNT(*)::int AS count FROM page_visits`);
    return Response.json({ count: result.rows[0].count });
  } catch (err) {
    console.error("[visit] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
