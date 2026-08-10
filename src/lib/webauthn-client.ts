import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";

export { browserSupportsWebAuthn };

// Logowanie kluczem: pobiera opcje z serwera, prosi przeglądarkę o podpis,
// odsyła do weryfikacji. Rzuca Error z czytelnym komunikatem po polsku przy
// odmowie/anulowaniu przez użytkownika.
export async function loginWithPasskey(): Promise<string> {
  const optionsRes = await fetch("/api/admin/webauthn/login-options", { method: "POST" });
  if (!optionsRes.ok) throw new Error("Nie udało się rozpocząć logowania kluczem");
  const { options, challengeToken } = await optionsRes.json();

  let response;
  try {
    response = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    // Prawdziwy blad (np. SecurityError przy niezgodnym rpID) trafial dotad
    // wylacznie do generycznego komunikatu ponizej, bez sladu w konsoli - stad
    // trudno bylo odroznic realne "anulowane przez uzytkownika" od bledu
    // konfiguracji. console.error nie zmienia zachowania dla uzytkownika,
    // tylko zostawia slad do diagnozy.
    console.error("WebAuthn logowanie - blad przegladarki:", err);
    throw new Error("Logowanie kluczem anulowane lub nieudane");
  }

  const verifyRes = await fetch("/api/admin/webauthn/login-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response, challengeToken }),
  });
  const data = await verifyRes.json();
  if (!verifyRes.ok || !data.token) {
    throw new Error(data.error || "Logowanie kluczem nie powiodło się");
  }
  return data.token as string;
}

// Rejestracja nowego klucza - wymaga już aktywnej sesji (token).
export async function registerPasskey(sessionToken: string, deviceName: string): Promise<void> {
  const optionsRes = await fetch("/api/admin/webauthn/register-options", {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!optionsRes.ok) throw new Error("Nie udało się rozpocząć rejestracji klucza");
  const { options, challengeToken } = await optionsRes.json();

  let response;
  try {
    response = await startRegistration({ optionsJSON: options });
  } catch (err) {
    console.error("WebAuthn rejestracja - blad przegladarki:", err);
    throw new Error("Rejestracja klucza anulowana lub nieudana");
  }

  const verifyRes = await fetch("/api/admin/webauthn/register-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify({ response, challengeToken, deviceName }),
  });
  const data = await verifyRes.json();
  if (!verifyRes.ok) {
    throw new Error(data.error || "Rejestracja klucza nie powiodła się");
  }
}
