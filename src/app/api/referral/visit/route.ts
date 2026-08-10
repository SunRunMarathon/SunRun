import { queryWithRetry } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/admin-session";
import { detectDeviceType } from "@/lib/request-meta";
import { ensureReferralTables, type ReferralHit } from "@/lib/referrals-db";

// Wejscie na /zaproszenie/[code] - osobna tabela od page_visits, zeby nie
// mieszac ruchu ogolnego ze specyficznym dla polecen (patrz korelacja w
// ReferralsDashboard.tsx: wejscia z tej tabeli vs klikniecia "Zapisz sie"
// z interaction_clicks, po tym samym visitor_id).
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().slice(0, 20);
  const visitorId = String(body.visitorId ?? "").trim().slice(0, 100);
  if (!code) {
    return Response.json({ error: "Brak kodu" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  const deviceType = detectDeviceType(userAgent);

  try {
    await ensureReferralTables();
    await queryWithRetry(
      `INSERT INTO referral_hits (code, visitor_id, device_type) VALUES ($1, $2, $3)`,
      [code, visitorId || null, deviceType]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[referral/visit] Zapis do bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  try {
    await ensureReferralTables();
    const result = await queryWithRetry<ReferralHit>(
      `SELECT id, created_at, code, visitor_id, device_type FROM referral_hits ORDER BY created_at DESC`
    );
    return Response.json({ hits: result.rows });
  } catch (err) {
    console.error("[referral/visit] Odczyt z bazy nieudany po ponowieniach:", err);
    return Response.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
