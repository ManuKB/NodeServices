# NodeServices

Lerna monorepo with **frontend** (HTML UI) and **backend** (Express REST API + static file server).

## Structure

```
packages/
├── backend/       - Express server (REST API + serves frontend)
└── frontend/      - Simple HTML UI
```

## Setup

Install dependencies from root:

```powershell
npm install
```

## Run

Start the backend server (serves UI + API):

```powershell
npm run start --workspace=backend
```

Or with auto-reload (dev):

```powershell
npm run dev --workspace=backend
```

## Access

- **UI:** http://localhost:3000/
- **API:** http://localhost:3000/api/hello
- **Status:** http://localhost:3000/api/status

## API Endpoints

- `GET /api/hello` — returns JSON with greeting
- `GET /api/status` — returns server status
- `GET /` — serves frontend HTML UI

## Port

Set with `PORT` environment variable (default: 3000).
