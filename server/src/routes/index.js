import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.js';
import * as cx from '../controllers/complaints.js';
import * as dir from '../controllers/directory.js';
import * as st from '../controllers/stats.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadPhoto, verifyImageSignature } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import * as v from '../validators/schemas.js';

const r = Router();
const adminOnly = authorize('admin');
// Brute-force protection on credential endpoints (relaxed under test).
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'test' ? 1000 : 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Try again in a few minutes.' } });

// Auth
r.post('/auth/register', authLimit, validate(v.registerSchema), auth.register);
r.post('/auth/login', authLimit, validate(v.loginSchema), auth.login);
r.post('/auth/logout', authenticate, auth.logout);
r.get('/auth/me', authenticate, auth.me);
r.put('/auth/profile', authenticate, validate(v.profileSchema), auth.updateProfile);

// Complaints
r.post('/complaints', authenticate, authorize('citizen'), uploadPhoto, (req, _res, next) => { try { verifyImageSignature(req.file); next(); } catch (e) { next(e); } }, validate(v.complaintCreateSchema), cx.create);
r.get('/complaints', authenticate, validate(v.listQuerySchema, 'query'), cx.list);
r.get('/complaints/:id', authenticate, cx.get);
r.put('/complaints/:id', authenticate, authorize('citizen', 'admin'), validate(v.complaintUpdateSchema), cx.update);
r.delete('/complaints/:id', authenticate, authorize('citizen', 'admin'), cx.remove);
r.patch('/complaints/:id/status', authenticate, authorize('admin', 'team'), validate(v.statusSchema), cx.setStatus);
r.patch('/complaints/:id/priority', authenticate, adminOnly, validate(v.prioritySchema), cx.setPriority);
r.post('/complaints/:id/assign', authenticate, adminOnly, validate(v.assignSchema), cx.assign);
r.post('/complaints/:id/notes', authenticate, authorize('admin', 'team'), validate(v.noteSchema), cx.addNote);

// Teams, categories, citizens
r.get('/teams', authenticate, adminOnly, dir.teams);
r.post('/teams', authenticate, adminOnly, validate(v.teamSchema), dir.createTeam);
r.put('/teams/:id', authenticate, adminOnly, validate(v.teamSchema.partial()), dir.updateTeam);
r.get('/teams/:id/tasks', authenticate, authorize('admin', 'team'), dir.teamTasks);
r.get('/categories', authenticate, dir.categories);
r.post('/categories', authenticate, adminOnly, validate(v.categorySchema), dir.addCategory);
r.patch('/categories/:id/toggle', authenticate, adminOnly, dir.toggleCategory);
r.get('/users/citizens', authenticate, adminOnly, dir.citizens);
r.patch('/users/:id/toggle', authenticate, adminOnly, dir.toggleCitizen);

// Dashboards, statistics, map
r.get('/dashboard/citizen', authenticate, authorize('citizen'), st.dashboard);
r.get('/dashboard/admin', authenticate, adminOnly, st.dashboard);
r.get('/dashboard/team', authenticate, authorize('team'), st.dashboard);
r.get('/statistics/overview', authenticate, validate(v.rangeSchema, 'query'), st.overview);
r.get('/statistics/categories', authenticate, adminOnly, validate(v.rangeSchema, 'query'), st.categories);
r.get('/statistics/monthly', authenticate, adminOnly, validate(v.rangeSchema, 'query'), st.monthly);
r.get('/statistics/performance', authenticate, adminOnly, validate(v.rangeSchema, 'query'), st.performance);
r.get('/map/complaints', authenticate, st.mapComplaints);

// Notifications
r.get('/notifications', authenticate, dir.notifications);
r.patch('/notifications/read-all', authenticate, dir.markAllRead);
r.patch('/notifications/:id/read', authenticate, dir.markRead);

export default r;
