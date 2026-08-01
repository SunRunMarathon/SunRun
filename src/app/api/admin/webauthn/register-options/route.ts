import { generateRegistrationOptions } from "@simplewebauthn/server";
import { listCredentials } from "@/lib/admin-credentials-db";
import { getRpInfo, isAuthorizedRequest, issueChallengeToken } from "@/lib/admin-session";

// Jeden "użytkownik" (panel admina Sun Run) - stały, jawny identyfikator, nie
// jest tajny, służy tylko WebAuthn do grupowania kluczy pod jedno konto.
const ADMIN_USER_ID = Buffer.from("sunrun-admin-panel");

export async function POST(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const { rpID } = getRpInfo(request);
  const existing = await listCredentials();

  const options = await generateRegistrationOptions({
    rpName: "Sun Run - Panel Admina",
    rpID,
    userID: ADMIN_USER_ID,
    userName: "admin",
    userDisplayName: "Panel Admina Sun Run",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    excludeCredentials: existing.map((c) => ({
      id: c.credential_id,
      transports: (c.transports as never) ?? undefined,
    })),
  });

  const challengeToken = issueChallengeToken(options.challenge);
  return Response.json({ options, challengeToken });
}
