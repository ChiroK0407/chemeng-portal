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
    const { search, sector, gateRequired, minPackage, maxPackage, branch, sortBy } = req.query as Record<string, string>;

    const params: any[] = [];
    let where = `status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
    }
    if (sector) {
      params.push(sector);
      where += ` AND sector = $${params.length}`;
    }
    if (gateRequired === 'yes') where += ` AND gate_cutoff IS NOT NULL`;
    if (gateRequired === 'no') where += ` AND gate_cutoff IS NULL`;
    if (minPackage) {
      params.push(Number(minPackage));
      where += ` AND package_max_lpa >= $${params.length}`;
    }
    if (maxPackage) {
      params.push(Number(maxPackage));
      where += ` AND package_min_lpa <= $${params.length}`;
    }
    if (branch) {
      params.push(`%${branch}%`);
      where += ` AND EXISTS (SELECT 1 FROM unnest(eligible_branches) b WHERE b ILIKE $${params.length})`;
    }

    let orderBy = 'is_featured DESC, created_at DESC';
    if (sortBy === 'package_desc') orderBy = 'package_max_lpa DESC NULLS LAST';
    if (sortBy === 'package_asc') orderBy = 'package_min_lpa ASC NULLS LAST';

    const listParams = [...params, limit, offset];
    const { rows: psus } = await query(
      `SELECT * FROM psus WHERE ${where} ORDER BY ${orderBy} LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );
    const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM psus WHERE ${where}`, params);

    res.status(200).json({
      success: true,
      data: psus,
      meta: { page, limit, total: countRows[0].total, totalPages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) { next(error); }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM psus WHERE slug = $1 AND status = 'published'`, [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'PSU not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

// ── Admin-only ──

export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(`SELECT * FROM psus ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, fullName, logoUrl, sector, description, packageMinLpa, packageMaxLpa, gateCutoff,
      bondYears, headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status,
    } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required.' });

    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const { rows } = await query(
      `INSERT INTO psus (name, full_name, slug, logo_url, sector, description, package_min_lpa, package_max_lpa,
        gate_cutoff, bond_years, headquarters, recruitment_mode, eligible_branches, website_url, apply_url, is_featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [name, fullName || null, slug, logoUrl || null, sector || null, description || null,
       packageMinLpa || null, packageMaxLpa || null, gateCutoff || null, bondYears || null,
       headquarters || null, recruitmentMode || null, eligibleBranches || [], websiteUrl || null,
       applyUrl || null, !!isFeatured, status || 'draft']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name, fullName, logoUrl, sector, description, packageMinLpa, packageMaxLpa, gateCutoff,
      bondYears, headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status,
    } = req.body;

    const { rows } = await query(
      `UPDATE psus SET
         name = COALESCE($1, name), full_name = COALESCE($2, full_name), logo_url = COALESCE($3, logo_url),
         sector = COALESCE($4, sector), description = COALESCE($5, description),
         package_min_lpa = COALESCE($6, package_min_lpa), package_max_lpa = COALESCE($7, package_max_lpa),
         gate_cutoff = COALESCE($8, gate_cutoff), bond_years = COALESCE($9, bond_years),
         headquarters = COALESCE($10, headquarters), recruitment_mode = COALESCE($11, recruitment_mode),
         eligible_branches = COALESCE($12, eligible_branches), website_url = COALESCE($13, website_url),
         apply_url = COALESCE($14, apply_url), is_featured = COALESCE($15, is_featured),
         status = COALESCE($16, status), updated_at = now()
       WHERE id = $17 RETURNING *`,
      [name, fullName, logoUrl, sector, description, packageMinLpa, packageMaxLpa, gateCutoff, bondYears,
       headquarters, recruitmentMode, eligibleBranches, websiteUrl, applyUrl, isFeatured, status, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'PSU not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM psus WHERE id = $1`, [req.params.id]);
    res.status(200).json({ success: true, message: 'PSU deleted.' });
  } catch (error) { next(error); }
};
