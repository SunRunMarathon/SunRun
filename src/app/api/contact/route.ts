import pool from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      company VARCHAR(200) NOT NULL,
      name VARCHAR(200) NOT NULL,
      phone VARCHAR(50),
      message TEXT NOT NULL
    )
  `);
}

function isAuthorized(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${ADMIN_PASSWORD}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const company = String(body.company ?? "").trim().slice(0, 200);
  const name = String(body.name ?? "").trim().slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 50);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!company || !name || !message) {
    return Response.json({ error: "Wypełnij wymagane pola" }, { status: 400 });
  }

  try {
    await ensureTable();
    await pool.query(
      "INSERT INTO submissions (company, name, phone, message) VALUES ($1, $2, $3, $4)",
      [company, name, phone || null, message]
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
      "SELECT id, date, company, name, phone, message FROM submissions ORDER BY date DESC"
    );
    return Response.json({ submissions: result.rows });
  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
