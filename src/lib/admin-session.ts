import crypto from "crypto";

// Sekret do podpisywania tokenow sesji i wyzwan WebAuthn. BEZ tego wszystkie
// tokeny sa nie do zweryfikowania - "fail closed", nie "fail open": brak
// zmiennej oznacza, ze NIKT sie nie zaloguje, a nie ze logowanie jest otwarte.
//
// Zeby wdrozenie tego systemu logowania NIE zablokowalo dostepu do /admin,
// zanim ktos recznie doda ADMIN_SESSION_SECRET w Railway, sekret spada do
// pochodnej z JUZ istniejacego ADMIN_PASSWORD (jest tajny i juz skonfigurowany
// na produkcji) zamiast pustego stringa. To wciaz prawdziwy, nieprzewidywalny
// dla atakujacego klucz podpisu - nie "otwarte na sciezaj". Docelowo lepiej
// ustawic dedykowany ADMIN_SESSION_SECRET (niezalezny od hasla logowania),
// ale system dziala bezpiecznie i bez tego.
function resolveSessionSecret(): string {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (process.env.ADMIN_PASSWORD) {
    return crypto
      .createHash("sha256")
      .update("sunrun-session-fallback:" + process.env.ADMIN_PASSWORD)
      .digest("hex");
  }
  return "";
}

const SESSION_SECRET = resolveSessionSecret();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minut na dokonczenie WebAuthn

// Do wyswietlenia jasnego komunikatu na ekranie logowania zamiast cichego,
// niewyjasnionego bledu - patrz uzycie w API routes logowania.
export function isSessionSigningConfigured(): boolean {
  return SESSION_SECRET.length > 0;
}

function hmac(payloadB64: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
}

function signPayload(payload: Record<string, unknown>): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${hmac(payloadB64)}`;
}

function verifyPayload<T extends { type: string; exp: number }>(token: string | null): T | null {
  if (!token || !SESSION_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  const expectedSig = hmac(payloadB64);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as T;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Token sesji (wydawany po udanym logowaniu kluczem LUB trzema sekretami) ──

export function issueSessionToken(): string {
  return signPayload({ type: "session", exp: Date.now() + SESSION_TTL_MS });
}

export function isValidSessionToken(token: string | null): boolean {
  const payload = verifyPayload<{ type: string; exp: number }>(token);
  return !!payload && payload.type === "session";
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

// Wspólny strażnik dla kazdego chronionego API route'a - zastępuje dawne
// porownanie z ADMIN_PASSWORD.
export function isAuthorizedRequest(request: Request): boolean {
  return isValidSessionToken(getBearerToken(request));
}

// ── Token wyzwania WebAuthn (laczy generateOptions -> verify bez trzymania ──
// ── stanu po stronie serwera; klient odsyla go razem z odpowiedzia).       ──

export function issueChallengeToken(challenge: string): string {
  return signPayload({ type: "webauthn-challenge", challenge, exp: Date.now() + CHALLENGE_TTL_MS });
}

export function verifyChallengeToken(token: string | null): string | null {
  const payload = verifyPayload<{ type: string; exp: number; challenge: string }>(token);
  if (!payload || payload.type !== "webauthn-challenge") return null;
  return payload.challenge;
}

// ── Porownanie w czasie stalym dla trzech sekretow (fallback logowania) ──

export function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // wciaz wykonaj porownanie tej samej dlugosci co aBuf, zeby nie zdradzic
    // przez czas odpowiedzi, ze dlugosc juz sie nie zgadza
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// ── Rate limiting logowania po IP (w pamięci procesu - wystarczające dla ──
// ── jednej instancji Railway; resetuje się przy redeployu/restarcie).    ──

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkAndConsumeRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

// RP ID / origin wyliczone z realnego requestu - dziala identycznie na
// localhost (dev) i na sunrun.pl (prod), bez osobnych zmiennych srodowiskowych.
export function getRpInfo(request: Request): { rpID: string; origin: string } {
  const url = new URL(request.url);
  return { rpID: url.hostname, origin: url.origin };
}
