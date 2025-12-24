# Written Quote — In-Modal Payment CTA Audit (2025-12-24)

## Scope
Add a payment option inside the installer **Written Quote Builder** modal after negotiation is finalized (AGREED), and ensure payment actions are disabled automatically across both:
- Installer lead card (feed)
- Installer modal (builder)

Goal: prevent duplicate purchases.

## Current State (Before)
- Backend already supported purchases:
  - `POST /api/written-quotes/[id]/purchase` validates:
    - installer ownership
    - `negotiationStatus === 'AGREED'`
    - `purchasedAt` not set (blocks duplicates)
  - Updates both `WrittenQuote.purchasedAt` and `Lead.purchasedAt`, and returns `lead.purchasedAt`.
- Installer lead card already had a purchase banner for agreed written quotes.
- Installer `WrittenQuoteBuilderModal` showed "Negotiation finalized." but provided no in-modal payment CTA.

## Gap / Problem
- UX gap: installer must exit modal to pay from lead card.
- Risk of duplicate payments if UI surfaces multiple CTAs without shared state refresh.

## Implementation (What Changed)
- Added a "Proceed to Payment" button inside `WrittenQuoteBuilderModal` when:
  - `negotiationStatus === 'AGREED'` and
  - `purchasedAt` is not set
- On successful purchase:
  - Modal updates its local `negotiationQuote.purchasedAt` (disables modal CTA immediately)
  - Modal notifies parent lead-feed state so the lead-card CTA is removed/disabled without requiring a full page reload

## Files Touched
- `src/components/WrittenQuoteBuilderModal.tsx`
- `src/components/InstallerLeadFeed.tsx`

## Verification
- `npx tsc --noEmit`
- `npm run build`

## Notes / Constraints
- UI does not assume purchase success; backend remains the source of truth.
- Purchase endpoint already enforces idempotency via `purchasedAt` check (duplicate purchase attempts return 403).
