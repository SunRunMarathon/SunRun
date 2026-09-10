import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { createRegistration, ensureRegistrationsTable, type Registration } from "@/lib/registrations-db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_YEAR = 2026;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const birthYear = Number(body.birthYear);

  if (!fullName || !email || !birthYear) {
    return Response.json({ error: "Wypełnij wszystkie pola" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Nieprawidłowy adres e-mail" }, { status: 400 });
  }
  if (!Number.isInteger(birthYear) || birthYear < CURRENT_YEAR - 110 || birthYear > CURRENT_YEAR) {
    return Response.json({ error: "Nieprawidłowy rok urodzenia" }, { status: 400 });
  }

  try {
    await createRegistration({ fullName, email, birthYear });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[registration] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Panel admina - lista wszystkich zgloszen (auth wymagane).
export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureRegistrationsTable();
    const result = await queryWithRetry<Registration>(
      `SELECT id, created_at, full_name, email, birth_year, verified
       FROM registrations ORDER BY created_at DESC`
    );
    return Response.json({ registrations: result.rows });
  } catch (err) {
    console.error("[registration] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Admin oznacza zgloszenie jako zweryfikowane (recznie, np. po obecnosci na biegu).
export async function PATCH(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return Response.json({ error: "Brak id" }, { status: 400 });
  }
  const verified = Boolean(body.verified);

  try {
    await ensureRegistrationsTable();
    await queryWithRetry(`UPDATE registrations SET verified = $1 WHERE id = $2`, [verified, id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[registration] Aktualizacja nieudana po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
