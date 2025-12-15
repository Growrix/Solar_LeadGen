# Execution Plan — Instant Quote & Lead Flow (Traceable, Audit-Gated)

This plan operationalizes the blueprint in `DOC/prompt.md` into step-by-step, auditable tasks. Each section begins with a Mandatory Audit Checklist you must complete and record (screenshots or notes in `/DOC/AUDIT_LOGS/step-<n>.md`) before writing code. No step should proceed without its audit marked Done.

---

## Legend
- Audit Record: Create `DOC/AUDIT_LOGS/step-<n>.md` describing findings, risks, deltas from plan, and go/no-go.
- Proof-of-Work: Link PR, files edited, and test evidence.
- Acceptance: Objective pass/fail conditions.

---

## Phase 1 — UI Shells & Navigation (step1-ui-skeleton)

### Mandatory Audit (step1-audit)
- Map existing routes: check `src/app/*` pages for homeowner, installer, admin.
- Inventory existing modals related to quote, auth, and lead feed.
- Identify layout containers and theming (Tailwind, ThemeProvider usage).
- Verify header/footer visibility rules per route.
- Output: `DOC/AUDIT_LOGS/step1.md` with route tree and gaps.

### Execution
- Scaffold missing routes (placeholders only):
  - `/homeowner/dashboard` subpages: overview, my-quote-requests, bidding-room, messages, profile
  - `/installer/dashboard` subpages: lead-feed, purchased-leads, billing, profile
  - `/admin/dashboard` subpages: metrics, guests, requests, purchases, pricing
- Create minimal nav and breadcrumbs per role.

Acceptance
- All pages render and are reachable via header/menu; no console errors.

---

## Phase 2 — UX: Instant Quote + Auth (step2-ux-wired)

### Mandatory Audit (step2-audit)
- Review `InstantQuoteForm` props, current steps, animations, and localStorage usage.
- Confirm existing sign-up/sign-in modals and flows; note gaps.
- Verify success/CTA behavior: Start Over, Request Quote.
- Output: `DOC/AUDIT_LOGS/step2.md` with state diagram and issues list.

### Execution
- Rebuild Instant Quote modal if needed: inputs → calculate → results (top-in animation).
- Add client-side validation and draft autosave.
- Implement unified Auth lightbox; wire pending-intent (create request after sign-in).

Acceptance
- Guest can calculate; draft persists; signup leads to dashboard with success modal.

---

## Phase 3 — Data Layer & API (step3-db-api-wired)

### Mandatory Audit (step3-audit)
- Inspect `prisma/schema.prisma` and existing models.
- Check running DB (docker or cloud) and migrations history.
- Inventory existing API routes under `src/app/api/*` for reuse.
- Output: `DOC/AUDIT_LOGS/step3.md` with current vs planned schema and route map.

### Execution
- Extend Prisma schema with: User, HomeownerProfile, InstallerProfile, GuestInstantQuote, QuoteRequest, LeadPurchase, WrittenQuote, Message, Notification, SystemEvent.
- Run migration; generate client.
- Implement endpoints:
  - POST `/api/instant-quote`
  - POST `/api/auth/signup`, `/api/auth/signin`
  - POST `/api/quote-requests`, GET `/api/quote-requests?mine=1`
  - POST `/api/leads/:id/purchase`, POST `/api/written-quotes`

Acceptance
- Migrations apply cleanly; endpoints validate and persist; unit tests green.

---

## Phase 4 — Security, RLS, and Payments (step4-security-rls)

### Mandatory Audit (step4-audit)
- Review how auth state is stored (cookies/localStorage) and any role checks in code.
- Verify what PII is currently displayed to installers and guests.
- Confirm Stripe keys and any existing payment code.
- Output: `DOC/AUDIT_LOGS/step4.md` with access control risks and proposed RLS.

### Execution
- Add role guards to route handlers; enforce owner-only access to own resources.
- Implement rate limiting and CAPTCHA for instant quotes.
- Integrate Stripe: credits top-up and/or direct unlock payment; webhook verification.
- Draft RLS examples if using Postgres with Row-Level Security; document policies.

Acceptance
- Unauthorized access returns 401/403; payment flow succeeds in test mode; basic abuse protections in place.

---

## Phase 5 — Performance & Analytics (step5-perf-analytics)

### Mandatory Audit (step5-audit)
- Identify heavy compute paths in pricing engine.
- Check current analytics (if any) and event logging.
- Output: `DOC/AUDIT_LOGS/step5.md` with proposed cache keys and event taxonomy.

### Execution
- Add caching for common estimates; introduce ISR for dashboards.
- Implement event logging: quote_generated, signup_from_quote, quote_requested, lead_purchased, quote_sent/accepted.

Acceptance
- P95 response times under target locally; events visible in admin metrics.

---

## Phase 6 — Testing & QA (step6-tests-ops)

### Mandatory Audit (step6-audit)
- Review existing tests and CI config (if any).
- Define happy-path and 2 failure scenarios per role.
- Output: `DOC/AUDIT_LOGS/step6.md` with test matrix.

### Execution
- Unit tests: pricing engine, validators, role guards.
- API tests: auth + validation + status transitions.
- E2E: Guest→Signup→Request→Installer Purchase flow.

Acceptance
- All tests pass locally and in CI; minimal flakiness.

---

## Phase 7 — Launch & Ops (step7-prod-ready)

### Mandatory Audit (step7-audit)
- Verify environment variables, secrets, webhook endpoints, and monitoring dashboards.
- Review feature flags and fallback behavior.
- Output: `DOC/AUDIT_LOGS/step7.md` with cutover checklist.

### Execution
- Enable feature flags; seed demo data; finalize docs and runbooks.
- Rollout with canary if possible; monitor conversions and errors.

Acceptance
- Rollout completes without critical regressions; KPIs start tracking.

---

## Artifacts & Folders to Maintain
- `DOC/AUDIT_LOGS/` — per-step audit notes and screenshots.
- `DOC/prompt.md` — blueprint reference.
- `DOC/InstantquoteFeature.md` — implementation playbook.
- `DOC/execution.md` — this file.

---

## Quick Commands (optional)
- Record audits and link them in PR descriptions.
- Tag PRs with `step{n}-{tag}` to maintain traceability across phases.
