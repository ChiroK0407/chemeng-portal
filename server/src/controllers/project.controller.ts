import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 80);
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
    const offset = (page - 1) * limit;

    const { rows: projects } = await query(
      `SELECT id, title, slug, description, cover_image, author_name, tech_stack, project_url, created_at
       FROM projects WHERE status = 'published'
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM projects WHERE status = 'published'`);
    const total = countRows[0].total;

    res.status(200).json({
      success: true,
      data: projects,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { rows } = await query(`SELECT * FROM projects WHERE slug = $1 AND status = 'published'`, [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM projects ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, coverImage, authorName, techStack, projectUrl, status } = req.body;
    if (!title || !description || !authorName) {
      return res.status(400).json({ success: false, message: 'title, description, and authorName are required.' });
    }
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const { rows } = await query(
      `INSERT INTO projects (title, slug, description, cover_image, author_name, tech_stack, project_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, description, coverImage || null, authorName, techStack || [], projectUrl || null, status || 'draft']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage, authorName, techStack, projectUrl, status } = req.body;

    const { rows } = await query(
      `UPDATE projects SET
         title = COALESCE($1, title), description = COALESCE($2, description),
         cover_image = COALESCE($3, cover_image), author_name = COALESCE($4, author_name),
         tech_stack = COALESCE($5, tech_stack), project_url = COALESCE($6, project_url),
         status = COALESCE($7, status), updated_at = now()
       WHERE id = $8 RETURNING *`,
      [title, description, coverImage, authorName, techStack, projectUrl, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM projects WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (error) { next(error); }
};
