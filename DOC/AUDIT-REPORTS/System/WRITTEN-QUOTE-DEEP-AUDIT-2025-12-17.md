# Written Quote — Deep Audit (E2E + Data + Flow)

Date: 2025-12-17
Owner: Copilot (GPT-5.2 Preview)
Scope: Written Quote end-to-end flows (installer + homeowner), test coverage, auth routing, Prisma/DB alignment.

## Authority + Constraints
- Auth truth: NextAuth `pages.signIn` is `/` (modal-based sign-in), not a dedicated `/login` route.
- Implementation rule: preserve existing behavior; fix root causes; keep changes minimal and verifiable.

## Current Reality (Observed)
### Authentication routing
- The app does **not** have a `/login` page.
- Login is initiated from the homepage (`/`) via modals:
  - Installer sign-in: `TopBar` → “Partner Sign In” → `InstallerSignInModal`.
  - Homeowner sign-in: header/guest login → `HomeownerSignInModal`.

Impact:
- Playwright E2E specs that `page.goto('/login')` time out waiting for the email field.

### Prisma ↔ DB alignment
- Prisma schema previously included `written_quotes.acceptedAt` / `rejectedAt`, but the database does not have these columns.
- This mismatch blocks seed scripts and makes local drift resolution unclear.

Impact:
- Seeds/tests can “work” only via workaround (commenting out fields), which is not production-grade.

## Written Quote Flow Inventory
### UI entry points
- Negotiation UI is centralized in `WrittenQuoteNegotiationPanel` (role-aware, shared by installer/homeowner).
- Entry integration observed in:
  - Installer context: `QuoteBuilderModal` (installer builds quote)
  - Homeowner context: `HomeownerBiddingReviewModal` (homeowner reviews/negotiates)

### API surface (expected state machine)
- Start/get/offer/counter/done endpoints exist under `src/app/api/written-quotes/*`.

## Key Risks / Gaps
1. **E2E auth mismatch** (high)
   - Tests encode a route (`/login`) that is not part of the system.
   - Fix must align tests to the actual sign-in UX and role gating (`role: 'INSTALLER' | 'HOMEOWNER'`).

2. **Schema drift** (high)
   - Inconsistent DB/schema around accepted/rejected timestamps.
   - Leaves production behavior ambiguous: auditability and state transitions are harder to trust without persistent acceptance/rejection timestamps.

3. **Dialog-based UX in negotiation panel** (medium)
   - Uses `alert()`/`confirm()` for validation and rejection confirmation.
   - E2E must explicitly handle dialogs or avoid paths that trigger them unexpectedly.

4. **Test duplication** (medium)
   - Multiple specs duplicate login logic (and currently duplicate the wrong navigation).
   - Consolidate into a single Playwright helper to reduce drift.

## Recommended Fixes (Minimal + Verifiable)
### A) Fix Playwright authentication to match reality
- Replace `/login` navigation with:
  - `page.goto('/')`
  - Installer: click “Partner Sign In”
  - Homeowner: click “Login”
  - Fill modal fields (`input[name="email"]`, `input[name="password"]`) and submit (“Sign In”).
- Introduce `tests/e2e/helpers/auth.ts` helpers to avoid duplication.

### B) Formalize schema direction for accepted/rejected timestamps
Pick one (must be explicit):
- Option 1 (recommended): add DB columns + a migration, keep Prisma schema as-is.
- Option 2: remove fields from Prisma permanently and reflect acceptance/rejection only via events.

## Acceptance Criteria (to claim production-ready)
- Written Quote E2E suites pass end-to-end with real auth flow.
- No schema drift between Prisma and DB for Written Quote fields.
- Negotiation state transitions are recorded and auditable (events + any final timestamps).

## Immediate Next Actions
1. Update E2E tests to use modal-based sign-in on `/`.
2. Re-run the Written Quote E2E suite.
3. Decide the authoritative schema path for `acceptedAt` / `rejectedAt` and implement it cleanly.
