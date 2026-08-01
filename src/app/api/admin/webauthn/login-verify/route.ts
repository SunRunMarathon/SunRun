import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { findCredentialById, toWebAuthnCredential, updateCredentialCounter } from "@/lib/admin-credentials-db";
import { getClientIp } from "@/lib/request-meta";
import {
  checkAndConsumeRateLimit,
  getRpInfo,
  issueSessionToken,
  verifyChallengeToken,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const ip = getClientIp(request) || "unknown";
  if (!checkAndConsumeRateLimit(ip)) {
    return Response.json({ error: "Zbyt wiele prób logowania." }, { status: 429 });
  }

  let body: { response?: AuthenticationResponseJSON; challengeToken?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const expectedChallenge = verifyChallengeToken(body.challengeToken ?? null);
  if (!expectedChallenge || !body.response) {
    return Response.json({ error: "Wyzwanie wygasło, spróbuj ponownie" }, { status: 400 });
  }

  const stored = await findCredentialById(body.response.id);
  if (!stored) {
    return Response.json({ error: "Nieznany klucz bezpieczeństwa" }, { status: 401 });
  }

  const { rpID, origin } = getRpInfo(request);

  try {
    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: toWebAuthnCredential(stored),
    });

    if (!verification.verified) {
      return Response.json({ error: "Weryfikacja nie powiodła się" }, { status: 401 });
    }

    await updateCredentialCounter(stored.credential_id, verification.authenticationInfo.newCounter);
    return Response.json({ token: issueSessionToken() });
  } catch (err) {
    console.error("WebAuthn login-verify error:", err);
    return Response.json({ error: "Weryfikacja nie powiodła się" }, { status: 401 });
  }
}
