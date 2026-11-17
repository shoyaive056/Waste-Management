# Smart Waste Management System
SE331 Capstone – Daffodil International University, Dept. of Software Engineering.

```
client/   React + Vite + Tailwind
server/   Express + Prisma + PostgreSQL
```

## Quick start (one command set from the project root)
```bash
# 1. Start the locally installed PostgreSQL 16 Windows service (Docker is not used)
#    PowerShell (if needed): Start-Service postgresql-x64-16

# 2. Environment files (set a strong JWT_SECRET and your local PostgreSQL credentials)
if (!(Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
if (!(Test-Path client/.env)) { Copy-Item client/.env.example client/.env }

# 3. Install everything, apply versioned migrations, add/update demo data
npm run install:all
npm run db:migrate
npm run db:seed

# 4. Start API (5000) and web app (5173) together
npm run dev
```
Other root scripts: `npm run dev:server`, `npm run dev:client`, `npm run build`, `npm test` (backend, needs migrated + seeded DB). For a production-style migration apply use `npm run db:deploy --prefix server`.

## Demo logins (seeded demonstration data)
| Role | Email | Password |
|---|---|---|
| Administrator | admin@swms.demo | Admin@123 |
| Citizen | citizen@swms.demo | Citizen@123 |
| Collection team | team@swms.demo | Team@1234 |

## API summary
`/api/auth/*`, `/api/complaints` (+ `/:id/status`, `/priority`, `/assign`, `/notes`), `/api/teams` (+ `/:id/tasks`), `/api/categories`, `/api/users/citizens`, `/api/dashboard/{citizen|admin|team}`, `/api/statistics/{overview|categories|monthly|performance}`, `/api/notifications`, `/api/map/complaints`.
Complaints are addressed by their public code (e.g. `WM-2026-0007`).

## Engineering decisions
- JWT in the `Authorization: Bearer` header; logout discards the token client-side. Roles are enforced in Express middleware and in every Prisma query (`scopeWhere`).
- `bcryptjs` (pure JS bcrypt) so installs work on Windows without native builds.
- Priority engine is rule-based (`server/src/services/priority.js`); admins can override. No AI is claimed.
- Photos are validated by MIME type, 5 MB limit and file signature, stored under `server/uploads` with random names.
- Team members are users with a `teamId`; creating a team also creates the leader's login with `TEMP_TEAM_PASSWORD`.
- Citizens never see admin/team notes. Team access is limited to complaints assigned to their team.
