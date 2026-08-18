import { queryWithRetry } from "@/lib/db";
import crypto from "crypto";

export type Referral = {
  id: string;
  created_at: string;
  code: string;
  inviter_name: string;
  inviter_email: string;
  inviter_start_number: string;
  invited_email: string;
  verified: boolean;
};

export type ReferralHit = {
  id: string;
  created_at: string;
  code: string;
  visitor_id: string | null;
  device_type: string | null;
};

export async function ensureReferralTables() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      code VARCHAR(20) UNIQUE NOT NULL,
      inviter_name VARCHAR(200) NOT NULL,
      inviter_email VARCHAR(200) NOT NULL,
      inviter_start_number VARCHAR(50) NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false
    )
  `);
  // Formularz na /zaproszenie od niedawna zbiera tez e-mail osoby zaproszonej -
  // ADD COLUMN IF NOT EXISTS, bo tabela `referrals` na produkcji juz istnieje
  // (samo CREATE TABLE IF NOT EXISTS wyzej nie dotknie istniejacej tabeli).
  await queryWithRetry(`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS invited_email VARCHAR(200) NOT NULL DEFAULT ''`);
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS referral_hits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      code VARCHAR(20) NOT NULL,
      visitor_id VARCHAR(100),
      device_type VARCHAR(20)
    )
  `);
}

// Krotki, url-safe kod (8 znakow base64url z 6 losowych bajtow = 2^48
// mozliwosci - kolizja przy skali tego wydarzenia praktycznie niemozliwa,
// a retry na UNIQUE VIOLATION ponizej i tak by ja obsluzyl).
function generateCode(): string {
  return crypto.randomBytes(6).toString("base64url");
}

export async function createReferral(params: {
  name: string;
  email: string;
  startNumber: string;
  invitedEmail: string;
}): Promise<string> {
  await ensureReferralTables();
  // Kilka prob na wypadek (bardzo malo prawdopodobnej) kolizji kodu -
  // czystsze niz liczenie na to, ze losowosc nigdy nie zawiedzie.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await queryWithRetry(
        `INSERT INTO referrals (code, inviter_name, inviter_email, inviter_start_number, invited_email)
         VALUES ($1, $2, $3, $4, $5)`,
        [code, params.name, params.email, params.startNumber, params.invitedEmail]
      );
      return code;
    } catch (err) {
      const pgCode = (err as { code?: string })?.code;
      if (pgCode === "23505" && attempt < 4) continue; // unique_violation - sprobuj innego kodu
      throw err;
    }
  }
  throw new Error("Nie udało się wygenerować unikalnego kodu");
}

// Publiczny odczyt (strona /zaproszenie/[code]) - tylko imie, zadnych danych
// kontaktowych. Dziala niezaleznie od stanu `verified`: weryfikacja numeru
// startowego moze potrwac, a to nie moze blokowac dzialania linku.
export async function getInviterNameByCode(code: string): Promise<string | null> {
  await ensureReferralTables();
  const result = await queryWithRetry<{ inviter_name: string }>(
    `SELECT inviter_name FROM referrals WHERE code = $1`,
    [code]
  );
  return result.rows[0]?.inviter_name ?? null;
}
