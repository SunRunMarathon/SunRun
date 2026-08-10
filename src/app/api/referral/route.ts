import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { createReferral, ensureReferralTables, type Referral } from "@/lib/referrals-db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const startNumber = String(body.startNumber ?? "").trim().slice(0, 50);

  if (!name || !email || !startNumber) {
    return Response.json({ error: "Wypełnij wszystkie pola" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Nieprawidłowy adres e-mail" }, { status: 400 });
  }

  try {
    const code = await createReferral({ name, email, startNumber });
    return Response.json({ code });
  } catch (err) {
    console.error("[referral] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Panel admina - lista wszystkich kodow z licznikiem (auth wymagane).
export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureReferralTables();
    const result = await queryWithRetry<Referral>(
      `SELECT id, created_at, code, inviter_name, inviter_email, inviter_start_number, verified
       FROM referrals ORDER BY created_at DESC`
    );
    return Response.json({ referrals: result.rows });
  } catch (err) {
    console.error("[referral] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Admin oznacza numer startowy jako zweryfikowany (recznie, po sprawdzeniu w FRS).
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
    await ensureReferralTables();
    await queryWithRetry(`UPDATE referrals SET verified = $1 WHERE id = $2`, [verified, id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[referral] Aktualizacja nieudana po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
