import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
    const offset = (page - 1) * limit;
    const { type, search, subject, semester } = req.query as Record<string, string>;

    const params: any[] = [];
    let where = `status = 'published'`;
    if (type) {
      params.push(type);
      where += ` AND type = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (subject) {
      params.push(`%${subject}%`);
      where += ` AND subject ILIKE $${params.length}`;
    }
    if (semester) {
      params.push(Number(semester));
      where += ` AND semester = $${params.length}`;
    }

    const listParams = [...params, limit, offset];
    const { rows: resources } = await query(
      `SELECT * FROM resources WHERE ${where} ORDER BY created_at DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM resources WHERE ${where}`, params);

    res.status(200).json({
      success: true,
      data: resources,
      meta: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) { next(error); }
};

// Called when someone clicks through to a resource — increments the
// counter and redirects the count, same pattern as blog views.
export const trackClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(
      `UPDATE resources SET downloads = downloads + 1 WHERE id = $1 AND status = 'published' RETURNING url`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.status(200).json({ success: true, data: { url: rows[0].url } });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM resources ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, subject, semester, url, uploaderName, status } = req.body;
    if (!title || !url) return res.status(400).json({ success: false, message: 'title and url are required.' });

    const { rows } = await query(
      `INSERT INTO resources (title, description, type, subject, semester, url, uploader_name, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description || null, type || 'link', subject || null, semester || null, url, uploaderName || null, status || 'draft']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, type, subject, semester, url, uploaderName, status } = req.body;

    const { rows } = await query(
      `UPDATE resources SET
         title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type),
         subject = COALESCE($4, subject), semester = COALESCE($5, semester), url = COALESCE($6, url),
         uploader_name = COALESCE($7, uploader_name), status = COALESCE($8, status), updated_at = now()
       WHERE id = $9 RETURNING *`,
      [title, description, type, subject, semester, url, uploaderName, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM resources WHERE id = $1`, [req.params.id]);
    res.status(200).json({ success: true, message: 'Resource deleted.' });
  } catch (error) { next(error); }
};
