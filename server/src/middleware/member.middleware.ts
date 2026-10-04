import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

// Gate for actions that should be unreachable until a signed-in user
// has actually completed the join form (name/stream/type/roll number) —
// not just signed in. requireUserSession only proves "this is a real,
// logged-in account"; it says nothing about whether they ever finished
// the member-join step. Without this, someone could bypass the
// frontend's disabled buttons entirely by calling the API directly and
// still reach member-only actions (e.g. quiz attempts) with an
// incomplete profile.
//
// Must run AFTER requireUserSession on any route that uses it, since it
// relies on req.userId already being set.
export async function requireMemberProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await query(`SELECT id FROM members WHERE user_id = $1`, [req.userId]);
    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Complete your member profile before doing this.',
        code: 'MEMBER_PROFILE_REQUIRED',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}
