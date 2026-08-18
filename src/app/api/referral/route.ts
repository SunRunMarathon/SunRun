import { Resend } from "resend";
import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { createReferral, ensureReferralTables, type Referral } from "@/lib/referrals-db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunrun.pl";

// Potwierdzenie mailowe dla zapraszajacego, zeby mial link "na trwale" (nie
// tylko w oknie przegladarki) i wiedzial, ze go zapisalismy. TODO (Frogo,
// patrz notatka w PR/changelogu): dopoki RESEND_API_KEY nie jest ustawiony
// w Railway, ta funkcja tylko loguje ostrzezenie i nic nie wysyla - reszta
// funkcji (link, tracking, panel admina) dziala juz teraz bez tego.
async function sendConfirmationEmail(params: { email: string; name: string; code: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[referral] RESEND_API_KEY nie ustawiony - pominięto mail potwierdzający");
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = `${SITE_URL}/zaproszenie/${params.code}`;
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Sun Run <onboarding@resend.dev>",
      to: params.email,
      subject: "Twój link do zapraszania znajomych na Sun Run jest gotowy!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #183153;">Cześć ${params.name}!</h1>
          <p style="color: #183153; font-size: 16px; line-height: 1.6;">
            Twój osobisty link do zapraszania znajomych na <strong>Sun Run</strong> jest gotowy.
            Wyślij go, komu chcesz - Messenger, Instagram, SMS, cokolwiek Ci pasuje.
          </p>
          <a href="${link}" style="display: inline-block; margin-top: 8px; padding: 14px 28px; background: #FE8004; color: #183153; font-weight: 800; text-decoration: none; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${link}
          </a>
          <p style="color: #3D4D65; font-size: 14px; line-height: 1.6; margin-top: 24px;">
            Twój numer startowy zweryfikujemy w tle - link działa już teraz, nie musisz na nic czekać.
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Zapis w bazie juz sie udal - brak maila nie moze zepsuc odpowiedzi dla usera.
    console.error("[referral] Wysyłka maila potwierdzającego nieudana:", err);
  }
}

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
  const invitedEmail = String(body.invitedEmail ?? "").trim().slice(0, 200);

  if (!name || !email || !startNumber || !invitedEmail) {
    return Response.json({ error: "Wypełnij wszystkie pola" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || !EMAIL_RE.test(invitedEmail)) {
    return Response.json({ error: "Nieprawidłowy adres e-mail" }, { status: 400 });
  }

  try {
    const code = await createReferral({ name, email, startNumber, invitedEmail });
    // Fire-and-forget: brak/blad maila nie moze opoznic ani zepsuc odpowiedzi -
    // link juz istnieje w bazie i dziala, mail to tylko dodatkowe potwierdzenie.
    sendConfirmationEmail({ email, name, code }).catch(() => {});
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
      `SELECT id, created_at, code, inviter_name, inviter_email, inviter_start_number, invited_email, verified
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
