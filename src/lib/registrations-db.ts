import { queryWithRetry } from "@/lib/db";

export type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  birth_year: number;
  verified: boolean;
};

export async function ensureRegistrationsTable() {
  await queryWithRetry(`
    CREATE TABLE IF NOT EXISTS registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      birth_year INT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false
    )
  `);
}

export async function createRegistration(params: {
  fullName: string;
  email: string;
  birthYear: number;
}): Promise<void> {
  await ensureRegistrationsTable();
  await queryWithRetry(
    `INSERT INTO registrations (full_name, email, birth_year) VALUES ($1, $2, $3)`,
    [params.fullName, params.email, params.birthYear]
  );
}
