import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

const ROLL_NUMBER_PATTERN = /^[0-9]{12}$/;
const AUTO_APPROVE_MEMBERS = process.env.AUTO_APPROVE_MEMBERS === 'true';

// Shared by join() and updateMine() — students must have a valid
// 12-digit roll number (leading zeros included, hence a regex on a
// string, never a numeric parse); alumni must not have one at all.
// Returns an error message string, or null when valid.
function validateRollNumber(category: string, rollNumber: unknown): string | null {
  if (category === 'current') {
    if (typeof rollNumber !== 'string' || !ROLL_NUMBER_PATTERN.test(rollNumber)) {
      return 'Roll number must be exactly 12 digits.';
    }
  }
  return null;
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string; // 'current' | 'alumni'
    const params: any[] = [];
    let where = `status = 'published'`;
    if (category) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }

    const { rows } = await query(
      `SELECT id, full_name, role_title, category, branch, bio, photo_url, linkedin_url, is_featured
       FROM members WHERE ${where}
       ORDER BY is_featured DESC, full_name ASC`,
      params
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Explicit column list, not SELECT * — roll_number and user_id must
    // never reach a public response. roll_number identifies a specific
    // student account; user_id is an internal foreign key. Neither has
    // any reason to be visible to someone browsing the Members page.
    const { rows } = await query(
      `SELECT id, full_name, role_title, category, branch, bio, photo_url, linkedin_url, is_featured, created_at
       FROM members WHERE id = $1 AND status = 'published'`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Self-service (requireUserSession — a signed-in user managing their
//    own card, not an admin managing anyone's). Mounted above /:id in
//    the router so "/members/me" isn't swallowed as an :id lookup.

// Returns null (not 404) when the user hasn't joined yet — this is a
// normal, expected state for any signed-in user who hasn't filled in
// their card, not an error condition the frontend needs to catch.
export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM members WHERE user_id = $1`, [req.userId]);
    res.status(200).json({ success: true, data: rows[0] || null });
  } catch (error) { next(error); }
};

// Creates the member row for the first time. Publishing remains admin-only
// unless AUTO_APPROVE_MEMBERS is enabled on the server. Also the landing
// spot for the sessionStorage-bridged Google signup flow — see
// AuthContext.tsx, which calls this automatically right after a fresh
// Google sign-in resolves, using data cached before the OAuth redirect.
export const join = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, rollNumber } = req.body;
    if (!fullName) return res.status(400).json({ success: false, message: 'fullName is required.' });

    const resolvedCategory = category === 'alumni' ? 'alumni' : 'current';
    const rollNumberError = validateRollNumber(resolvedCategory, rollNumber);
    if (rollNumberError) return res.status(400).json({ success: false, message: rollNumberError });

    const { rows: existing } = await query(`SELECT id FROM members WHERE user_id = $1`, [req.userId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have a member card. Use the edit form instead.', code: 'ALREADY_JOINED' });
    }

    const { rows } = await query(
      `INSERT INTO members (user_id, full_name, role_title, category, branch, bio, photo_url, linkedin_url, roll_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.userId, fullName, roleTitle || null, resolvedCategory, branch || null, bio || null,
        photoUrl || null, linkedinUrl || null, resolvedCategory === 'current' ? rollNumber : null,
        AUTO_APPROVE_MEMBERS ? 'published' : 'draft',
      ]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// Updates the user's own card. Deliberately narrower than the admin
// update: no status, no is_featured — a user can edit what they wrote,
// not re-publish themselves or feature their own card.
export const updateMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, rollNumber } = req.body;

    // Only validate roll number when category is actually being changed
    // (or was already 'current') — a partial update that doesn't touch
    // category/rollNumber shouldn't suddenly demand one out of nowhere.
    if (category !== undefined) {
      const rollNumberError = validateRollNumber(category, rollNumber);
      if (rollNumberError) return res.status(400).json({ success: false, message: rollNumberError });
    }

    const { rows } = await query(
      `UPDATE members SET
         full_name = COALESCE($1, full_name), role_title = COALESCE($2, role_title),
         category = COALESCE($3, category), branch = COALESCE($4, branch),
         bio = COALESCE($5, bio), photo_url = COALESCE($6, photo_url),
         linkedin_url = COALESCE($7, linkedin_url),
         roll_number = CASE WHEN $3 = 'alumni' THEN NULL ELSE COALESCE($8, roll_number) END,
         updated_at = now()
       WHERE user_id = $9 RETURNING *`,
      [fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, rollNumber, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'No member card found — join first.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM members ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status, rollNumber } = req.body;
    if (!fullName) return res.status(400).json({ success: false, message: 'fullName is required.' });

    // Admin-created rows are NOT held to the same roll-number-required
    // rule as self-service join() — an admin may be adding a mentor,
    // faculty contact, or historical entry with no roll number at all.
    // The format CHECK (exactly 12 digits when present) still applies.
    const { rows } = await query(
      `INSERT INTO members (full_name, role_title, category, branch, bio, photo_url, linkedin_url, is_featured, status, roll_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [fullName, roleTitle || null, category || 'current', branch || null, bio || null, photoUrl || null, linkedinUrl || null, !!isFeatured, status || 'published', rollNumber || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status, rollNumber } = req.body;

    const { rows } = await query(
      `UPDATE members SET
         full_name = COALESCE($1, full_name), role_title = COALESCE($2, role_title),
         category = COALESCE($3, category), branch = COALESCE($4, branch),
         bio = COALESCE($5, bio), photo_url = COALESCE($6, photo_url),
         linkedin_url = COALESCE($7, linkedin_url), is_featured = COALESCE($8, is_featured),
         status = COALESCE($9, status), roll_number = COALESCE($10, roll_number), updated_at = now()
       WHERE id = $11 RETURNING *`,
      [fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status, rollNumber, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM members WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Member deleted.' });
  } catch (error) { next(error); }
};
