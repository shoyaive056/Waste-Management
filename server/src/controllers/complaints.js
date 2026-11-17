import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { removeUpload } from '../middleware/upload.js';
import { adminIds, notifyMany, notifyUser, teamMemberIds } from '../services/notify.js';
import { suggestPriority } from '../services/priority.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { LABEL_STATUS, STATUS_LABEL } from '../utils/enums.js';
import { complaintOut, FULL_INCLUDE, LIST_INCLUDE, scopeWhere } from '../utils/serialize.js';

// Read access: other people's complaints look like they do not exist.
async function findReadable(code, user) {
  const c = await prisma.complaint.findFirst({ where: { code, ...scopeWhere(user) }, include: FULL_INCLUDE });
  if (!c) throw new AppError(404, 'Complaint not found or you do not have access to it.');
  return c;
}
// Write access for team members: explicit 403 when the task is not theirs.
async function findForWork(code, user) {
  const c = await prisma.complaint.findUnique({ where: { code } });
  if (!c) throw new AppError(404, 'Complaint not found.');
  if (user.role === 'team' && c.teamId !== user.teamId) throw new AppError(403, 'You can only update tasks assigned to your team.');
  return c;
}
const reload = async (code, user) => complaintOut(await prisma.complaint.findUnique({ where: { code }, include: FULL_INCLUDE }), user);

export function buildWhere(f, user) {
  const and = [scopeWhere(user)];
  if (f.q) and.push({ OR: ['code', 'title', 'address'].map((k) => ({ [k]: { contains: f.q, mode: 'insensitive' } })).concat([{ citizen: { name: { contains: f.q, mode: 'insensitive' } } }, { category: { name: { contains: f.q, mode: 'insensitive' } } }]) });
  if (f.status) and.push({ status: LABEL_STATUS[f.status] });
  if (f.statusIn) and.push({ status: { in: f.statusIn.split(',').map((s) => LABEL_STATUS[s]).filter(Boolean) } });
  if (f.priority) and.push({ priority: f.priority });
  if (f.categoryId !== '' && f.categoryId !== undefined) and.push({ categoryId: f.categoryId });
  if (f.teamId !== '' && f.teamId !== undefined) and.push({ teamId: f.teamId });
  if (f.location) and.push({ address: { contains: f.location, mode: 'insensitive' } });
  if (f.from) and.push({ createdAt: { gte: new Date(f.from) } });
  if (f.to) and.push({ createdAt: { lte: new Date(f.to + 'T23:59:59.999Z') } });
  return { AND: and };
}

export const list = asyncHandler(async (req, res) => {
  const f = req.q; const where = buildWhere(f, req.user);
  const orderBy = f.sort === 'oldest' ? [{ createdAt: 'asc' }] : f.sort === 'priority' ? [{ priority: 'asc' }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }]; // enum order: High, Medium, Low
  const [total, rows] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({ where, orderBy, skip: (f.page - 1) * f.pageSize, take: f.pageSize, include: LIST_INCLUDE }),
  ]);
  res.json({ items: rows.map((c) => complaintOut(c, req.user)), total, page: f.page, pageSize: f.pageSize });
});

export const get = asyncHandler(async (req, res) => res.json({ complaint: complaintOut(await findReadable(req.params.id, req.user), req.user) }));

export const create = asyncHandler(async (req, res) => {
  const d = req.body;
  const cat = await prisma.wasteCategory.findFirst({ where: { id: d.categoryId, active: true } });
  if (!cat) throw new AppError(400, 'Choose a valid waste category.');
  const priority = suggestPriority({ categorySlug: cat.slug, severity: d.severity, text: `${d.title} ${d.description}` });
  const code = await prisma.$transaction(async (tx) => {
    const c = await tx.complaint.create({ data: { code: `TMP-${crypto.randomUUID()}`, title: d.title, description: d.description, categoryId: cat.id, address: d.address, latitude: d.latitude, longitude: d.longitude, contact: d.contact, severity: d.severity, priority, suggestedPriority: priority, citizenId: req.user.id, photoPath: req.file?.filename } });
    const final = `WM-${new Date().getFullYear()}-${String(c.id).padStart(4, '0')}`; // unique, human-readable ID
    await tx.complaint.update({ where: { id: c.id }, data: { code: final } });
    await tx.complaintStatusHistory.create({ data: { complaintId: c.id, toStatus: 'Pending', changedById: req.user.id, remarks: 'Complaint submitted' } });
    await notifyMany(tx, await adminIds(tx), `New complaint ${final} submitted`, c.id);
    await notifyUser(tx, req.user.id, `Your complaint ${final} was received`, c.id);
    return final;
  });
  res.status(201).json({ complaint: await reload(code, req.user) });
});

