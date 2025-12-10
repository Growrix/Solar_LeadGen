# Instant Quote and Lead Flow — Implementation Playbook

This playbook breaks the build into executable tasks with clear inputs/outputs, contracts, and acceptance criteria. Use it as the working checklist during development.

---

## Phase A — Core Instant Quote + Auth + Quote Request

### A1. Prisma Models (first migration)
- User, HomeownerProfile, InstallerProfile, GuestInstantQuote, QuoteRequest, LeadPurchase, WrittenQuote, Message, Notification, SystemEvent
- Indices: role, sessionId, homeownerId, installerId, status

Acceptance: `npx prisma migrate dev` succeeds; `npx prisma generate` types compile.

### A2. Session + Persistence
- Create a guest session cookie (uuid) on first visit.
- POST /api/instant-quote
  - Input: form payload
  - Logic: compute results (pure fn), save GuestInstantQuote with sessionId, return {results, id}
- Store draft in localStorage to recover on reload.

Acceptance: New rows appear in `GuestInstantQuote` for anonymous users; results returned in <500ms locally.

### A3. Auth (local first)
- POST /api/auth/signup, POST /api/auth/signin
- On signup, if session has GuestInstantQuote, link to created user for prefill later.

Acceptance: Can sign up/in; httpOnly cookie set; redirects work.

### A4. Create Quote Request
- POST /api/quote-requests
  - Auth: homeowner
  - Body: { instantQuoteId, type, payload? }
  - Persist QuoteRequest with snapshot of inputs/results.

Acceptance: Request appears in DB; Homeowner Dashboard success modal shows with link to detail.

---

## Phase B — Homeowner Dashboard

### B1. Pages and Lists
- Overview, My Quote Requests (tabs: Call/Visit, Written), Request Detail, Messages
- GET /api/quote-requests?mine=1 (pagination)

Acceptance: Lists show only the signed-in user’s requests; detail shows snapshot and timeline.

### B2. New Quote Flow
- NewQuoteRequestModal uses last inputs to prefill.
- Ability to convert previous instant result into a new request.

Acceptance: Prefill works; request creation < 1s.

### B3. Messaging
- Message thread per request; simple POST /api/messages

Acceptance: Messages persist and render in real time (poll or WS later).

---

## Phase C — Installer Experience

### C1. Lead Feed
- Lead cards with filters; show minimal homeowner info until unlocked
- Unlock modal: pay via credits/Stripe
- POST /api/leads/:id/purchase

Acceptance: Credits deducted or Stripe payment recorded; contact details become visible for purchased leads.

### C2. Purchased Leads Page
- Show full detail: instant inputs, results, homeowner contact

Acceptance: Only purchased leads render sensitive data for the installer.

### C3. Written Quotes
- POST /api/written-quotes
- Homeowner sees quotes in Bidding Room; can accept 1

Acceptance: Status transitions propagate; losers are auto-closed.

---

## Phase D — Admin + Metrics

### D1. Metrics Endpoint
- GET /api/admin/metrics
- Return counts: instant quotes, signups, requests by type, purchases, revenue

Acceptance: Numbers reconcile with DB records in seed/dev.

### D2. Drilldowns
- Guests table, Requests table, Purchases table, Pricing config editor (versioned)

Acceptance: Admin can filter and export CSV.

---

## Shared Foundations

### Validation
- Zod schemas for each endpoint
- Error responses: { error: { code, message, details? } }

### Pricing Engine
- `src/lib/quote/engine.ts`: pure functions
- `src/lib/quote/config.v1.ts`: versioned config; include version in snapshots

### Security
- Role guards in route handlers
- Rate limiters on create/purchase endpoints

### Observability
- SystemEvent records key actions
- Basic server logs with request IDs

---

## API Contracts (concise)

- POST /api/instant-quote → 200 { id, results }
- POST /api/auth/signup → 200 { user }
- POST /api/auth/signin → 200 { user }
- POST /api/quote-requests → 201 { id, status }
- GET /api/quote-requests?mine=1 → 200 { items: [], nextCursor }
- POST /api/leads/:id/purchase → 200 { status: 'paid' }
- POST /api/written-quotes → 201 { id }
- GET /api/admin/metrics → 200 { totals: {...} }

---

## Checklists

- Data
  - [ ] Prisma schema written
  - [ ] First migration applied
  - [ ] Seed script for demo data

- Backend
  - [ ] Route handlers scaffolded
  - [ ] Zod validators in place
  - [ ] Role guard utility
  - [ ] Pricing engine v1

- Frontend
  - [ ] Rebuilt Instant Quote modal (top-in animation)
  - [ ] Auth lightbox (signup/signin)
  - [ ] Homeowner: lists, detail, new quote modal
  - [ ] Installer: lead feed, purchase modal, purchased leads
  - [ ] Admin: metrics and drilldowns

- QA
  - [ ] Unit tests (calc + utils)
  - [ ] API tests (auth + validation)
  - [ ] E2E happy path (Cypress)

---

## Notes
- Start with simplest local auth; plan to integrate OAuth and email verification later.
- Use feature flags to hide incomplete pages in production.
- Keep UI responsive, accessible, and keyboard-friendly.
