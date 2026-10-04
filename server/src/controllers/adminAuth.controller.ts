import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { issueAdminToken } from '../middleware/adminAuth.middleware';

const loginSchema = z.object({ password: z.string().min(1) });

// Shared by login (res.cookie) and logout (res.clearCookie) -- these
// MUST match, or clearCookie can silently fail to remove the cookie in
// some browsers (an unmatched sameSite/secure/path is treated as a
// different cookie to clear). 'none' in production is required for the
// cookie to survive at all: Vercel (frontend) and Render (backend) are
// different domains, so every request is cross-site there, and
// sameSite:'lax' cookies are never sent on cross-origin fetch/XHR calls
// -- only on top-level navigations. 'none' requires secure:true, which
// browsers enforce and which is already tied to NODE_ENV here.
function adminCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  };
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = loginSchema.parse(req.body);
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return res.status(500).json({ success: false, message: 'Admin password is not configured on the server.' });
    }
    if (password !== expected) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const token = issueAdminToken();
    res.cookie('admin_session', token, {
      ...adminCookieOptions(),
      maxAge: 12 * 60 * 60 * 1000, // 12h, matches token expiry
    });

    res.status(200).json({ success: true, message: 'Signed in.' });
  } catch (error) { next(error); }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('admin_session', adminCookieOptions());
  res.status(200).json({ success: true, message: 'Signed out.' });
};

export const check = async (req: Request, res: Response) => {
  // Frontend calls this on load of the admin page to decide whether to
  // show the password screen or the editor. requireAdminSession already
  // ran if this handler is reached.
  res.status(200).json({ success: true, data: { isAdmin: true } });
};
