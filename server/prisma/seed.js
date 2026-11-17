// Demo data: 1 admin, 4 citizens, 3 teams (+ leader logins), 8 categories, 24 complaints around Conakry.
// Demo credentials are documented in README.md. Run: npm run db:seed
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { suggestPriority } from '../src/services/priority.js';

const prisma = new PrismaClient();
let s = 42; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const pick = (a) => a[Math.floor(rnd() * a.length)];

const CATS = [['Overflowing Garbage Bin', 'overflowing-bin'], ['Illegal Dumping', 'illegal-dumping'], ['Delayed Waste Collection', 'delayed-collection'], ['Household Waste', 'household-waste'], ['Commercial Waste', 'commercial-waste'], ['Plastic Waste', 'plastic-waste'], ['Construction Waste', 'construction-waste'], ['Other', 'other']];
const AREAS = [['Kaloum', 9.5092, -13.7122, 0], ['Dixinn', 9.541, -13.68, 0], ['Matam', 9.533, -13.656, 2], ['Ratoma', 9.587, -13.643, 1], ['Matoto', 9.562, -13.615, 2]];
const SAMPLE = [
  ['Bin overflowing near the market', 'The bin by the market has not been emptied for days and waste is blocking the road.', 'overflowing-bin', 'high'],
  ['Illegal dumping behind the school', 'Large pile of mixed waste dumped behind the primary school, strong smell, children walk past.', 'illegal-dumping', 'high'],
  ['Collection missed this week', 'Our street was skipped by the collection truck twice.', 'delayed-collection', 'medium'],
  ['Household waste on the corner', 'Bags of household waste piling up on the street corner.', 'household-waste', 'low'],
  ['Shop waste left on pavement', 'Commercial waste from nearby shops left on the pavement.', 'commercial-waste', 'medium'],
  ['Plastic bottles in the drain', 'Plastic bottles are clogging the drain after rain.', 'plastic-waste', 'medium'],
  ['Rubble from construction site', 'Construction rubble left on the roadside.', 'construction-waste', 'medium'],
  ['Small litter pile', 'Small pile of litter near the bus stop.', 'other', 'low'],
];
const FLOW = ['Pending', 'Pending', 'Approved', 'Assigned', 'InProgress', 'Resolved', 'Resolved', 'Resolved', 'Rejected'];
const PATH = { Pending: ['Pending'], Approved: ['Pending', 'Approved'], Assigned: ['Pending', 'Approved', 'Assigned'], InProgress: ['Pending', 'Approved', 'Assigned', 'InProgress'], Resolved: ['Pending', 'Approved', 'Assigned', 'InProgress', 'Resolved'], Rejected: ['Pending', 'Rejected'] };
const LABEL = { InProgress: 'In Progress' };

async function main() {
  const hash = (p) => bcrypt.hash(p, 10);
  const cats = await Promise.all(CATS.map(([name, slug]) => prisma.wasteCategory.upsert({ where: { slug }, update: {}, create: { name, slug } })));
  const teamDefs = [['Kaloum Clean Crew', 'Sekou Keita', 'team@swms.demo', 'Kaloum & Dixinn', true], ['Ratoma Rapid Response', 'Alpha Conde Jr.', 'team2@swms.demo', 'Ratoma', true], ['Matoto Green Squad', 'Ousmane Toure', 'team3@swms.demo', 'Matam & Matoto', false]];
  const teams = []; const teamUsers = [];
  for (const [i, [name, leader, email, area, available]] of teamDefs.entries()) {
    const phone = `+224 621 ${i + 1}0 ${i + 1}0 ${i + 1}0`;
    const t = await prisma.collectionTeam.upsert({ where: { name }, update: {}, create: { name, leader, phone, email, area, available } });
    teams.push(t); const teamPasswordHash = await hash('Team@1234');
    teamUsers.push(await prisma.user.upsert({ where: { email }, update: {}, create: { name: leader, email, phone: t.phone, address: area, passwordHash: teamPasswordHash, role: 'team', teamId: t.id } }));
  }
  const adminHash = await hash('Admin@123');
  const admin = await prisma.user.upsert({ where: { email: 'admin@swms.demo' }, update: {}, create: { name: 'Aminata Camara', email: 'admin@swms.demo', phone: '+224 620 00 00 01', address: 'Conakry, Guinea', passwordHash: adminHash, role: 'admin' } });
  const citizens = [];
  for (const [name, email] of [['Mamadou Diallo', 'citizen@swms.demo'], ['Fatoumata Bah', 'fatoumata@swms.demo'], ['Ibrahima Sow', 'ibrahima@swms.demo'], ['Mariama Barry', 'mariama@swms.demo']]) {
    const passwordHash = await hash('Citizen@123');
    citizens.push(await prisma.user.upsert({ where: { email }, update: {}, create: { name, email, phone: '+224 620 00 00 02', address: 'Conakry, Guinea', passwordHash, role: 'citizen' } }));
  }

  for (let i = 0; i < 24; i++) {
    const [title, desc, slug, severity] = pick(SAMPLE); const cat = cats.find((c) => c.slug === slug);
    const [area, lat, lng, teamIdx] = pick(AREAS); const citizen = pick([citizens[0], citizens[0], citizens[1], citizens[2], citizens[3]]);
    const created = new Date(Date.now() - rnd() * 150 * 864e5); const status = FLOW[i % FLOW.length]; const path = PATH[status];
    const priority = suggestPriority({ categorySlug: slug, severity, text: `${title} ${desc}` });
    const at = (k) => new Date(created.getTime() + k * 8 * 36e5);
    const team = path.includes('Assigned') ? teams[teamIdx] : null;
    const data = {
      code: `WM-2026-${String(i + 1).padStart(4, '0')}`, title: `${title} (${area})`, description: `${desc} [Demo data]`, categoryId: cat.id, address: `${area}, Conakry`,
      latitude: lat + (rnd() - 0.5) * 0.03, longitude: lng + (rnd() - 0.5) * 0.03, contact: citizen.phone, severity, priority, suggestedPriority: priority, status, citizenId: citizen.id,
      teamId: team?.id ?? null, createdAt: created, resolvedAt: status === 'Resolved' ? at(path.length - 1) : null,
    };
    const existing = await prisma.complaint.findUnique({ where: { code: data.code } });
    if (existing && !existing.description.endsWith('[Demo data]')) throw new Error(`Seed refused to overwrite non-demo complaint ${data.code}.`);
    const c = existing || await prisma.complaint.create({ data });
    if (!existing) {
      for (const [k, st] of path.entries()) await prisma.complaintStatusHistory.create({ data: { complaintId: c.id, fromStatus: k ? path[k - 1] : null, toStatus: st, changedById: k ? admin.id : citizen.id, createdAt: at(k), remarks: k ? null : 'Complaint submitted' } });
      if (team) await prisma.teamAssignment.create({ data: { complaintId: c.id, teamId: team.id, assignedById: admin.id, assignedAt: at(2) } });
    }
    if (i < 8) {
      const notices = [
        { userId: citizen.id, text: `${c.code} is now ${LABEL[status] || status}` },
        { userId: admin.id, text: `New complaint ${c.code} submitted` },
        ...(team ? [{ userId: teamUsers[teamIdx].id, text: `Task ${c.code} assigned to your team` }] : []),
      ];
      for (const n of notices) if (!(await prisma.notification.findFirst({ where: { userId: n.userId, complaintId: c.id, text: n.text } }))) await prisma.notification.create({ data: { ...n, complaintId: c.id } });
    }
  }
  console.log('Seeded demo data. See README for demo logins.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
