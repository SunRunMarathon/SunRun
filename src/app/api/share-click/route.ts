import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import crypto from "crypto";

// Kanały udostępniania — liczone w /admin. Dodanie nowego kanału to jedna
// wartość tutaj (musi się zgadzać z tym, co wysyła ShareModal.tsx).
const VALID_CHANNELS = [
  "modal_open",
  "qr_download",
  "qr_copy",
  "twitter",
  "facebook",
  "copy_link",
  "native_share",
];

async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS share_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      channel VARCHAR(50) NOT NULL,
      landing_path VARCHAR(300)
    )
  `);
  await queryWithRetry(`ALTER TABLE share_clicks ADD COLUMN IF NOT EXISTS client_token UUID`);
  await queryWithRetry(
    `CREATE UNIQUE INDEX IF NOT EXISTS share_clicks_client_token_key ON share_clicks (client_token)`
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const channel = String(body.channel ?? "");
  if (!VALID_CHANNELS.includes(channel)) {
    return Response.json({ error: "Nieprawidłowy kanał" }, { status: 400 });
  }
  const landingPath =
    typeof body.landingPath === "string" ? body.landingPath.trim().slice(0, 300) : null;

  const clientToken = crypto.randomUUID();

  try {
    await ensureTable();
    await queryWithRetry(
      `INSERT INTO share_clicks (channel, landing_path, client_token) VALUES ($1, $2, $3)
       ON CONFLICT (client_token) DO NOTHING`,
      [channel, landingPath || null, clientToken]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[share-click] Zapis do bazy nieudany po ponowieniach:", err);
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
      `SELECT id, created_at, channel, landing_path FROM share_clicks ORDER BY created_at DESC`
    );
    return Response.json({ clicks: result.rows });
  } catch (err) {
    console.error("[share-click] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
