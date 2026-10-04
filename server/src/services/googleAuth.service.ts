import crypto from 'node:crypto';

// Hand-rolled against Google's plain OAuth 2.0 + OpenID Connect endpoints
// -- no `passport`/`googleapis` dependency, consistent with the rest of
// this codebase's preference for direct, small, auditable code over
// pulling in a framework for something with only two HTTP calls in it.
// Reference: https://developers.google.com/identity/protocols/oauth2/web-server

const GOOGLE_AUTH_ENDPOINT  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

export interface GoogleProfile {
  sub:            string; // Google's stable per-account id -- this is what we store as google_id
  email:          string;
  email_verified: boolean;
  name:           string;
}

// The `state` param serves two purposes at once, both required for a
// correct OAuth flow:
//   1. CSRF protection -- a random nonce we can verify came back unchanged,
//      so an attacker can't trick a user's browser into completing an
//      OAuth flow the user never initiated.
//   2. Carrying "where should we send them back to" through Google's
//      redirect, since Google only round-trips this one opaque value,
//      not arbitrary app state.
// Encoded as base64url JSON rather than two separate values because
// Google's redirect only gives us the one `state` field back.
export interface OAuthState {
  csrf:         string;
  redirectPath: string;
}

export function createOAuthState(redirectPath: string): { state: string; csrf: string } {
  const csrf = crypto.randomBytes(16).toString('hex');
  const payload: OAuthState = { csrf, redirectPath };
  const state = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { state, csrf };
}

export function decodeOAuthState(state: string): OAuthState {
  const decoded = Buffer.from(state, 'base64url').toString('utf-8');
  return JSON.parse(decoded) as OAuthState;
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id:     getEnv('GOOGLE_CLIENT_ID'),
    redirect_uri:  getEnv('GOOGLE_REDIRECT_URI'),
    response_type: 'code',
    scope:         'openid email profile',
    state,
    // Without this, Google silently skips issuing a refresh token on
    // repeat consents -- irrelevant for login-only usage like this
    // (we don't need offline access to their account later), included
    // here mainly so it's documented rather than mysteriously absent.
    access_type:   'online',
    prompt:        'select_account',
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code: string): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     getEnv('GOOGLE_CLIENT_ID'),
      client_secret: getEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri:  getEnv('GOOGLE_REDIRECT_URI'),
      grant_type:    'authorization_code',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Google token exchange response had no access_token.');
  return data.access_token;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google userinfo fetch failed (${response.status}): ${body}`);
  }

  return (await response.json()) as GoogleProfile;
}
