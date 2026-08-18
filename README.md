# CivicTrack 🏙️

> **Digital Civic Issue Reporting Platform** — Transparent, accountable, citizen-to-government issue resolution.
>
> HackNova'26 · Problem Statement S-16 · SDG 11 — Sustainable Cities and Communities

---

## Monorepo Structure

```
CivicTrack/
├── apps/
│   ├── api/          # NestJS REST API + WebSocket backend
│   ├── web/          # Citizen PWA (React + Vite)
│   ├── officer/      # Officer Console (React + Vite)
│   └── admin/        # Admin Dashboard (React + Vite)
├── packages/
│   └── shared/       # Shared TypeScript types (Issue, User, Ward, etc.)
├── infra/
│   └── docker-compose.yml   # Postgres+PostGIS, Redis
├── docs/
│   └── spec/         # Project specifications
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
└── pnpm-workspace.yaml
```

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20.x | https://nodejs.org |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/SpaceNature123/civictrack.git
cd civictrack
```

### 2. Install all dependencies

```bash
pnpm install
```

### 3. Set up environment files

Copy the example env files and fill in your values:

```bash
# Infra
cp infra/.env.example infra/.env

# API
cp apps/api/.env.example apps/api/.env

# Citizen web app
cp apps/web/.env.example apps/web/.env

# Officer console
cp apps/officer/.env.example apps/officer/.env

# Admin dashboard
cp apps/admin/.env.example apps/admin/.env
```

### 4. Start local infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

Wait for both containers to be healthy:

```bash
docker compose -f infra/docker-compose.yml ps
# postgres   ... healthy
# redis      ... healthy
```

### 5. Run applications

**API (NestJS)** — http://localhost:3000
```bash
pnpm dev:api
```

**Citizen Web App (PWA)** — http://localhost:5173
```bash
pnpm dev:web
```

**Officer Console** — http://localhost:5174
```bash
pnpm dev:officer
```

**Admin Dashboard** — http://localhost:5175
```bash
pnpm dev:admin
```

### 6. Verify the API

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

---

## Development Commands

```bash
# Lint the entire repo
pnpm lint

# Auto-fix lint errors
pnpm lint:fix

# Format all files
pnpm format

# Check formatting
pnpm format:check

# TypeScript type-check all packages
pnpm typecheck

# Build all packages for production
pnpm build
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API Backend | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| Cache / Queue | Redis 7 + BullMQ |
| Citizen App | React + Vite 5 (PWA, offline-first) |
| Officer Console | React + Vite 5 |
| Admin Dashboard | React + Vite 5 |
| Shared Types | TypeScript package (`@civictrack/shared`) |
| Auth | JWT + Firebase (Google/Phone OTP) |
| Image Storage | Cloudinary |
| Real-time | Socket.IO (WebSocket) |

---

## Database Connection

The local Postgres instance (via Docker) is available at:

```
postgresql://civictrack:civictrack@localhost:5432/civictrack
```

PostGIS extension is enabled automatically on first start.

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and ensure `pnpm lint` passes with zero warnings
3. Commit using conventional commits: `git commit -m "feat: add issue submission endpoint"`
4. Open a pull request

---

## License

MIT © CivicTrack Contributors
