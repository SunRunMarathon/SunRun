import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import crypto from "crypto";

// Kliknięcia w przyciski "Zapisz się" (wg lokalizacji na stronie) i w linki
// social media (wg platformy) — liczone w /admin. Wzorem share-click/route.ts:
// jedna wspólna tabela z kolumną category rozróżniającą typ zdarzenia, żeby
// nie duplikować identycznego mechanizmu (ensureTable/POST/GET) dwa razy.
const VALID_CATEGORIES = ["signup", "social"];
const VALID_LOCATIONS = [
  // category: signup — gdzie na stronie stoi przycisk "Zapisz się"
  "navbar",
  "sticky_bar",
  "hero",
  "footer",
  "archiwum",
  "referral",
  // category: social — platforma, w którą kliknięto
  "instagram",
  "facebook",
  "tiktok",
];

async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS interaction_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      category VARCHAR(20) NOT NULL,
      location VARCHAR(30) NOT NULL,
      landing_path VARCHAR(300)
    )
  `);
  await queryWithRetry(`ALTER TABLE interaction_clicks ADD COLUMN IF NOT EXISTS client_token UUID`);
  await queryWithRetry(
    `CREATE UNIQUE INDEX IF NOT EXISTS interaction_clicks_client_token_key ON interaction_clicks (client_token)`
  );
  // visitor_id = ten sam trwały UUID przeglądarki co survey_responses.visitor_id
  // (lib/visitor-id.ts) - pozwala w /admin połączyć kliknięcie "Zapisz się"
  // z wcześniejszą odpowiedzią w ankiecie tej samej osoby. Zwykła kolumna do
  // JOIN-a po stronie klienta, nie klucz deduplikacji (to nadal client_token).
  await queryWithRetry(`ALTER TABLE interaction_clicks ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(100)`);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const category = String(body.category ?? "");
  const location = String(body.location ?? "");
  if (!VALID_CATEGORIES.includes(category) || !VALID_LOCATIONS.includes(location)) {
    return Response.json({ error: "Nieprawidłowa kategoria lub lokalizacja" }, { status: 400 });
  }
  const landingPath =
    typeof body.landingPath === "string" ? body.landingPath.trim().slice(0, 300) : null;
  const visitorId =
    typeof body.visitorId === "string" ? body.visitorId.trim().slice(0, 100) : null;

  const clientToken = crypto.randomUUID();

  try {
    await ensureTable();
    await queryWithRetry(
      `INSERT INTO interaction_clicks (category, location, landing_path, client_token, visitor_id) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (client_token) DO NOTHING`,
      [category, location, landingPath || null, clientToken, visitorId || null]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[interaction-click] Zapis do bazy nieudany po ponowieniach:", err);
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
      `SELECT id, created_at, category, location, landing_path, visitor_id FROM interaction_clicks ORDER BY created_at DESC`
    );
    return Response.json({ clicks: result.rows });
  } catch (err) {
    console.error("[interaction-click] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
