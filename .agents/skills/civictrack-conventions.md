## 1. Tech stack — locked, do not substitute

- **Backend**: Node.js + NestJS
- **Database**: PostgreSQL + PostGIS extension
- **ORM**: Prisma (or TypeORM only if there's a concrete NestJS-integration reason — state it explicitly if you deviate)
- **Background jobs**: Redis + BullMQ
- **Auth**: Firebase Auth (phone OTP for citizens, email/Google for officer/admin)
- **Photo storage**: Cloudinary
- **Maps**: Leaflet + OpenStreetMap tiles (no API key). Geocoding via Nominatim if needed. **Never** substitute Mapbox, Google Maps, or any billing-gated mapping service — this project has no credit card on file.
- **Hosting**: Railway (API, web, officer, admin as separate services; managed Postgres + Redis add-ons)
- **CI/CD**: GitHub Actions
- **Error tracking**: Sentry (`@sentry/node` backend, `@sentry/react` frontend) — not needed until Block 9, don't wire it in early
- **Frontend**: React + Vite, PWA (service workers) for the citizen web app
- **Monorepo tooling**: pnpm workspaces

If a task seems to require a different tool than what's listed here, stop and flag it in the plan rather than substituting silently. No AWS, no S3, no MongoDB, no paid/billing-gated services anywhere in this stack.

---

## 2. Code style

- TypeScript strict mode everywhere, no `any` without a comment justifying it
- ESLint + Prettier enforced at the repo root, shared config across all packages/apps
- Conventional Commits format for every commit (`feat:`, `fix:`, `chore:`, `test:`, `docs:`) — this is a portfolio/production deliverable, commit history should read cleanly
- **Code should be commented** where logic isn't self-evident (this is the opposite convention from Harish's competitive-programming preference — CivicTrack is a production/portfolio project, not a CP submission, so favor clarity for a future reader/reviewer over terseness)
- Shared types live in `/packages/shared` — never redefine an entity shape independently in a frontend app

---

## 3. Testing bar — non-negotiable per block

Every block is only "done" when:
1. All new logic has Jest unit tests
2. Every new API route has at least one integration test (happy path + at least one failure/edge case)
3. Anything touching a user-facing flow (submit, triage, resolve, dispute) gets a browser-agent recording/screenshot Artifact as proof, not just a written claim that it works
4. `pnpm lint` and `pnpm test` both pass clean across the whole monorepo before a block is marked complete
5. No block is committed with failing or skipped tests "to fix later" — fix it in the same task

---

## 4. Async & robustness principles (from the original spec, section 5)

- Citizen-facing writes (issue submission) must stay synchronous and fast — anything expensive (dedup, routing, notifications, image analysis) runs as a background BullMQ job, never inline with the submit request
- Every citizen submission carries a client-generated UUID; retried or offline-synced submissions must be idempotent — never create duplicate rows from network retries
- If a background service (dedup/ML, notifications) is down, the primary write must still succeed — degrade gracefully, reconcile retroactively
- Stateless API layer — no in-memory session state that would break horizontal scaling later

---

## 5. Security & privacy (from spec section 10) — enforce server-side, not just in the UI

- Role-based access control (citizen/officer/admin) checked at the API layer on every protected route — never rely on the frontend hiding a button
- Citizen phone/email must never appear in any public-facing API response (public map, leaderboard, etc.) — only issue location + status are public
- Secrets (Firebase Admin SDK key, Cloudinary API secret, DB credentials) never committed to the repo — `.env.example` lists variable names only, real values live in Railway's dashboard
- Rate limiting on public submission endpoints

---

## 6. Working process for agent tasks in this repo

- Planning mode should be on for every task — produce a task-list Artifact before writing code
- One block from the build playbook = one agent task. Don't combine blocks, don't jump ahead of the current block's stated scope
- Reference `/docs/spec/S16_Civic_Issue_Reporting.md` by path for context — don't ask to have it repasted
- Every block ends in a committed, tested, working state before the next block starts
- If a task stalls or drifts off-scope, stop the task rather than trying to argue it back on track in the same context