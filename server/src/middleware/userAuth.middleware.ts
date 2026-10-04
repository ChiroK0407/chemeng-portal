import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

const USER_SESSION_COOKIE = 'user_session';
const USER_TOKEN_TTL = '7d';

export interface UserTokenPayload {
  sub: string;
  scope: 'user';
}

function getUserSecret(): string {
  const secret = process.env.USER_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('USER_JWT_SECRET is not set. Refusing to start with an insecure default.');
    }
    return 'dev_only_user_secret_change_me';
  }
  return secret;
}

export function issueUserToken(userId: string): string {
  const payload: UserTokenPayload = { sub: userId, scope: 'user' };
  return jwt.sign(payload, getUserSecret(), { expiresIn: USER_TOKEN_TTL });
}

export function verifyUserToken(token: string): UserTokenPayload {
  const decoded = jwt.verify(token, getUserSecret()) as UserTokenPayload;
  if (decoded.scope !== 'user') throw new Error('wrong scope');
  return decoded;
}

export function userCookieOptions(): CookieOptions {
  const domain = process.env.COOKIE_DOMAIN || undefined;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export { USER_SESSION_COOKIE };

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[USER_SESSION_COOKIE];
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  return cookieToken || headerToken;
}

export const requireUserSession = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Sign-in required.', code: 'AUTH_REQUIRED' });
  }
  try {
    const decoded = verifyUserToken(token);
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.', code: 'AUTH_INVALID' });
  }
};

export const attachUserIfPresent = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.userId = verifyUserToken(token).sub;
    } catch {
      // proceed as anonymous
    }
  }
  next();
};
