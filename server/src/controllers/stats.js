import { prisma } from '../config/prisma.js';
import { buildStats } from '../services/stats.js';
import { asyncHandler } from '../utils/AppError.js';
import { LABEL_STATUS } from '../utils/enums.js';
import { complaintOut, LIST_INCLUDE, scopeWhere } from '../utils/serialize.js';

export const overview = asyncHandler(async (req, res) => res.json(await buildStats(req.user, req.q)));
export const categories = asyncHandler(async (req, res) => res.json((await buildStats(req.user, req.q)).byCategory));
export const monthly = asyncHandler(async (req, res) => res.json((await buildStats(req.user, req.q)).monthly));
export const performance = asyncHandler(async (req, res) => { const s = await buildStats(req.user, req.q); res.json({ teamPerformance: s.teamPerformance, avgDays: s.avgDays }); });
// /dashboard/:role — the route's role guard decides who may call it; data is scoped to the caller either way.
export const dashboard = asyncHandler(async (req, res) => res.json(await buildStats(req.user)));

export const mapComplaints = asyncHandler(async (req, res) => {
  const and = [scopeWhere(req.user)];
  if (['High', 'Medium', 'Low'].includes(req.query.priority)) and.push({ priority: req.query.priority });
  if (req.query.statusIn) and.push({ status: { in: String(req.query.statusIn).split(',').map((s) => LABEL_STATUS[s]).filter(Boolean) } });
  const rows = await prisma.complaint.findMany({ where: { AND: and }, include: LIST_INCLUDE, orderBy: { createdAt: 'desc' } });
  res.json({ items: rows.map((c) => complaintOut(c, req.user)) });
});
