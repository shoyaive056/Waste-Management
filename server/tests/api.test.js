// Integration tests: need PostgreSQL migrated and seeded (npm run db:migrate && npm run db:seed) and a .env file.
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';

const login = async (email, password) => (await request(app).post('/api/auth/login').send({ email, password })).body.token;
const auth = (t) => ({ Authorization: `Bearer ${t}` });
let admin, citizen, team, code;

beforeAll(async () => {
  admin = await login('admin@swms.demo', 'Admin@123'); citizen = await login('citizen@swms.demo', 'Citizen@123'); team = await login('team@swms.demo', 'Team@1234');
});

describe('authentication', () => {
  it('rejects weak passwords and duplicate emails', async () => {
    const base = { name: 'Test User', email: `t${Date.now()}@mail.test`, phone: '+224 620 11 22 33', address: 'Conakry centre' };
    expect((await request(app).post('/api/auth/register').send({ ...base, password: 'weak' })).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send({ ...base, password: 'Strong@123' })).status).toBe(201);
    expect((await request(app).post('/api/auth/register').send({ ...base, password: 'Strong@123' })).status).toBe(409);
  });
  it('rejects a wrong password and unauthenticated access', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: 'admin@swms.demo', password: 'nope' })).status).toBe(401);
    expect((await request(app).get('/api/complaints')).status).toBe(401);
  });
});

describe('authorization', () => {
  it('blocks citizens and teams from admin APIs', async () => {
    expect((await request(app).get('/api/teams').set(auth(citizen))).status).toBe(403);
    expect((await request(app).get('/api/users/citizens').set(auth(team))).status).toBe(403);
  });
});

describe('complaint lifecycle', () => {
  it('citizen creates a Pending complaint with a computed priority and an admin notification', async () => {
    const cats = (await request(app).get('/api/categories').set(auth(citizen))).body.items;
    const res = await request(app).post('/api/complaints').set(auth(citizen)).field('title', 'Bin overflowing near the market').field('description', 'Overflowing and blocking the road for three days')
      .field('categoryId', cats[0].id).field('severity', 'high').field('address', 'Dixinn, Conakry').field('contact', '+224 620 00 00 02').field('latitude', 9.54).field('longitude', -13.68);
    expect(res.status).toBe(201); expect(res.body.complaint.status).toBe('Pending'); expect(res.body.complaint.priority).toBe('High'); code = res.body.complaint.id;
    const notes = (await request(app).get('/api/notifications').set(auth(admin))).body.items;
    expect(notes.some((n) => n.complaintId === code)).toBe(true);
  });
  it('hides the complaint from other citizens', async () => {
    const other = await login('fatoumata@swms.demo', 'Citizen@123');
    expect((await request(app).get(`/api/complaints/${code}`).set(auth(other))).status).toBe(404);
  });
  it('team cannot update an unassigned complaint', async () => {
    expect((await request(app).patch(`/api/complaints/${code}/status`).set(auth(team)).send({ status: 'In Progress' })).status).toBe(403);
  });
  it('admin assigns, team progresses it, history records every change', async () => {
    const teams = (await request(app).get('/api/teams').set(auth(admin))).body.items;
    const available = teams.find((t) => t.name === 'Kaloum Clean Crew');
    expect((await request(app).post(`/api/complaints/${code}/assign`).set(auth(admin)).send({ teamId: available.id })).body.complaint.status).toBe('Assigned');
    expect((await request(app).patch(`/api/complaints/${code}/status`).set(auth(team)).send({ status: 'In Progress' })).status).toBe(200);
    const done = await request(app).patch(`/api/complaints/${code}/status`).set(auth(team)).send({ status: 'Resolved', remarks: 'Cleared' });
    expect(done.body.complaint.history.map((h) => h.to)).toEqual(['Pending', 'Assigned', 'In Progress', 'Resolved']);
    const mine = (await request(app).get('/api/notifications').set(auth(citizen))).body.items;
    expect(mine.some((n) => n.text.includes('Resolved'))).toBe(true);
  });
});
