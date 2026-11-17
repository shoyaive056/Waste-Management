import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { complaintOut, LIST_INCLUDE, userOut } from '../utils/serialize.js';

// ---- Citizens (admin) ----
export const citizens = asyncHandler(async (_req, res) => {
  const rows = await prisma.user.findMany({ where: { role: 'citizen' }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { complaints: true } } } });
  res.json({ items: rows.map(({ _count, ...u }) => ({ ...userOut(u), reports: _count.complaints })) });
});
export const toggleCitizen = asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!u || u.role !== 'citizen') throw new AppError(404, 'Citizen not found.');
  res.json({ user: userOut(await prisma.user.update({ where: { id: u.id }, data: { active: !u.active } })) });
});

// ---- Waste categories ----
export const categories = asyncHandler(async (_req, res) => res.json({ items: await prisma.wasteCategory.findMany({ orderBy: { id: 'asc' } }) }));
export const addCategory = asyncHandler(async (req, res) => {
  const slug = req.body.name.toLowerCase().replace(/\W+/g, '-').replace(/^-|-$/g, '');
  res.status(201).json({ category: await prisma.wasteCategory.create({ data: { name: req.body.name, slug } }) });
});
export const toggleCategory = asyncHandler(async (req, res) => {
  const c = await prisma.wasteCategory.findUnique({ where: { id: Number(req.params.id) } });
  if (!c) throw new AppError(404, 'Category not found.');
  res.json({ category: await prisma.wasteCategory.update({ where: { id: c.id }, data: { active: !c.active } }) });
});

// ---- Teams ----
export const teams = asyncHandler(async (_req, res) => res.json({ items: await prisma.collectionTeam.findMany({ orderBy: { id: 'asc' } }) }));
export const createTeam = asyncHandler(async (req, res) => {
  const { available = true, ...d } = req.body;
  if (await prisma.user.findUnique({ where: { email: d.email } })) throw new AppError(409, 'An account with this email already exists.');
  const passwordHash = await bcrypt.hash(env.tempTeamPassword(), 12);
  const team = await prisma.$transaction(async (tx) => {
    const t = await tx.collectionTeam.create({ data: { ...d, available } });
    await tx.user.create({ data: { name: d.leader, email: d.email, phone: d.phone, address: d.area, passwordHash, role: 'team', teamId: t.id } }); // leader login
    return t;
  });
  res.status(201).json({ team });
});
export const updateTeam = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.$transaction(async (tx) => {
    const updated = await tx.collectionTeam.update({ where: { id }, data: req.body });
    await tx.user.updateMany({ where: { teamId: id, role: 'team' }, data: { name: updated.leader, email: updated.email, phone: updated.phone, address: updated.area } });
    return updated;
  });
  res.json({ team });
});
export const teamTasks = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.role === 'team' && req.user.teamId !== id) throw new AppError(403, 'You can only view your own team’s tasks.');
  const rows = await prisma.complaint.findMany({ where: { teamId: id }, include: LIST_INCLUDE, orderBy: { updatedAt: 'desc' } });
  res.json({ items: rows.map((c) => complaintOut(c, req.user)) });
});

// ---- Notifications (always limited to the caller) ----
export const notifications = asyncHandler(async (req, res) => {
  const rows = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 100, include: { complaint: { select: { code: true } } } });
  res.json({ items: rows.map((n) => ({ id: n.id, text: n.text, read: n.read, at: n.createdAt, complaintId: n.complaint?.code || null })) });
});
export const markRead = asyncHandler(async (req, res) => {
  const r = await prisma.notification.updateMany({ where: { id: Number(req.params.id), userId: req.user.id }, data: { read: true } });
  if (!r.count) throw new AppError(404, 'Notification not found.');
  res.json({ ok: true });
});
export const markAllRead = asyncHandler(async (req, res) => { await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } }); res.json({ ok: true }); });
