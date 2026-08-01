import { getClientIp } from "@/lib/request-meta";
import {
  checkAndConsumeRateLimit,
  issueSessionToken,
  timingSafeStringEqual,
} from "@/lib/admin-session";

// Logowanie zapasowe: trzy sekrety trzymane w zmiennych srodowiskowych,
// PRZYPISANE NA STALE do koloru (nie do pozycji pola - kolejnosc pol w
// formularzu jest losowana przy kazdym wejsciu, patrz admin/page.tsx).
// Kazdy z trzech musi sie zgadzac, porownanie w czasie stalym, limit prob
// po IP. Ustaw w Railway: ADMIN_SECRET_RED, ADMIN_SECRET_GREEN,
// ADMIN_SECRET_YELLOW, ADMIN_SESSION_SECRET (do podpisu tokenu sesji).
const SECRETS: Record<"red" | "green" | "yellow", string | undefined> = {
  red: process.env.ADMIN_SECRET_RED,
  green: process.env.ADMIN_SECRET_GREEN,
  yellow: process.env.ADMIN_SECRET_YELLOW,
};

export async function POST(request: Request) {
  const ip = getClientIp(request) || "unknown";
  if (!checkAndConsumeRateLimit(ip)) {
    return Response.json(
      { error: "Zbyt wiele prób logowania. Spróbuj ponownie później." },
      { status: 429 }
    );
  }

  if (!SECRETS.red || !SECRETS.green || !SECRETS.yellow) {
    console.error("Brak skonfigurowanych ADMIN_SECRET_* w środowisku");
    return Response.json({ error: "Logowanie chwilowo niedostępne" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 400 });
  }

  const red = typeof body.red === "string" ? body.red : "";
  const green = typeof body.green === "string" ? body.green : "";
  const yellow = typeof body.yellow === "string" ? body.yellow : "";

  // Zawsze porownaj WSZYSTKIE trzy pola (nie przerywaj na pierwszym bledzie) -
  // inaczej czas odpowiedzi zdradzalby, ktore pole jest pierwsze zle.
  const redOk = timingSafeStringEqual(red, SECRETS.red);
  const greenOk = timingSafeStringEqual(green, SECRETS.green);
  const yellowOk = timingSafeStringEqual(yellow, SECRETS.yellow);

  if (!redOk || !greenOk || !yellowOk) {
    return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
  }

  return Response.json({ token: issueSessionToken() });
}
