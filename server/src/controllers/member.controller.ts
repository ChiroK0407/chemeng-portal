import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

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
    const { rows } = await query(`SELECT * FROM members WHERE id = $1 AND status = 'published'`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
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
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status } = req.body;
    if (!fullName) return res.status(400).json({ success: false, message: 'fullName is required.' });

    const { rows } = await query(
      `INSERT INTO members (full_name, role_title, category, branch, bio, photo_url, linkedin_url, is_featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [fullName, roleTitle || null, category || 'current', branch || null, bio || null, photoUrl || null, linkedinUrl || null, !!isFeatured, status || 'published']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status } = req.body;

    const { rows } = await query(
      `UPDATE members SET
         full_name = COALESCE($1, full_name), role_title = COALESCE($2, role_title),
         category = COALESCE($3, category), branch = COALESCE($4, branch),
         bio = COALESCE($5, bio), photo_url = COALESCE($6, photo_url),
         linkedin_url = COALESCE($7, linkedin_url), is_featured = COALESCE($8, is_featured),
         status = COALESCE($9, status), updated_at = now()
       WHERE id = $10 RETURNING *`,
      [fullName, roleTitle, category, branch, bio, photoUrl, linkedinUrl, isFeatured, status, id]
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
