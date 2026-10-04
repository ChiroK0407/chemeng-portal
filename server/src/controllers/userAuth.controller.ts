import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  findUserByEmail,
  findUserById,
  createUser,
  hashPassword,
  verifyPassword,
  toPublicUser,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  markUserVerified,
  createPasswordResetToken,
  consumePasswordResetToken,
  updateUserPassword,
  findOrCreateGoogleUser,
} from '../services/userAuth.service';
import {
  buildGoogleAuthUrl,
  createOAuthState,
  decodeOAuthState,
  exchangeCodeForAccessToken,
  fetchGoogleProfile,
} from '../services/googleAuth.service';
import { issueUserToken, userCookieOptions, USER_SESSION_COOKIE } from '../middleware/userAuth.middleware';
import { EmailService } from '../services/email.service';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ── Validation schemas ───────────────────────────────────────
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  fullName: z.string().min(1, 'Full name is required.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({ email: z.string().email() });

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const verifyEmailSchema = z.object({ token: z.string().min(1) });

// ── Signup ────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = signupSchema.parse(req.body);

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Could not create account with these details.',
        code: 'SIGNUP_CONFLICT',
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, fullName);

    const rawVerifyToken = await createEmailVerificationToken(user.id);
    const verifyUrl = `${APP_URL}/auth/verify-email?token=${rawVerifyToken}`;
    await EmailService.sendVerifyEmail(user.email, user.full_name, verifyUrl);
    await EmailService.sendWelcomeEmail(user.email, user.full_name);

    const token = issueUserToken(user.id);
    res.cookie(USER_SESSION_COOKIE, token, userCookieOptions());

    res.status(201).json({ success: true, data: { user: toPublicUser(user) } });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    const invalidCredentials = () =>
      res.status(401).json({ success: false, message: 'Incorrect email or password.', code: 'INVALID_CREDENTIALS' });

    if (!user) return invalidCredentials();

    // A Google-only account has no password_hash -- there's nothing to
    // compare against, and the honest response is "use Google to sign
    // in," not a generic wrong-password message that would send someone
    // down a forgot-password loop for an account that never had one.
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Use the "Continue with Google" button instead.',
        code: 'GOOGLE_ACCOUNT_NO_PASSWORD',
      });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) return invalidCredentials();

    const token = issueUserToken(user.id);
    res.cookie(USER_SESSION_COOKIE, token, userCookieOptions());

    res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────────
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(USER_SESSION_COOKIE, userCookieOptions());
  res.status(200).json({ success: true, message: 'Signed out.' });
};

// ── Current user ──────────────────────────────────────────────
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserById(req.userId!);
    if (!user) {
      res.clearCookie(USER_SESSION_COOKIE, userCookieOptions());
      return res.status(401).json({ success: false, message: 'Account no longer exists.', code: 'AUTH_INVALID' });
    }
    res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
  } catch (error) {
    next(error);
  }
};

// ── Email verification ───────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    const userId = await consumeEmailVerificationToken(token);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'This verification link is invalid or has expired.',
        code: 'VERIFY_TOKEN_INVALID',
      });
    }
    await markUserVerified(userId);
    res.status(200).json({ success: true, message: 'Email verified.' });
  } catch (error) {
    next(error);
  }
};

// ── Forgot / reset password ──────────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await findUserByEmail(email);

    if (user && user.password_hash) {
      // Google-only accounts have nothing to reset -- deliberately not
      // sending a "forgot password" email for an account that never had
      // one, same reasoning as the login-time message above.
      const rawResetToken = await createPasswordResetToken(user.id);
      const resetUrl = `${APP_URL}/auth/reset-password?token=${rawResetToken}`;
      await EmailService.sendResetPasswordEmail(user.email, user.full_name, resetUrl);
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const userId = await consumePasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired.',
        code: 'RESET_TOKEN_INVALID',
      });
    }

    const passwordHash = await hashPassword(password);
    await updateUserPassword(userId, passwordHash);

    const sessionToken = issueUserToken(userId);
    res.cookie(USER_SESSION_COOKIE, sessionToken, userCookieOptions());

    res.status(200).json({ success: true, message: 'Password updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Google OAuth ──────────────────────────────────────────────
// Two-step redirect flow, both steps are GET requests hit by the
// browser navigating directly (NOT fetch/XHR calls) -- this has to be a
// real page navigation because the user needs to see and interact with
// Google's own consent screen, which can't happen inside a background
// API call.

// Step 1: GET /api/auth/google -- redirect the browser to Google's
// consent screen. `redirect` is an optional query param carrying where
// to send the user once they're back (e.g. the blog post they clicked
// before being asked to log in) -- defaults to the dashboard.
export const googleLogin = (req: Request, res: Response) => {
  const redirectPath = typeof req.query.redirect === 'string' ? req.query.redirect : '/';
  const { state } = createOAuthState(redirectPath);

  // The CSRF half of `state` is also independently stashed in a short-lived
  // cookie -- verified against the value Google sends back in the callback
  // below. Storing it server-side-via-cookie (not just trusting whatever
  // `state` Google echoes back) is what actually makes this CSRF protection
  // rather than just an opaque pass-through value.
  res.cookie('google_oauth_csrf', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes -- plenty for a consent-screen round trip
    path: '/',
  });

  res.redirect(buildGoogleAuthUrl(state));
};

// Step 2: GET /api/auth/google/callback -- Google redirects here after
// the user approves (or denies) access, with `code` and `state` as query
// params. On success: exchange the code, find-or-create the user, set
// the SAME session cookie the password-login path uses, then redirect
// the browser to the frontend (not JSON -- this response is loaded
// directly by the browser via the redirect chain, there's no JS on this
// page to read a JSON body).
export const googleCallback = async (req: Request, res: Response) => {
  const { code, state, error: googleError } = req.query;
  const failUrl = (reason: string) => `${APP_URL}/auth/login?error=${encodeURIComponent(reason)}`;

  if (googleError) {
    // User clicked "Cancel" on Google's consent screen, or some other
    // Google-side denial -- not a bug, just send them back to login.
    return res.redirect(failUrl('google_denied'));
  }
  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.redirect(failUrl('invalid_callback'));
  }

  const csrfCookie = req.cookies?.['google_oauth_csrf'];
  res.clearCookie('google_oauth_csrf', { path: '/' });
  if (!csrfCookie || csrfCookie !== state) {
    // The state we got back doesn't match what we stashed when this flow
    // started -- reject rather than proceed, this is exactly the case
    // CSRF protection exists to catch.
    return res.redirect(failUrl('state_mismatch'));
  }

  let redirectPath = '/';
  try {
    const decoded = decodeOAuthState(state);
    redirectPath = decoded.redirectPath || '/';

    const accessToken = await exchangeCodeForAccessToken(code);
    const profile = await fetchGoogleProfile(accessToken);

    if (!profile.email_verified) {
      // Extremely rare in practice (Google generally only returns verified
      // emails via this scope), but if it ever happens, don't silently
      // treat an unverified email as a trusted identity.
      return res.redirect(failUrl('google_email_unverified'));
    }

    const user = await findOrCreateGoogleUser(profile.email, profile.name, profile.sub);
    const sessionToken = issueUserToken(user.id);
    res.cookie(USER_SESSION_COOKIE, sessionToken, userCookieOptions());

    res.redirect(`${APP_URL}${redirectPath}`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err);
    res.redirect(failUrl('google_auth_failed'));
  }
};