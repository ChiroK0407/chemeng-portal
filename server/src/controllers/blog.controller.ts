import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .slice(0, 80);
}

// Public: only published posts, newest first, simple search + pagination.
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const params: any[] = [];
    let where = `status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }

    const listParams = [...params, limit, offset];
    const { rows: blogs } = await query(
      `SELECT id, title, slug, cover_image, author_name, tags, read_time_min, views, published_at
       FROM blogs WHERE ${where}
       ORDER BY published_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM blogs WHERE ${where}`, params);
    const total = countRows[0].total;

    res.status(200).json({
      success: true,
      data: blogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { rows } = await query(
      `UPDATE blogs SET views = views + 1 WHERE slug = $1 AND status = 'published' RETURNING *`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only from here down (mounted behind requireAdminSession) ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM blogs ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, coverImage, authorName, tags, status } = req.body;
    if (!title || !content || !authorName) {
      return res.status(400).json({ success: false, message: 'title, content, and authorName are required.' });
    }

    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const wordCount = content.split(/\s+/).length;
    const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));
    const isPublished = status === 'published';

    const { rows } = await query(
      `INSERT INTO blogs (title, slug, content, cover_image, author_name, tags, status, read_time_min, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, slug, content, coverImage || null, authorName, tags || [], status || 'draft', readTimeMin, isPublished ? new Date() : null]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, coverImage, authorName, tags, status } = req.body;

    const { rows: existingRows } = await query(`SELECT status FROM blogs WHERE id = $1`, [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const becomingPublished = status === 'published' && existingRows[0].status !== 'published';
    const readTimeMin = content ? Math.max(1, Math.ceil(content.split(/\s+/).length / 200)) : undefined;

    const { rows } = await query(
      `UPDATE blogs SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         cover_image = COALESCE($3, cover_image),
         author_name = COALESCE($4, author_name),
         tags = COALESCE($5, tags),
         status = COALESCE($6, status),
         read_time_min = COALESCE($7, read_time_min),
         published_at = CASE WHEN $8 THEN now() ELSE published_at END,
         updated_at = now()
       WHERE id = $9
       RETURNING *`,
      [title, content, coverImage, authorName, tags, status, readTimeMin, becomingPublished, id]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM blogs WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Post deleted.' });
  } catch (error) { next(error); }
};
