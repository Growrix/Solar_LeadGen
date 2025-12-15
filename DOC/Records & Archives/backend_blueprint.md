# Backend Blueprint (Docker + Prisma + Postgres)

This document provides the concrete, actionable backend and DevOps playbook that the Constitution references. It’s designed to work with local Docker Postgres and managed Postgres (Supabase, Vercel Postgres, etc.).

## Quick Summary
- Local dev DB via Docker Compose (Postgres 15) with healthcheck and persisted volume.
- Prisma as the single ORM layer; one schema across all environments.
- Migrations: `migrate dev` for local; `migrate deploy` for CI/staging/prod only.
- Zero-downtime migration patterns for critical tables.
- Connection pooling (PgBouncer/provider pool) and SSL in production.
- CI/CD pipeline with lint, typecheck, build, and gated migrations.
- Backups, monitoring, and incident response basics.

## Project Layout (reference)
```
prisma/
  schema.prisma
  seed-admin.ts
src/
  lib/
    prisma.ts     # Prisma client singleton
  app/            # Next.js App Router
DOC/
  backend_blueprint.md
  tasks.md
.github/workflows/
  ci.yml
```

## Prisma Client Singleton
Use `src/lib/prisma.ts` and import from there everywhere (avoid multiple clients).

## Environment Variables (examples)
- Local Docker: `postgresql://postgres:postgres@localhost:5432/solarmatch?schema=public`
- Managed: `postgresql://user:pass@host:5432/db?schema=public&sslmode=require`

Store secrets in your host’s secret manager. Never commit `.env`.

## Docker Compose (Local Dev)
- Postgres 15
- Persisted volume
- Healthcheck using `pg_isready`

Start: `docker compose up -d`

## Migrations Workflow
- Local: `npx prisma migrate dev --name <name>`
- CI/Prod: `npx prisma migrate deploy`
- Never run `migrate dev` in production.

## Zero-Downtime Patterns
1. Additive changes (nullable columns/indexes)
2. Backfill data with idempotent job
3. Switch reads/writes
4. Add NOT NULL in separate migration
5. Drop legacy column later

For large indexes: `CREATE INDEX CONCURRENTLY`.

## Connection Management
- Always pool connections in production (PgBouncer/provider pool)
- Consider Prisma Data Proxy for serverless
- Enforce `sslmode=require` for managed providers

## Supabase Notes
- Prisma with server-side role bypasses RLS → enforce authorization in app code
- Hybrid allowed: RLS on specific tables, Prisma for internal work—document explicitly
- Default schema is `public`; ensure compatibility with any extensions

## Security
- Sanitize and validate inputs (Zod)
- Principle of least privilege (DB users)
- Restrict IPs where possible
- Encrypt sensitive fields at app layer when appropriate

## Testing
- Unit tests for services/utilities
- Integration tests with ephemeral Postgres (Testcontainers) or compose
- E2E on staging with smoke checks on critical flows

## CI/CD (minimal viable pipeline)
Stages (block on failure):
- Test: ESLint + TypeScript check (+ unit tests if present)
- Build: Next.js build
- Migrate: `prisma migrate deploy` (only when DATABASE_URL is configured)
- Deploy: staging → production (rolling/blue-green)
- Verify: health checks and Storybook visual checks for UI changes

Branching: `main` (prod, protected), `develop` (staging), `feature/*`, `hotfix/*`.

PR standards: title, linked issue, description, checklist, Storybook proof for UI, migration proof for DB changes.

## Backups & Monitoring
- Backups: daily + PITR on managed providers (or `pg_dump` + WAL archiving)
- Monitoring: DB connections, slow queries, error rate, latency (PgHero/Datadog/Prometheus)
- Logging & Errors: Centralized logs + Sentry; alerts for failure/downtime/high error rate

## Deployment Strategy
- Run migrations before rolling out new code
- Use rolling/blue-green deploys to allow coexistence
- Run backfills as separate, idempotent jobs

## Practical Commands
- Generate client: `npx prisma generate`
- Deploy migrations: `npx prisma migrate deploy`
- Reset local DB: `npx prisma migrate reset` (dev only)

## Pitfalls
- `migrate dev` in production
- No pooling in serverless
- Table rewrites in one migration
- Shipping Supabase `service_role` to clients
- Inconsistent RLS vs server-side authorization

## Checklist (copy/paste)
- [ ] docker-compose Postgres with healthcheck
- [ ] Prisma schema canonical across envs
- [ ] `.env.example` includes DATABASE_URL templates
- [ ] Prisma Client singleton in `src/lib/prisma.ts`
- [ ] CI runs `prisma generate` + lint + typecheck + build
- [ ] Migrations via `prisma migrate deploy` in CI before deploy
- [ ] Connection pooling strategy decided
- [ ] Backups configured (daily + PITR where available)
- [ ] Logging + Sentry configured
- [ ] Test DB strategy in CI (testcontainers/compose)
- [ ] Zero-downtime migration plan for critical tables
- [ ] Secrets in secret manager (no commits)
- [ ] Supabase RLS vs server-side authorization documented
