import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";

// Sam wybor w banerze cookies (Akceptuje/Odrzuc) - CELOWO bez visitor_id/IP,
// zaden inny dane. To pomiar skutecznosci banera, nie sledzenie zachowania
// uzytkownika, wiec dziala NIEZALEZNIE od samej zgody (inaczej nigdy nie
// zobaczylibysmy, ile osob klika "Odrzuc" - to by wymagalo zgody na
// tracking wyboru "brak zgody na tracking", co jest bez sensu). Odpowiada
// wprost na pytanie "dlaczego tak malo danych w GA/page_visits" - oba sa
// zalezne od tej zgody (patrz CookieConsent.tsx, GoogleAnalytics.tsx,
// VisitTracker.tsx), wiec wysoki odsetek "Odrzuc" to najbardziej
// prawdopodobne wyjasnienie pustych raportow, nie blad w kodzie.
const VALID_CHOICES = ["granted", "denied"];

async function ensureTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS consent_choices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      choice VARCHAR(10) NOT NULL
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

  const choice = String(body.choice ?? "");
  if (!VALID_CHOICES.includes(choice)) {
    return Response.json({ error: "Nieprawidłowy wybór" }, { status: 400 });
  }

  try {
    await ensureTable();
    await queryWithRetry(`INSERT INTO consent_choices (choice) VALUES ($1)`, [choice]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[consent-choice] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureTable();
    const result = await queryWithRetry<{ choice: string; created_at: string }>(
      `SELECT choice, created_at FROM consent_choices ORDER BY created_at DESC`
    );
    return Response.json({ choices: result.rows });
  } catch (err) {
    console.error("[consent-choice] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
