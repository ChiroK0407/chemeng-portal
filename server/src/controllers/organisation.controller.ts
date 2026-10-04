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
    const { search, orgType, gateRequired, branch, sortBy, isFeatured } = req.query as Record<string, string>;

    const params: any[] = [];
    let where = `status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
    }
    if (orgType) {
      params.push(orgType);
      where += ` AND org_type = $${params.length}`;
    }
    if (isFeatured === 'true') where += ` AND is_featured = true`;
    if (gateRequired === 'yes') where += ` AND gate_cutoff IS NOT NULL`;
    if (gateRequired === 'no') where += ` AND gate_cutoff IS NULL`;
    if (branch) {
      params.push(`%${branch}%`);
      where += ` AND EXISTS (SELECT 1 FROM unnest(eligible_branches) b WHERE b ILIKE $${params.length})`;
    }

    // Package-based sorting no longer applies now that salary is never
    // disclosed. 'latest' remains the only meaningful sort; anything
    // else falls back to it rather than erroring on an unknown column.
    const orderBy = 'is_featured DESC, created_at DESC';

    const listParams = [...params, limit, offset];
    const { rows: organisations } = await query(
      `SELECT * FROM organisations WHERE ${where} ORDER BY ${orderBy} LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM organisations WHERE ${where}`, params);

    res.status(200).json({
      success: true,
      data: organisations,
      meta: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) { next(error); }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM organisations WHERE slug = $1 AND status = 'published'`, [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Organisation not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM organisations ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, fullName, logoUrl, orgType, description, engineerNotes, gateCutoff,
      bondYears, headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status,
    } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required.' });

    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const { rows } = await query(
      `INSERT INTO organisations (name, full_name, slug, logo_url, org_type, description, engineer_notes,
        gate_cutoff, bond_years, headquarters, recruitment_mode, eligible_branches, website_url, apply_url, is_featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [name, fullName || null, slug, logoUrl || null, orgType || null, description || null, engineerNotes || null,
       gateCutoff || null, bondYears || null, headquarters || null, recruitmentMode || null, eligibleBranches || [],
       websiteUrl || null, applyUrl || null, !!isFeatured, status || 'draft']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name, fullName, logoUrl, orgType, description, engineerNotes, gateCutoff,
      bondYears, headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status,
    } = req.body;

    const { rows } = await query(
      `UPDATE organisations SET
         name = COALESCE($1, name), full_name = COALESCE($2, full_name), logo_url = COALESCE($3, logo_url),
         org_type = COALESCE($4, org_type), description = COALESCE($5, description),
         engineer_notes = COALESCE($6, engineer_notes),
         gate_cutoff = COALESCE($7, gate_cutoff), bond_years = COALESCE($8, bond_years),
         headquarters = COALESCE($9, headquarters), recruitment_mode = COALESCE($10, recruitment_mode),
         eligible_branches = COALESCE($11, eligible_branches), website_url = COALESCE($12, website_url),
         apply_url = COALESCE($13, apply_url), is_featured = COALESCE($14, is_featured),
         status = COALESCE($15, status), updated_at = now()
       WHERE id = $16 RETURNING *`,
      [name, fullName, logoUrl, orgType, description, engineerNotes, gateCutoff, bondYears,
       headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Organisation not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM organisations WHERE id = $1`, [req.params.id]);
    res.status(200).json({ success: true, message: 'Organisation deleted.' });
  } catch (error) { next(error); }
};
