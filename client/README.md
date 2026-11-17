# Smart Waste Management System – Frontend (Phase 1)

React + Vite + Tailwind. Runs on a localStorage mock API (`src/services/mockApi.js`) so every screen works before the backend exists.
The backend phase replaces `src/services/api.js` with axios calls (`src/services/http.js` is ready) using the same method names.

## Run
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```
Reset demo data: run `localStorage.clear()` in the browser console.

## Demo accounts (seeded demo data around Conakry)
| Role | Email | Password |
|---|---|---|
| Administrator | admin@swms.demo | Admin@123 |
| Citizen | citizen@swms.demo | Citizen@123 |
| Collection team | team@swms.demo | Team@1234 |

## Notes
- Priority engine: `src/utils/priority.js` (rule-based, no AI claimed; admins can override).
- Route guards are UX only; the backend must enforce roles on every API.
- Mock passwords are plain text for the mock only; the backend uses bcrypt.
