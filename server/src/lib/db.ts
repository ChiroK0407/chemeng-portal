import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env right here, at the top of this file, rather than relying on
// index.ts having done it first. Module imports are fully evaluated before
// any code in the importing file runs, so if index.ts imports this file
// (even indirectly, via a controller) before its own dotenv.config() call
// executes, DATABASE_URL would still be undefined at the time the Pool
// below is constructed — and since the Pool's config is fixed at
// construction, that broken value sticks for the life of the process, even
// though DATABASE_URL becomes available moments later. Calling it here
// guarantees it's loaded no matter what order files get imported in.
dotenv.config();

// Single shared connection pool. Import `query` (or `pool` for transactions)
// wherever the old code imported `prisma`.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

export async function query<T = any>(text: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
  const result = await pool.query(text, params);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

// Use for multi-statement writes that must succeed or fail together
// (replaces prisma.$transaction).
export async function withTransaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
