import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const type = req.query.type as string;

    const params: any[] = [];
    let where = `status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (title ILIKE $${params.length} OR company ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (type) {
      params.push(type);
      where += ` AND type = $${params.length}`;
    }

    const listParams = [...params, limit, offset];
    const { rows: opportunities } = await query(
      `SELECT * FROM opportunities WHERE ${where}
       ORDER BY deadline ASC NULLS LAST
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM opportunities WHERE ${where}`, params);
    const total = countRows[0].total;

    res.status(200).json({
      success: true,
      data: opportunities,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rows } = await query(`SELECT * FROM opportunities WHERE id = $1 AND status = 'published'`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM opportunities ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, company, description, type, location, isRemote, stipendMax, applyUrl, deadline, status } = req.body;
    if (!title || !company || !description || !type) {
      return res.status(400).json({ success: false, message: 'title, company, description, and type are required.' });
    }

    const { rows } = await query(
      `INSERT INTO opportunities (title, company, description, type, location, is_remote, stipend_max, apply_url, deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, company, description, type, location || null, !!isRemote, stipendMax || null, applyUrl || null, deadline || null, status || 'draft']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, company, description, type, location, isRemote, stipendMax, applyUrl, deadline, status } = req.body;

    const { rows } = await query(
      `UPDATE opportunities SET
         title = COALESCE($1, title), company = COALESCE($2, company),
         description = COALESCE($3, description), type = COALESCE($4, type),
         location = COALESCE($5, location), is_remote = COALESCE($6, is_remote),
         stipend_max = COALESCE($7, stipend_max), apply_url = COALESCE($8, apply_url),
         deadline = COALESCE($9, deadline), status = COALESCE($10, status),
         updated_at = now()
       WHERE id = $11 RETURNING *`,
      [title, company, description, type, location, isRemote, stipendMax, applyUrl, deadline, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM opportunities WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Opportunity deleted.' });
  } catch (error) { next(error); }
};
