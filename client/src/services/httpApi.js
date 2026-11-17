// Real backend implementation of the same methods as mockApi.js.
import { http } from './http';

const ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const TOKEN = 'swms_token';
const call = (p) => p.then((r) => r.data).catch((e) => { throw new Error(e.response?.data?.message || 'Cannot reach the server. Is the backend running?'); });
const fixC = (c) => (c && c.photo && c.photo.startsWith('/') ? { ...c, photo: ORIGIN + c.photo } : c); // make photo URLs absolute
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined && v !== null));

export const httpApi = {
  async login(email, password) { const d = await call(http.post('/auth/login', { email, password })); localStorage.setItem(TOKEN, d.token); return d.user; },
  async register(data) { const d = await call(http.post('/auth/register', data)); localStorage.setItem(TOKEN, d.token); return d.user; },
  async me() {
    if (!localStorage.getItem(TOKEN)) return null;
    try { return (await http.get('/auth/me')).data.user; } catch { localStorage.removeItem(TOKEN); return null; }
  },
  logout() { localStorage.removeItem(TOKEN); },
  updateProfile: async (d) => (await call(http.put('/auth/profile', d))).user,

  categories: async () => (await call(http.get('/categories'))).items,
  addCategory: async (name) => (await call(http.post('/categories', { name }))).category,
  toggleCategory: async (id) => (await call(http.patch(`/categories/${id}/toggle`))).category,

  async complaints(f = {}) {
    const { statusIn, ...rest } = f;
    const d = await call(http.get('/complaints', { params: clean({ ...rest, statusIn: statusIn?.join(',') }) }));
    return { ...d, items: d.items.map(fixC) };
  },
  complaint: async (id) => fixC((await call(http.get(`/complaints/${id}`))).complaint),
  async createComplaint({ photo, lat, lng, ...rest }) {
    const fd = new FormData();
    Object.entries({ ...rest, latitude: lat, longitude: lng }).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', await (await fetch(photo)).blob(), 'photo.jpg'); // client sends a resized data URL
    return fixC((await call(http.post('/complaints', fd))).complaint);
  },
  setStatus: async (id, status, remarks = '') => fixC((await call(http.patch(`/complaints/${id}/status`, { status, remarks }))).complaint),
  setPriority: async (id, priority) => fixC((await call(http.patch(`/complaints/${id}/priority`, { priority }))).complaint),
  assign: async (id, teamId, remarks = '') => fixC((await call(http.post(`/complaints/${id}/assign`, { teamId: Number(teamId), remarks }))).complaint),
  addNote: async (id, text) => fixC((await call(http.post(`/complaints/${id}/notes`, { text }))).complaint),

  citizens: async () => (await call(http.get('/users/citizens'))).items,
  toggleCitizen: async (id) => (await call(http.patch(`/users/${id}/toggle`))).user,
  teams: async () => (await call(http.get('/teams'))).items,
  async saveTeam({ id, name, leader, phone, email, area, available }) {
    const body = { name, leader, phone, email, area, available };
    return call(id ? http.put(`/teams/${id}`, body) : http.post('/teams', body));
  },

  notifications: async () => (await call(http.get('/notifications'))).items,
  markRead: (id) => call(http.patch(`/notifications/${id}/read`)),
  markAllRead: () => call(http.patch('/notifications/read-all')),
  stats: ({ from, to } = {}) => call(http.get('/statistics/overview', { params: clean({ from, to }) })),
};
