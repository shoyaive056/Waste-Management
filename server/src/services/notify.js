// All helpers take a Prisma client or transaction so notifications commit with the change that caused them.
export const notifyUser = (db, userId, text, complaintId) => db.notification.create({ data: { userId, text, complaintId } });
export async function notifyMany(db, userIds, text, complaintId) {
  if (userIds.length) await db.notification.createMany({ data: userIds.map((userId) => ({ userId, text, complaintId })) });
}
export const adminIds = async (db) => (await db.user.findMany({ where: { role: 'admin', active: true }, select: { id: true } })).map((u) => u.id);
export const teamMemberIds = async (db, teamId) => (await db.user.findMany({ where: { teamId, active: true }, select: { id: true } })).map((u) => u.id);
