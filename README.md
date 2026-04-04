# Expense Tracker

Full-stack expense tracker built with **React + Vite** (frontend) and **Express + SQLite** (backend), featuring JWT token-based authentication. Managed as a **Lerna monorepo** with npm workspaces. Both UI and API are served from a single port.

## Structure

```
packages/
├── client/      - React Vite frontend (TypeScript + Tailwind CSS)
└── server/      - Express backend (REST API + SQLite + JWT auth)
```

## Setup

Install all dependencies from the root:

```bash
npm install
```

This uses npm workspaces to install dependencies for all packages.

## Development

Run both frontend and backend in development mode:

```bash
# Both at once
npm run dev

# Or individually:
npm run dev:server    # Backend on port 8080
npm run dev:client    # Frontend dev server on port 5173 (proxies /api to 8080)
```

## Production

Build the frontend and start the server:

```bash
npm run build:client
npm start
```

## Access

- **UI:** http://localhost:8080/
- **API:** http://localhost:8080/api

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Get current user profile (auth required)
- `PUT /api/auth/users/:id` — Update a user (auth required)
- `GET /api/auth/users` — List all users (admin only)

### Expenses (all require auth)
- `GET /api/expenses` — List expenses (optional `?month=&year=` filters)
- `GET /api/expenses/summary` — Monthly summary for dashboard (optional `?year=`)
- `POST /api/expenses` — Add a new expense
- `PUT /api/expenses/:id` — Update an expense
- `DELETE /api/expenses/:id` — Delete an expense

### Health
- `GET /api/status` — Server health check

## Database

SQLite database with two tables:
- **users** — id, name, email, password, role, active
- **expenses** — id, name, date, amount, added_by, updated_by, added_date, updated_date

## Port

Default: **8080**. Override with the `PORT` environment variable.
