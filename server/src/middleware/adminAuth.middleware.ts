import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// There is no user table / login system at this stage. The whole site is
// public except one hidden admin page shared by the ~5-6 core team members,
// gated by a single password (ADMIN_PASSWORD env var) instead of accounts.
// This middleware only checks "is this request holding a valid admin
// session token" — it does not know or care who is typing.

function getAdminSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    // Fail loudly in production if this was never configured — silently
    // falling back to a guessable default would defeat the whole gate.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_JWT_SECRET is not set. Refusing to start with an insecure default.');
    }
    return 'dev_only_admin_secret_change_me';
  }
  return secret;
}

export function issueAdminToken(): string {
  return jwt.sign({ scope: 'admin' }, getAdminSecret(), { expiresIn: '12h' });
}

export const requireAdminSession = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.admin_session;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin session required.' });
  }

  try {
    const decoded = jwt.verify(token, getAdminSecret()) as { scope: string };
    if (decoded.scope !== 'admin') throw new Error('wrong scope');
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session.' });
  }
};
