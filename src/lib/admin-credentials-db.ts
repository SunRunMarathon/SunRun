import pool from "@/lib/db";
import type { WebAuthnCredential } from "@simplewebauthn/server";

export type StoredCredential = {
  id: string;
  credential_id: string;
  public_key: string; // base64
  counter: number;
  device_type: string | null;
  backed_up: boolean;
  transports: string[] | null;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
};

export async function ensureCredentialsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      credential_id VARCHAR(255) UNIQUE NOT NULL,
      public_key TEXT NOT NULL,
      counter BIGINT NOT NULL DEFAULT 0,
      device_type VARCHAR(20),
      backed_up BOOLEAN NOT NULL DEFAULT false,
      transports TEXT,
      device_name VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    )
  `);
}

export async function listCredentials(): Promise<StoredCredential[]> {
  await ensureCredentialsTable();
  const result = await pool.query(
    `SELECT id, credential_id, public_key, counter, device_type, backed_up, transports, device_name, created_at, last_used_at
     FROM admin_credentials ORDER BY created_at ASC`
  );
  return result.rows.map((r) => ({ ...r, transports: r.transports ? JSON.parse(r.transports) : null }));
}

export async function findCredentialById(credentialId: string): Promise<StoredCredential | null> {
  await ensureCredentialsTable();
  const result = await pool.query(
    `SELECT id, credential_id, public_key, counter, device_type, backed_up, transports, device_name, created_at, last_used_at
     FROM admin_credentials WHERE credential_id = $1`,
    [credentialId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...row, transports: row.transports ? JSON.parse(row.transports) : null };
}

export async function saveCredential(params: {
  credential: WebAuthnCredential;
  deviceType: string;
  backedUp: boolean;
  deviceName: string;
}) {
  await ensureCredentialsTable();
  await pool.query(
    `INSERT INTO admin_credentials (credential_id, public_key, counter, device_type, backed_up, transports, device_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      params.credential.id,
      Buffer.from(params.credential.publicKey).toString("base64"),
      params.credential.counter,
      params.deviceType,
      params.backedUp,
      params.credential.transports ? JSON.stringify(params.credential.transports) : null,
      params.deviceName,
    ]
  );
}

export async function updateCredentialCounter(credentialId: string, counter: number) {
  await pool.query(
    `UPDATE admin_credentials SET counter = $2, last_used_at = NOW() WHERE credential_id = $1`,
    [credentialId, counter]
  );
}

export async function deleteCredential(id: string) {
  await pool.query(`DELETE FROM admin_credentials WHERE id = $1`, [id]);
}

export function toWebAuthnCredential(row: StoredCredential): WebAuthnCredential {
  return {
    id: row.credential_id,
    publicKey: new Uint8Array(Buffer.from(row.public_key, "base64")),
    counter: Number(row.counter),
    transports: (row.transports as WebAuthnCredential["transports"]) ?? undefined,
  };
}
