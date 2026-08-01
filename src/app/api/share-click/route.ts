import pool from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";

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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      channel VARCHAR(50) NOT NULL,
      landing_path VARCHAR(300)
    )
  `);
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

  try {
    await ensureTable();
    await pool.query(`INSERT INTO share_clicks (channel, landing_path) VALUES ($1, $2)`, [
      channel,
      landingPath || null,
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureTable();
    const result = await pool.query(
      `SELECT id, created_at, channel, landing_path FROM share_clicks ORDER BY created_at DESC`
    );
    return Response.json({ clicks: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
