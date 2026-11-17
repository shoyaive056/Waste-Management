import { STATUS_LABEL } from './enums.js';

export const userOut = ({ passwordHash, ...u }) => u;

export const LIST_INCLUDE = { category: true, citizen: { select: { name: true } }, team: { select: { name: true } } };
export const FULL_INCLUDE = {
  ...LIST_INCLUDE,
  history: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { name: true } } } },
  notes: { orderBy: { createdAt: 'asc' }, include: { author: { select: { name: true, role: true } } } },
};

// Shape matches what the React client already consumes. Internal admin/team notes are hidden from citizens.
export const complaintOut = (c, user) => ({
  id: c.code, title: c.title, description: c.description, categoryId: c.categoryId, categoryName: c.category?.name, categorySlug: c.category?.slug,
  address: c.address, lat: c.latitude, lng: c.longitude, photo: c.photoPath ? `/uploads/${c.photoPath}` : null, contact: c.contact,
  severity: c.severity, priority: c.priority, suggestedPriority: c.suggestedPriority, status: STATUS_LABEL[c.status],
  citizenId: c.citizenId, citizenName: c.citizen?.name, teamId: c.teamId, teamName: c.team?.name,
  createdAt: c.createdAt, updatedAt: c.updatedAt, resolvedAt: c.resolvedAt,
  history: (c.history || []).map((h) => ({ from: h.fromStatus ? STATUS_LABEL[h.fromStatus] : null, to: STATUS_LABEL[h.toStatus], by: h.changedById, byName: h.changedBy?.name || 'System', at: h.createdAt, remarks: h.remarks || '' })),
  notes: user?.role === 'citizen' ? [] : (c.notes || []).map((n) => ({ id: n.id, text: n.text, by: n.authorId, byName: n.author?.name, role: n.author?.role, at: n.createdAt })),
});

// Which complaints a user may see. Enforced in every query, never only in the UI.
export const scopeWhere = (u) => (u.role === 'admin' ? {} : u.role === 'citizen' ? { citizenId: u.id } : { teamId: u.teamId ?? -1 });
