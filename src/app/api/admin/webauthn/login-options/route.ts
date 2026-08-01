import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { listCredentials } from "@/lib/admin-credentials-db";
import { getRpInfo, issueChallengeToken } from "@/lib/admin-session";

// Publiczny endpoint (jeszcze nie ma sesji - to poczatek logowania).
// Nie zdradzamy, czy w ogole jakies klucze sa zarejestrowane w tresci bledu -
// po prostu generujemy opcje dla tego, co jest (moze byc pusta lista, wtedy
// przegladarka i tak pokaze okno wyboru klucza, ktore po prostu nic nie znajdzie).
export async function POST(request: Request) {
  const { rpID } = getRpInfo(request);
  const credentials = await listCredentials();

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: credentials.map((c) => ({
      id: c.credential_id,
      transports: (c.transports as never) ?? undefined,
    })),
  });

  const challengeToken = issueChallengeToken(options.challenge);
  return Response.json({ options, challengeToken });
}
