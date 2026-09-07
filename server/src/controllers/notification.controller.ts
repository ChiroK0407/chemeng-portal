import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(
      `SELECT id, title, message, link, created_at FROM notifications
       WHERE is_active = true ORDER BY created_at DESC LIMIT 20`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM notifications ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, message, link } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'title and message are required.' });

    const { rows } = await query(
      `INSERT INTO notifications (title, message, link) VALUES ($1,$2,$3) RETURNING *`,
      [title, message, link || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, message, link, isActive } = req.body;

    const { rows } = await query(
      `UPDATE notifications SET
         title = COALESCE($1, title), message = COALESCE($2, message),
         link = COALESCE($3, link), is_active = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [title, message, link, isActive, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM notifications WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) { next(error); }
};
