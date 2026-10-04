import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 80);
}

// Public: events are never "draft" — they're either upcoming, ongoing,
// completed, or cancelled, all of which are visible. The admin sets
// status explicitly rather than it being computed from starts_at/ends_at,
// since a small team is fine updating it by hand around a live session.
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 9);
    const offset = (page - 1) * limit;
    const { status, search, isOnline } = req.query as Record<string, string>;

    const params: any[] = [];
    let where = `status <> 'cancelled'`;
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (isOnline === 'true') where += ` AND is_online = true`;

    const listParams = [...params, limit, offset];
    const { rows: events } = await query(
      `SELECT * FROM events WHERE ${where} ORDER BY starts_at ASC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM events WHERE ${where}`, params);

    // Featured = the single soonest upcoming event, used for the hero card.
    const { rows: featuredRows } = await query(
      `SELECT * FROM events WHERE status = 'upcoming' ORDER BY starts_at ASC LIMIT 1`
    );

    res.status(200).json({
      success: true,
      data: events,
      featured: featuredRows[0] || null,
      meta: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) { next(error); }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM events WHERE slug = $1`, [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM events ORDER BY starts_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, content, coverImage, venue, isOnline, meetingUrl, organizerName, startsAt, endsAt, status } = req.body;
    if (!title || !startsAt) return res.status(400).json({ success: false, message: 'title and startsAt are required.' });

    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const { rows } = await query(
      `INSERT INTO events (title, slug, description, content, cover_image, venue, is_online, meeting_url, organizer_name, starts_at, ends_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [title, slug, description || null, content || null, coverImage || null, venue || null,
       !!isOnline, meetingUrl || null, organizerName || null, startsAt, endsAt || null, status || 'upcoming']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, content, coverImage, venue, isOnline, meetingUrl, organizerName, startsAt, endsAt, status } = req.body;

    const { rows } = await query(
      `UPDATE events SET
         title = COALESCE($1, title), description = COALESCE($2, description), content = COALESCE($3, content),
         cover_image = COALESCE($4, cover_image), venue = COALESCE($5, venue), is_online = COALESCE($6, is_online),
         meeting_url = COALESCE($7, meeting_url), organizer_name = COALESCE($8, organizer_name),
         starts_at = COALESCE($9, starts_at), ends_at = COALESCE($10, ends_at), status = COALESCE($11, status),
         updated_at = now()
       WHERE id = $12 RETURNING *`,
      [title, description, content, coverImage, venue, isOnline, meetingUrl, organizerName, startsAt, endsAt, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM events WHERE id = $1`, [req.params.id]);
    res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (error) { next(error); }
};
