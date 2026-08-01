import { getClientIp } from "@/lib/request-meta";
import {
  checkAndConsumeRateLimit,
  isSessionSigningConfigured,
  issueSessionToken,
  timingSafeStringEqual,
} from "@/lib/admin-session";

// Logowanie zapasowe (bez klucza dostepu). Docelowy wariant to trzy sekrety
// PRZYPISANE NA STALE do koloru (nie do pozycji pola - kolejnosc pol w
// formularzu jest losowana przy kazdym wejsciu, patrz admin/page.tsx), ale
// zeby wdrozenie tego systemu logowania nie zablokowalo dostepu do /admin
// zanim ktos rekonfiguruje Railway, dziala tez tryb "legacy" na juz
// istniejacym ADMIN_PASSWORD - dokladnie to samo haslo, co dzialalo wczesniej.
// GET mowi frontendowi, ktory z trybow jest naprawde skonfigurowany, zeby
// formularz logowania pokazal wlasciwe pola zamiast zgadywac.
// Ustaw w Railway (docelowo): ADMIN_SECRET_RED, ADMIN_SECRET_GREEN,
// ADMIN_SECRET_YELLOW, ADMIN_SESSION_SECRET (do podpisu tokenu sesji).
const SECRETS: Record<"red" | "green" | "yellow", string | undefined> = {
  red: process.env.ADMIN_SECRET_RED,
  green: process.env.ADMIN_SECRET_GREEN,
  yellow: process.env.ADMIN_SECRET_YELLOW,
};

function tripleConfigured(): boolean {
  return !!(SECRETS.red && SECRETS.green && SECRETS.yellow);
}

function legacyConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

// Frontend odpytuje to przy wejsciu na ekran logowania, zeby wiedziec, czy
// pokazac jedno stare pole hasla, czy trzy kolorowe. Same wartosci sekretow
// nigdy nie wychodza poza ten plik - tylko informacja "czy sa ustawione".
export async function GET() {
  return Response.json({
    tripleConfigured: tripleConfigured(),
    legacyConfigured: legacyConfigured(),
    sessionSigningConfigured: isSessionSigningConfigured(),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request) || "unknown";
  if (!checkAndConsumeRateLimit(ip)) {
    return Response.json(
      { error: "Zbyt wiele prób logowania. Spróbuj ponownie później." },
      { status: 429 }
    );
  }

  if (!isSessionSigningConfigured()) {
    console.error(
      "Logowanie niedostępne: brak ADMIN_SESSION_SECRET i ADMIN_PASSWORD w środowisku (żadnego nie da się użyć do podpisu sesji)."
    );
    return Response.json(
      { error: "Logowanie chwilowo niedostępne - brak konfiguracji serwera" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 400 });
  }

  // Tryb zapasowy nr 1 (docelowy): trzy kolorowe sekrety.
  if (typeof body.red === "string" || typeof body.green === "string" || typeof body.yellow === "string") {
    if (!tripleConfigured()) {
      console.error("Brak skonfigurowanych ADMIN_SECRET_* w środowisku");
      return Response.json({ error: "Logowanie chwilowo niedostępne" }, { status: 500 });
    }

    const red = typeof body.red === "string" ? body.red : "";
    const green = typeof body.green === "string" ? body.green : "";
    const yellow = typeof body.yellow === "string" ? body.yellow : "";

    // Zawsze porownaj WSZYSTKIE trzy pola (nie przerywaj na pierwszym bledzie) -
    // inaczej czas odpowiedzi zdradzalby, ktore pole jest pierwsze zle.
    const redOk = timingSafeStringEqual(red, SECRETS.red!);
    const greenOk = timingSafeStringEqual(green, SECRETS.green!);
    const yellowOk = timingSafeStringEqual(yellow, SECRETS.yellow!);

    if (!redOk || !greenOk || !yellowOk) {
      return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
    }

    return Response.json({ token: issueSessionToken() });
  }

  // Tryb zapasowy nr 2 (dotychczasowy): pojedyncze haslo z ADMIN_PASSWORD -
  // dziala od razu na produkcji, bez zadnych nowych zmiennych w Railway.
  if (typeof body.legacyPassword === "string") {
    if (!legacyConfigured()) {
      console.error("Brak skonfigurowanego ADMIN_PASSWORD w środowisku");
      return Response.json({ error: "Logowanie chwilowo niedostępne" }, { status: 500 });
    }

    const ok = timingSafeStringEqual(body.legacyPassword, process.env.ADMIN_PASSWORD!);
    if (!ok) {
      return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 401 });
    }

    return Response.json({ token: issueSessionToken() });
  }

  return Response.json({ error: "Nieprawidłowe dane logowania" }, { status: 400 });
}