export const update = asyncHandler(async (req, res) => {
  const c = await prisma.complaint.findUnique({ where: { code: req.params.id } });
  if (!c || (req.user.role === 'citizen' && c.citizenId !== req.user.id)) throw new AppError(404, 'Complaint not found.');
  if (req.user.role === 'team') throw new AppError(403, 'You do not have permission to do this.');
  if (req.user.role === 'citizen' && c.status !== 'Pending') throw new AppError(409, 'Only pending complaints can be edited.');
  await prisma.complaint.update({ where: { id: c.id }, data: req.body });
  res.json({ complaint: await reload(c.code, req.user) });
});

export const remove = asyncHandler(async (req, res) => {
  const c = await prisma.complaint.findUnique({ where: { code: req.params.id } });
  if (!c || (req.user.role === 'citizen' && c.citizenId !== req.user.id)) throw new AppError(404, 'Complaint not found.');
  if (req.user.role === 'citizen' && c.status !== 'Pending') throw new AppError(409, 'Only pending complaints can be deleted.');
  await prisma.complaint.delete({ where: { id: c.id } }); removeUpload(c.photoPath);
  res.status(204).end();
});

// Status changes always write a history row and notify the people involved, in one transaction.
export const setStatus = asyncHandler(async (req, res) => {
  const c = await findForWork(req.params.id, req.user); const to = LABEL_STATUS[req.body.status];
  if (to === 'Assigned') throw new AppError(400, 'Use the assign endpoint to assign a team.');
  if (req.user.role === 'team' && !['InProgress', 'Resolved'].includes(to)) throw new AppError(403, 'Teams can only mark tasks In Progress or Resolved.');
  if (c.status === to) throw new AppError(409, 'The complaint already has this status.');
  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({ where: { id: c.id }, data: { status: to, resolvedAt: to === 'Resolved' ? new Date() : null } });
    await tx.complaintStatusHistory.create({ data: { complaintId: c.id, fromStatus: c.status, toStatus: to, changedById: req.user.id, remarks: req.body.remarks || null } });
    await notifyUser(tx, c.citizenId, `${c.code} is now ${STATUS_LABEL[to]}`, c.id);
    if (req.user.role === 'team') await notifyMany(tx, await adminIds(tx), `${c.code} marked ${STATUS_LABEL[to]} by ${req.user.name}`, c.id);
  });
  res.json({ complaint: await reload(c.code, req.user) });
});

export const setPriority = asyncHandler(async (req, res) => {
  const c = await prisma.complaint.findUnique({ where: { code: req.params.id } });
  if (!c) throw new AppError(404, 'Complaint not found.');
  await prisma.complaint.update({ where: { id: c.id }, data: { priority: req.body.priority } });
  res.json({ complaint: await reload(c.code, req.user) });
});

export const assign = asyncHandler(async (req, res) => {
  const c = await prisma.complaint.findUnique({ where: { code: req.params.id } });
  if (!c) throw new AppError(404, 'Complaint not found.');
  if (['Resolved', 'Rejected'].includes(c.status)) throw new AppError(409, `A ${c.status.toLowerCase()} complaint cannot be assigned.`);
  const team = await prisma.collectionTeam.findUnique({ where: { id: req.body.teamId } });
  if (!team) throw new AppError(404, 'Team not found.');
  if (!team.available) throw new AppError(409, `${team.name} is currently unavailable.`);
  await prisma.$transaction(async (tx) => {
    await tx.teamAssignment.updateMany({ where: { complaintId: c.id, active: true }, data: { active: false } }); // keep reassignment history
    await tx.teamAssignment.create({ data: { complaintId: c.id, teamId: team.id, assignedById: req.user.id } });
    await tx.complaint.update({ where: { id: c.id }, data: { teamId: team.id, status: 'Assigned' } });
    await tx.complaintStatusHistory.create({ data: { complaintId: c.id, fromStatus: c.status, toStatus: 'Assigned', changedById: req.user.id, remarks: req.body.remarks || `Assigned to ${team.name}` } });
    await notifyMany(tx, await teamMemberIds(tx, team.id), `Task ${c.code} assigned to your team`, c.id);
    await notifyUser(tx, c.citizenId, `${c.code} was assigned to ${team.name}`, c.id);
  });
  res.json({ complaint: await reload(c.code, req.user) });
});

export const addNote = asyncHandler(async (req, res) => {
  const c = await findForWork(req.params.id, req.user);
  await prisma.adminNote.create({ data: { complaintId: c.id, authorId: req.user.id, text: req.body.text } });
  res.status(201).json({ complaint: await reload(c.code, req.user) });
});
