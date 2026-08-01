import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { saveCredential } from "@/lib/admin-credentials-db";
import { getRpInfo, isAuthorizedRequest, verifyChallengeToken } from "@/lib/admin-session";

export async function POST(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  let body: { response?: RegistrationResponseJSON; challengeToken?: string; deviceName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const expectedChallenge = verifyChallengeToken(body.challengeToken ?? null);
  if (!expectedChallenge || !body.response) {
    return Response.json({ error: "Wyzwanie wygasło, spróbuj ponownie" }, { status: 400 });
  }

  const { rpID, origin } = getRpInfo(request);

  try {
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: "Weryfikacja nie powiodła się" }, { status: 400 });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const deviceName =
      typeof body.deviceName === "string" && body.deviceName.trim()
        ? body.deviceName.trim().slice(0, 100)
        : "Klucz bezpieczeństwa";

    await saveCredential({
      credential,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      deviceName,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("WebAuthn register-verify error:", err);
    return Response.json({ error: "Weryfikacja nie powiodła się" }, { status: 400 });
  }
}
