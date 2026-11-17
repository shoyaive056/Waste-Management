import { prisma } from '../config/prisma.js';
import { STATUS_LABEL, STATUS_LABELS } from '../utils/enums.js';
import { scopeWhere } from '../utils/serialize.js';

const ORDER = ['Pending', 'Approved', 'Assigned', 'InProgress', 'Resolved', 'Rejected'];

// Aggregations run in PostgreSQL (groupBy/count); only date columns are read to build monthly buckets and the average.
export async function buildStats(user, { from, to } = {}) {
  const where = { AND: [scopeWhere(user), from ? { createdAt: { gte: new Date(from) } } : {}, to ? { createdAt: { lte: new Date(to + 'T23:59:59.999Z') } } : {}] };
  const [byStatus, byPriority, byCat, cats, teamRows, teams, dates, citizensTotal] = await Promise.all([
    prisma.complaint.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.complaint.groupBy({ by: ['priority'], where, _count: { _all: true } }),
    prisma.complaint.groupBy({ by: ['categoryId'], where, _count: { _all: true } }),
    prisma.wasteCategory.findMany(),
    prisma.complaint.groupBy({ by: ['teamId', 'status'], where: { AND: [where, { teamId: { not: null } }] }, _count: { _all: true } }),
    prisma.collectionTeam.findMany({ orderBy: { id: 'asc' } }),
    prisma.complaint.findMany({ where, select: { createdAt: true, resolvedAt: true } }),
    user.role === 'admin' ? prisma.user.count({ where: { role: 'citizen' } }) : Promise.resolve(0),
  ]);
  const sc = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
  const total = byStatus.reduce((a, r) => a + r._count._all, 0);
  const months = {};
  dates.forEach((d) => {
    const m = d.createdAt.toISOString().slice(0, 7); (months[m] ||= { month: m, received: 0, resolved: 0 }).received++;
    if (d.resolvedAt) { const r = d.resolvedAt.toISOString().slice(0, 7); (months[r] ||= { month: r, received: 0, resolved: 0 }).resolved++; }
  });
  const done = dates.filter((d) => d.resolvedAt);
  const avgDays = done.length ? done.reduce((a, d) => a + (d.resolvedAt - d.createdAt) / 864e5, 0) / done.length : 0;
  return {
    total, pending: sc.Pending || 0, inProgress: (sc.Approved || 0) + (sc.Assigned || 0) + (sc.InProgress || 0), resolved: sc.Resolved || 0,
    byStatus: ORDER.map((s) => ({ name: STATUS_LABEL[s], value: sc[s] || 0 })),
    byPriority: ['High', 'Medium', 'Low'].map((p) => ({ name: p, value: byPriority.find((r) => r.priority === p)?._count._all || 0 })),
    byCategory: byCat.map((r) => ({ name: cats.find((c) => c.id === r.categoryId)?.name, value: r._count._all })),
    monthly: Object.values(months).sort((a, b) => a.month.localeCompare(b.month)), avgDays: +avgDays.toFixed(1),
    teamPerformance: teams.map((t) => { const rows = teamRows.filter((r) => r.teamId === t.id); const assigned = rows.reduce((a, r) => a + r._count._all, 0); const resolved = rows.find((r) => r.status === 'Resolved')?._count._all || 0; return { team: t.name, assigned, resolved, rate: assigned ? Math.round((resolved / assigned) * 100) : 0 }; }),
    teamsTotal: teams.length, teamsActive: teams.filter((t) => t.available).length, citizensTotal,
  };
}
export { STATUS_LABELS };
