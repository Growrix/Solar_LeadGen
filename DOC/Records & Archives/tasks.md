# Platform Tasks (Aligned with Constitution v1.0.1+)

Concise, actionable platform-wide tasks derived from the Backend & DevOps Blueprint. Use feature-level `specs/*/tasks.md` for feature-specific work.

## One-time Setup
- [ ] Ensure Docker Desktop is installed and running
- [ ] Start local DB: `docker compose up -d`
- [ ] Copy `.env.example` → `.env` and set `DATABASE_URL`
- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Apply local migrations: `npx prisma migrate dev --name init` (first time only)
- [ ] Seed admin: `npm run seed:admin`

## Daily Dev Flow
- [ ] Run app: `npm run dev`
- [ ] Add schema changes: `npx prisma migrate dev --name <change>`
- [ ] Update Storybook for any UI changes and run Chromatic when applicable

## CI/CD & Governance
- [ ] CI runs on PR/merge to `develop`/`main` (lint, typecheck, build, migrate deploy)
- [ ] Protect `main` (require PR approvals, passing checks)
- [ ] Use `feature/*` branches; merge via squash
- [ ] For DB changes, include migration proof in PR description

## Migrations & Releases
- [ ] Production DB migrations executed via `prisma migrate deploy` only
- [ ] Zero-downtime migration plan for critical changes (add → backfill → switch → enforce → drop)
- [ ] Backfills implemented as idempotent scripts/jobs

## Security & Secrets
- [ ] No secrets in git; use hosting secrets manager
- [ ] Enforce `sslmode=require` for managed DBs
- [ ] Review RLS vs server-side authorization and document where hybrid is used

## Monitoring & Backups
- [ ] Enable daily backups + PITR (managed DB) or schedule `pg_dump`
- [ ] Configure error tracking (Sentry) and centralized logs
- [ ] Add alerts for downtime/high error rate/failed deploys

## Testing
- [ ] Unit tests for services/utilities
- [ ] Integration tests against ephemeral Postgres or compose DB
- [ ] Smoke/E2E tests on staging for critical flows

## Documentation
- [ ] Keep `DOC/backend_blueprint.md` current
- [ ] Update `DOC/CHANGELOG.md` on releases (semantic versioning)
- [ ] Each feature: update `specs/<feature>/tasks.md` and link to Constitution when relevant
