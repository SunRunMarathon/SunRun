import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";

const REGISTERED_COUNT_KEY = "registered_count";

async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS site_stats (
      key VARCHAR(100) PRIMARY KEY,
      value VARCHAR(200) NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// Publiczny odczyt - liczbę zapisanych osób wpisuje ręcznie admin (FRS nie ma
// publicznego API), więc strona główna tylko czyta tę wartość.
export async function GET() {
  try {
    await ensureTable();
    const result = await queryWithRetry(
      `SELECT value FROM site_stats WHERE key = $1`,
      [REGISTERED_COUNT_KEY]
    );
    return Response.json({ registeredCount: result.rows[0]?.value ?? null });
  } catch (err) {
    console.error("[stats] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ registeredCount: null }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const value = String(body.registeredCount ?? "").trim().slice(0, 200);
  if (!value || !/^\d+$/.test(value)) {
    return Response.json({ error: "Podaj liczbę całkowitą" }, { status: 400 });
  }

  try {
    await ensureTable();
    await queryWithRetry(
      `INSERT INTO site_stats (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [REGISTERED_COUNT_KEY, value]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[stats] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
