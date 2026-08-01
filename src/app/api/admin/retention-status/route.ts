import { isAuthorizedRequest } from "@/lib/admin-session";
import { getLastRetentionRun } from "@/lib/retention";

// Odczyt ostatniego przebiegu automatycznego czyszczenia danych (patrz
// src/lib/retention.ts) - zeby dalo sie to zweryfikowac z panelu /admin bez
// zagladania recznie do bazy.
export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    const lastRun = await getLastRetentionRun();
    return Response.json({ lastRun });
  } catch (err) {
    console.error("[retention-status] Odczyt nieudany:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
