import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { query } from '../lib/db';

// ── Types ─────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  password_hash: string | null; // NULL for Google-only accounts
  full_name: string;
  role: 'member' | 'admin';
  is_verified: boolean;
  auth_provider: 'local' | 'google';
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export function toPublicUser(u: User): PublicUser {
  const { password_hash, ...rest } = u;
  return rest;
}

// ── Password hashing ─────────────────────────────────────────
const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Verification / reset tokens ──────────────────────────────
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

const EMAIL_VERIFICATION_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_MINUTES = 30;

// ── User queries ──────────────────────────────────────────────
export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, fullName: string): Promise<User> {
  const { rows } = await query<User>(
    `INSERT INTO users (email, password_hash, full_name, auth_provider)
     VALUES ($1, $2, $3, 'local')
     RETURNING *`,
    [email.toLowerCase().trim(), passwordHash, fullName.trim()]
  );
  return rows[0];
}

export async function markUserVerified(userId: string): Promise<void> {
  await query('UPDATE users SET is_verified = true, updated_at = now() WHERE id = $1', [userId]);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, userId]);
}

// ── Google OAuth: find-or-create ─────────────────────────────
// Handles three cases, in order:
//   1. A Google account we've seen before (google_id already on file) -> return it.
//   2. A local-password account exists with this email, but has never
//      signed in with Google -> LINK the Google id onto that existing
//      account rather than creating a duplicate. This matters: without
//      it, someone who signed up with email+password and later clicks
//      "Sign in with Google" using the same email would silently get a
//      SECOND, separate account with no password and no shared history --
//      confusing and easy to get permanently locked out of one half of.
//   3. Neither exists -> create a fresh Google-only account (no password_hash).
// Google-verified emails are treated as already verified (is_verified=true)
// -- Google has already confirmed the person controls that mailbox, so
// there's nothing our own email-verification step would add here.
export async function findOrCreateGoogleUser(
  email: string,
  fullName: string,
  googleId: string
): Promise<User> {
  const byGoogleId = await findUserByGoogleId(googleId);
  if (byGoogleId) return byGoogleId;

  const byEmail = await findUserByEmail(email);
  if (byEmail) {
    const { rows } = await query<User>(
      `UPDATE users
       SET google_id = $1, is_verified = true, updated_at = now()
       WHERE id = $2
       RETURNING *`,
      [googleId, byEmail.id]
    );
    return rows[0];
  }

  const { rows } = await query<User>(
    `INSERT INTO users (email, password_hash, full_name, auth_provider, google_id, is_verified)
     VALUES ($1, NULL, $2, 'google', $3, true)
     RETURNING *`,
    [email.toLowerCase().trim(), fullName.trim(), googleId]
  );
  return rows[0];
}

// ── Email verification tokens ────────────────────────────────
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000);

  await query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return rawToken;
}

export async function consumeEmailVerificationToken(rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const { rows } = await query<{ user_id: string }>(
    `UPDATE email_verification_tokens
     SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [tokenHash]
  );
  return rows[0]?.user_id ?? null;
}

// ── Password reset tokens ────────────────────────────────────
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return rawToken;
}

export async function consumePasswordResetToken(rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const { rows } = await query<{ user_id: string }>(
    `UPDATE password_reset_tokens
     SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [tokenHash]
  );
  return rows[0]?.user_id ?? null;
}
