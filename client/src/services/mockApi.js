// Frontend-phase data layer. Persists to localStorage and mimics the REST API
// the Express backend will expose. Passwords are stored in plain text HERE ONLY
// because this is a throwaway mock; the real backend uses bcrypt.
import { suggestPriority } from '../utils/priority';

export const STATUSES = ['Pending', 'Approved', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const KEY = 'swms_db_v1';
const SESSION = 'swms_session';
const wait = () => new Promise((r) => setTimeout(r, 90));
const now = () => new Date().toISOString();
let db = null;

const CATS = [
  ['Overflowing Garbage Bin', 'overflowing-bin'], ['Illegal Dumping', 'illegal-dumping'],
  ['Delayed Waste Collection', 'delayed-collection'], ['Household Waste', 'household-waste'],
  ['Commercial Waste', 'commercial-waste'], ['Plastic Waste', 'plastic-waste'],
  ['Construction Waste', 'construction-waste'], ['Other', 'other'],
];
const AREAS = [
  ['Kaloum', 9.5092, -13.7122, 't1'], ['Dixinn', 9.5410, -13.6800, 't1'], ['Matam', 9.5330, -13.6560, 't3'],
  ['Ratoma', 9.5870, -13.6430, 't2'], ['Matoto', 9.5620, -13.6150, 't3'],
];
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

function seed() {
  let s = 42;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const d = { seq: 0, nseq: 0, nid: 100, users: [], categories: [], teams: [], complaints: [], notifications: [] };
  d.categories = CATS.map(([name, slug], i) => ({ id: 'c' + (i + 1), name, slug, active: true }));
  const mk = (id, name, email, role, extra = {}) => ({ id, name, email, password: role === 'admin' ? 'Admin@123' : role === 'team' ? 'Team@1234' : 'Citizen@123', role, phone: '+224 620 00 00 ' + id.slice(1).padStart(2, '0'), address: 'Conakry, Guinea', active: true, createdAt: now(), ...extra });
  d.users = [
    mk('u1', 'Aminata Camara', 'admin@swms.demo', 'admin'),
    mk('u2', 'Mamadou Diallo', 'citizen@swms.demo', 'citizen'), mk('u3', 'Fatoumata Bah', 'fatoumata@swms.demo', 'citizen'),
    mk('u4', 'Ibrahima Sow', 'ibrahima@swms.demo', 'citizen'), mk('u5', 'Mariama Barry', 'mariama@swms.demo', 'citizen'),
    mk('u6', 'Sekou Keita', 'team@swms.demo', 'team', { teamId: 't1' }),
    mk('u7', 'Alpha Conde Jr.', 'team2@swms.demo', 'team', { teamId: 't2' }),
    mk('u8', 'Ousmane Toure', 'team3@swms.demo', 'team', { teamId: 't3' }),
  ];
  d.teams = [
    { id: 't1', name: 'Kaloum Clean Crew', leader: 'Sekou Keita', phone: '+224 621 10 10 10', email: 'team@swms.demo', area: 'Kaloum & Dixinn', available: true },
    { id: 't2', name: 'Ratoma Rapid Response', leader: 'Alpha Conde Jr.', phone: '+224 621 20 20 20', email: 'team2@swms.demo', area: 'Ratoma', available: true },
    { id: 't3', name: 'Matoto Green Squad', leader: 'Ousmane Toure', phone: '+224 621 30 30 30', email: 'team3@swms.demo', area: 'Matam & Matoto', available: false },
  ];
  const flow = ['Pending', 'Pending', 'Approved', 'Assigned', 'In Progress', 'Resolved', 'Resolved', 'Resolved', 'Rejected'];
  for (let i = 0; i < 24; i++) {
    const [title, desc, slug, severity] = pick(SAMPLE);
    const cat = d.categories.find((c) => c.slug === slug);
    const [area, lat, lng, team] = pick(AREAS);
    const created = new Date(Date.now() - rnd() * 150 * 864e5);
    const status = flow[i % flow.length];
    const sug = suggestPriority({ categorySlug: slug, severity, text: title + ' ' + desc });
    const citizenId = pick(['u2', 'u2', 'u3', 'u4', 'u5']);
    const path = ['Pending'];
    if (['Approved', 'Assigned', 'In Progress', 'Resolved'].includes(status)) path.push('Approved');
    if (['Assigned', 'In Progress', 'Resolved'].includes(status)) path.push('Assigned');
    if (['In Progress', 'Resolved'].includes(status)) path.push('In Progress');
    if (status === 'Resolved') path.push('Resolved');
    if (status === 'Rejected') path.push('Rejected');
    const history = path.map((st, k) => ({ from: k ? path[k - 1] : null, to: st, by: k ? 'u1' : citizenId, byName: k ? 'Aminata Camara' : 'Citizen', at: new Date(created.getTime() + k * 36e5 * 8).toISOString(), remarks: k ? '' : 'Complaint submitted' }));
    d.complaints.push({
      id: `WM-2026-${String(++d.seq).padStart(4, '0')}`, title: `${title} (${area})`, description: desc + ' [Demo data]', categoryId: cat.id,
      address: `${area}, Conakry`, lat: lat + (rnd() - 0.5) * 0.03, lng: lng + (rnd() - 0.5) * 0.03, photo: null, contact: '+224 620 00 00 01',
      severity, priority: sug.priority, suggestedPriority: sug.priority, status, citizenId, demo: true,
      teamId: path.includes('Assigned') ? team : null, createdAt: created.toISOString(), updatedAt: history.at(-1).at,
      resolvedAt: status === 'Resolved' ? history.at(-1).at : null, history, notes: [],
    });
  }
  const last = d.complaints.slice(0, 8);
  last.forEach((c) => {
    d.notifications.push({ id: 'n' + ++d.nseq, userId: c.citizenId, text: `${c.id} is now ${c.status}`, complaintId: c.id, read: false, at: c.updatedAt });
    d.notifications.push({ id: 'n' + ++d.nseq, userId: 'u1', text: `New complaint ${c.id} submitted`, complaintId: c.id, read: false, at: c.createdAt });
    if (c.teamId) d.notifications.push({ id: 'n' + ++d.nseq, userId: d.users.find((u) => u.teamId === c.teamId).id, text: `Task ${c.id} assigned to your team`, complaintId: c.id, read: false, at: c.updatedAt });
  });
  return d;
}
const load = () => {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
  if (!db) { db = seed(); save(); }
  return db;
};
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const safe = ({ password, ...u }) => u;
const notify = (d, userId, text, complaintId) => d.notifications.unshift({ id: 'n' + ++d.nseq, userId, text, complaintId, read: false, at: now() });
const enrich = (c, d) => ({
  ...c, citizenName: d.users.find((u) => u.id === c.citizenId)?.name, categoryName: d.categories.find((x) => x.id === c.categoryId)?.name,
  categorySlug: d.categories.find((x) => x.id === c.categoryId)?.slug, teamName: d.teams.find((t) => t.id === c.teamId)?.name,
});
const scope = (d, u) => d.complaints.filter((c) => u.role === 'admin' || (u.role === 'citizen' && c.citizenId === u.id) || (u.role === 'team' && c.teamId === u.teamId));
const need = (u, ...roles) => { if (!u || !roles.includes(u.role)) throw new Error('You do not have permission to do this.'); };
const getUser = (d) => { const id = localStorage.getItem(SESSION); const u = d.users.find((x) => x.id === id); return u && u.active ? u : null; };

export const mockApi = {
  async login(email, password) {
    await wait(); const d = load();
    const u = d.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) throw new Error('Incorrect email or password.');
    if (!u.active) throw new Error('This account is deactivated. Contact an administrator.');
    localStorage.setItem(SESSION, u.id); return safe(u);
  },
  async register(data) {
    await wait(); const d = load();
    if (d.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('An account with this email already exists.');
    const u = { id: 'u' + (d.users.length + 1 + Math.floor(Math.random() * 1e4)), name: data.name, email: data.email, password: data.password, phone: data.phone, address: data.address, role: 'citizen', active: true, createdAt: now() };
    d.users.push(u); save(); localStorage.setItem(SESSION, u.id); return safe(u);
  },
  async me() { await wait(); const u = getUser(load()); return u ? safe(u) : null; },
  logout() { localStorage.removeItem(SESSION); },
  async updateProfile(data) {
    await wait(); const d = load(); const u = getUser(d); Object.assign(u, { name: data.name, phone: data.phone, address: data.address }); save(); return safe(u);
  },
  async categories() { await wait(); return load().categories; },
  async addCategory(name) {
    await wait(); const d = load(); need(getUser(d), 'admin');
    const c = { id: 'c' + (d.categories.length + 1 + Date.now() % 1000), name, slug: name.toLowerCase().replace(/\W+/g, '-'), active: true }; d.categories.push(c); save(); return c;
  },
  async toggleCategory(id) { await wait(); const d = load(); need(getUser(d), 'admin'); const c = d.categories.find((x) => x.id === id); c.active = !c.active; save(); return c; },

  async complaints(f = {}) {
    await wait(); const d = load(); const u = getUser(d); need(u, 'admin', 'citizen', 'team');
    const q = (f.q || '').toLowerCase();
    let items = scope(d, u).map((c) => enrich(c, d)).filter((c) =>
      (!q || [c.id, c.title, c.citizenName, c.categoryName, c.address].some((v) => v?.toLowerCase().includes(q))) &&
      (!f.status || c.status === f.status) && (!f.statusIn || f.statusIn.includes(c.status)) && (!f.priority || c.priority === f.priority) &&
      (!f.categoryId || c.categoryId === f.categoryId) && (!f.teamId || c.teamId === f.teamId) &&
      (!f.location || c.address.toLowerCase().includes(f.location.toLowerCase())) &&
      (!f.from || c.createdAt >= f.from) && (!f.to || c.createdAt <= f.to + 'T23:59:59'));
    const rank = { High: 0, Medium: 1, Low: 2 };
    items.sort((a, b) => f.sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : f.sort === 'priority' ? rank[a.priority] - rank[b.priority] : b.createdAt.localeCompare(a.createdAt));
    const page = f.page || 1, pageSize = f.pageSize || 8;
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  },
  async complaint(id) {
    await wait(); const d = load(); const u = getUser(d);
    const c = scope(d, u).find((x) => x.id === id); if (!c) throw new Error('Complaint not found or you do not have access to it.');
    return enrich(c, d);
  },
  async createComplaint(data) {
    await wait(); const d = load(); const u = getUser(d); need(u, 'citizen');
    const cat = d.categories.find((c) => c.id === data.categoryId);
    const sug = suggestPriority({ categorySlug: cat.slug, severity: data.severity, text: data.title + ' ' + data.description });
    const c = { id: `WM-2026-${String(++d.seq).padStart(4, '0')}`, ...data, priority: sug.priority, suggestedPriority: sug.priority, status: 'Pending', citizenId: u.id, teamId: null, createdAt: now(), updatedAt: now(), resolvedAt: null, notes: [],
      history: [{ from: null, to: 'Pending', by: u.id, byName: u.name, at: now(), remarks: 'Complaint submitted' }] };
    d.complaints.unshift(c);
    d.users.filter((x) => x.role === 'admin').forEach((a) => notify(d, a.id, `New complaint ${c.id} submitted`, c.id));
    notify(d, u.id, `Your complaint ${c.id} was received`, c.id); save(); return enrich(c, d);
  },
  async setStatus(id, status, remarks = '') {
    await wait(); const d = load(); const u = getUser(d); need(u, 'admin', 'team');
    const c = d.complaints.find((x) => x.id === id); if (!c || (u.role === 'team' && c.teamId !== u.teamId)) throw new Error('You can only update tasks assigned to your team.');
    if (u.role === 'team' && !['In Progress', 'Resolved'].includes(status)) throw new Error('Teams can only mark tasks In Progress or Resolved.');
    if (c.status === status) throw new Error('The complaint already has this status.');
    c.history.push({ from: c.status, to: status, by: u.id, byName: u.name, at: now(), remarks }); c.status = status; c.updatedAt = now();
    if (status === 'Resolved') c.resolvedAt = now();
    notify(d, c.citizenId, `${c.id} is now ${status}`, c.id);
    if (u.role === 'team') d.users.filter((x) => x.role === 'admin').forEach((a) => notify(d, a.id, `${c.id} marked ${status} by ${u.name}`, c.id));
    save(); return enrich(c, d);
  },
  async setPriority(id, priority) {
    await wait(); const d = load(); need(getUser(d), 'admin'); const c = d.complaints.find((x) => x.id === id); c.priority = priority; c.updatedAt = now(); save(); return enrich(c, d);
  },
  async assign(id, teamId, remarks = '') {
    await wait(); const d = load(); const u = getUser(d); need(u, 'admin');
    const c = d.complaints.find((x) => x.id === id); const t = d.teams.find((x) => x.id === teamId);
    if (!t) throw new Error('Choose a team.'); if (!t.available) throw new Error(`${t.name} is currently unavailable.`);
    c.teamId = teamId; c.history.push({ from: c.status, to: 'Assigned', by: u.id, byName: u.name, at: now(), remarks: remarks || `Assigned to ${t.name}` });
    c.status = 'Assigned'; c.updatedAt = now();
    d.users.filter((x) => x.teamId === teamId).forEach((m) => notify(d, m.id, `Task ${c.id} assigned to your team`, c.id));
    notify(d, c.citizenId, `${c.id} was assigned to ${t.name}`, c.id); save(); return enrich(c, d);
  },
  async addNote(id, text) {
    await wait(); const d = load(); const u = getUser(d); need(u, 'admin', 'team');
    const c = d.complaints.find((x) => x.id === id); c.notes.push({ id: 'note' + Date.now(), text, by: u.id, byName: u.name, role: u.role, at: now() }); save(); return enrich(c, d);
  },

  async citizens() { await wait(); const d = load(); need(getUser(d), 'admin'); return d.users.filter((u) => u.role === 'citizen').map((u) => ({ ...safe(u), reports: d.complaints.filter((c) => c.citizenId === u.id).length })); },
  async toggleCitizen(id) { await wait(); const d = load(); need(getUser(d), 'admin'); const u = d.users.find((x) => x.id === id); u.active = !u.active; save(); return safe(u); },
  async teams() { await wait(); return load().teams; },
  async saveTeam(t) {
    await wait(); const d = load(); need(getUser(d), 'admin');
    if (t.id) Object.assign(d.teams.find((x) => x.id === t.id), t);
    else { const id = 't' + (Date.now() % 100000); d.teams.push({ ...t, id }); d.users.push({ id: 'u' + id, name: t.leader, email: t.email, password: 'Team@1234', role: 'team', teamId: id, phone: t.phone, address: t.area, active: true, createdAt: now() }); }
    save();
  },

  async notifications() { await wait(); const d = load(); const u = getUser(d); return d.notifications.filter((n) => n.userId === u.id); },
  async markRead(id) { await wait(); const d = load(); const n = d.notifications.find((x) => x.id === id); if (n) n.read = true; save(); },
  async markAllRead() { await wait(); const d = load(); const u = getUser(d); d.notifications.forEach((n) => { if (n.userId === u.id) n.read = true; }); save(); },

  // Aggregated statistics (mirrors GET /api/statistics/* + /api/dashboard/*)
  async stats({ from, to } = {}) {
    await wait(); const d = load(); const u = getUser(d);
    const list = scope(d, u).filter((c) => (!from || c.createdAt >= from) && (!to || c.createdAt <= to + 'T23:59:59'));
    const count = (key, vals) => vals.map((v) => ({ name: v, value: list.filter((c) => c[key] === v).length }));
    const months = {};
    list.forEach((c) => {
      const m = c.createdAt.slice(0, 7); (months[m] ||= { month: m, received: 0, resolved: 0 }).received++;
      if (c.resolvedAt) { const r = c.resolvedAt.slice(0, 7); (months[r] ||= { month: r, received: 0, resolved: 0 }).resolved++; }
    });
    const resolved = list.filter((c) => c.resolvedAt);
    const avgDays = resolved.length ? resolved.reduce((a, c) => a + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 864e5, 0) / resolved.length : 0;
    return {
      total: list.length, pending: list.filter((c) => c.status === 'Pending').length,
      inProgress: list.filter((c) => ['Approved', 'Assigned', 'In Progress'].includes(c.status)).length, resolved: resolved.length,
      byStatus: count('status', STATUSES), byPriority: count('priority', ['High', 'Medium', 'Low']),
      byCategory: d.categories.map((c) => ({ name: c.name, value: list.filter((x) => x.categoryId === c.id).length })).filter((x) => x.value),
      monthly: Object.values(months).sort((a, b) => a.month.localeCompare(b.month)), avgDays: +avgDays.toFixed(1),
      teamPerformance: d.teams.map((t) => { const a = list.filter((c) => c.teamId === t.id); const r = a.filter((c) => c.status === 'Resolved').length; return { team: t.name, assigned: a.length, resolved: r, rate: a.length ? Math.round((r / a.length) * 100) : 0 }; }),
      teamsTotal: d.teams.length, teamsActive: d.teams.filter((t) => t.available).length, citizensTotal: d.users.filter((x) => x.role === 'citizen').length,
    };
  },
  reset() { localStorage.removeItem(KEY); localStorage.removeItem(SESSION); db = null; },
};
