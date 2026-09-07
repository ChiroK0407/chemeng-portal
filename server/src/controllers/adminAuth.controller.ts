import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { issueAdminToken } from '../middleware/adminAuth.middleware';

const loginSchema = z.object({ password: z.string().min(1) });

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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12h, matches token expiry
    });

    res.status(200).json({ success: true, message: 'Signed in.' });
  } catch (error) { next(error); }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('admin_session');
  res.status(200).json({ success: true, message: 'Signed out.' });
};

export const check = async (req: Request, res: Response) => {
  // Frontend calls this on load of the admin page to decide whether to
  // show the password screen or the editor. requireAdminSession already
  // ran if this handler is reached.
  res.status(200).json({ success: true, data: { isAdmin: true } });
};
