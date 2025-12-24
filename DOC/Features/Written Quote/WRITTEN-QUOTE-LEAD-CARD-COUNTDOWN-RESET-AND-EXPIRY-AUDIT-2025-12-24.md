# Written Quote — Lead Card Countdown Reset + Auto-Expiry Audit (2025-12-24)

## Scope
Fix lead-card countdown behavior for Written Quote leads:
- After installer submits a Written Quote, the **lead-card countdown** resets to the **admin-defined initial timeframe**.
- When the **lead-card countdown reaches 0**, negotiation closes automatically and lead status becomes **NEGOTIATION_EXPIRED**, with notifications sent.

**Explicit non-goal:** Do not change the negotiation panel countdown behavior (it remains driven by `WrittenQuote.negotiationDeadlineAt`).

## Problem Statement
Observed mismatch:
- Negotiation panel countdown uses `WrittenQuote.negotiationDeadlineAt`.
- Lead card countdown uses `Lead.expiresAt`.
- Written quote submission previously did not reliably link the lead-card timer lifecycle to the admin-defined initial timeframe, and required an endpoint-like expiry behavior.

## Findings
- Lead approval already supports a configurable countdown via `LEAD_COUNTDOWN_DEFAULT_DAYS` and stores `Lead.expiresAt`.
- There was no durable per-lead “initial” countdown duration to restore after later modifications.
- Negotiation auto-expiry already existed for the negotiation panel (`expireNegotiationIfNeeded`) but was independent of `Lead.expiresAt`.

## Changes Implemented
### 1) Persist initial admin timeframe on approval
- Add `Lead.initialCountdownDays` to persist the initial admin-defined duration used at approval.
- Approval route writes `initialCountdownDays` whenever countdown is enabled.

### 2) Reset lead-card countdown on written quote submission
- On `POST /api/written-quotes`, after quote creation:
  - Reset `Lead.expiresAt = now + Lead.initialCountdownDays`.
  - Fallback to settings key `LEAD_COUNTDOWN_DEFAULT_DAYS` if the per-lead value is missing.

### 3) Lead-card countdown endpoint behavior (auto-expiry)
- Add a server-side enforcement path triggered during lead fetches:
  - If a Written Quote lead has `expiresAt <= now`, set lead status to `NEGOTIATION_EXPIRED` and expire any open written-quote negotiations.
  - Notify homeowner once and each affected installer.

## Sync Across Roles
- Expiry enforcement is invoked on server fetch paths used by Installer/Homeowner/Admin lead-card and lead-details reads.
- This keeps `Lead.status` consistent across all roles without needing a background scheduler.

## Files Touched
- `prisma/schema.prisma` (add `Lead.initialCountdownDays`)
- `prisma/migrations/20251224130000_add_lead_initial_countdown_days/migration.sql`
- `src/app/api/leads/[id]/approve/route.ts` (persist initialCountdownDays)
- `src/app/api/written-quotes/route.ts` (reset `Lead.expiresAt` post-submission)
- `src/lib/services/lead-service.ts` (invoke lead-card countdown expiry enforcement on fetch)
- `src/lib/written-quotes/negotiation-window.ts` (implement `expireLeadNegotiationsByCountdownIfNeeded`)

## Notes / Guardrails
- Negotiation panel countdown remains unchanged.
- Because Prisma client types can lag migrations in this repo, affected Prisma calls use a narrow `any` escape hatch to avoid blocking TypeScript builds.

## Verification
- Run: `npx tsc --noEmit`
- Run: `npm run build`
