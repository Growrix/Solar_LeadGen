# Written Quote — Done Deal Handshake + Negotiation Limits Audit (2025-12-23)

## Scope
Implement and validate:
- Negotiation limits: **installer = 4 revisions**, **homeowner = 3 counters**, **total turns = 7**.
- “Done Deal” becomes a **2-step handshake**:
  - One party requests Done Deal → quote becomes **PENDING_ACCEPTANCE** → negotiation is locked.
  - The other party must **Accept Deal** (finalize) or **Reject Deal** (re-open negotiation).
- Always show the **latest offer/deal amount** clearly in both UIs.
- Homeowner lead cards show Written Quote **status + latest amount** without opening modal.

Constraints:
- **No DB reset**.
- Backend is source of truth; UI must not be able to bypass state/limit rules.

## Current State (Before)
- “Done Deal” immediately finalized negotiation (single step).
- Negotiation limits were symmetric and smaller.
- Lead card status updates were not consistently visible without opening the modal.

## Desired State (After)
### Negotiation State Machine
- `PENDING` → (counter/revise) → `HOMEOWNER_COUNTERED` / `INSTALLER_RESPONDED` …
- `*` → **Request Done Deal** → `PENDING_ACCEPTANCE`
- `PENDING_ACCEPTANCE` → **Accept Deal** → `AGREED`
- `PENDING_ACCEPTANCE` → **Reject Deal** → negotiation re-opens (derived from last action timestamps)

### Limits
- Homeowner counters: max **3** (`homeownerCounterCount`)
- Installer revisions: max **4** (`installerRevisionCount`)
- Total turns: max **7** (`negotiationTurnCount`)

## Implementation Summary
### Backend (API enforcement)
- Request Done Deal now sets `negotiationStatus = 'PENDING_ACCEPTANCE'` and records proposed deal fields.
- Counter/revise endpoints reject mutations while `PENDING_ACCEPTANCE`.
- New endpoints:
  - Accept pending deal (other party only) → finalizes to `AGREED`.
  - Reject pending deal (other party only) → clears agreed fields and re-opens negotiation.

Key files:
- `src/app/api/written-quotes/[id]/agree/route.ts`
- `src/app/api/written-quotes/[id]/accept/route.ts` (new)
- `src/app/api/written-quotes/[id]/deal-reject/route.ts` (new)
- `src/app/api/written-quotes/[id]/counter/route.ts`
- `src/app/api/written-quotes/[id]/revise/route.ts`

### Frontend (UI behavior)
- During `PENDING_ACCEPTANCE`:
  - Negotiation actions are disabled (counter/revise/Request Done Deal hidden/disabled).
  - If you requested the deal: show “waiting for acceptance” message.
  - If you are the other party: show **Accept Deal** + **Reject Deal**.
- “Latest offer” display prioritizes:
  - `agreedAmount` when pending acceptance
  - otherwise latest of counter/revise amounts.

Key files:
- `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- `src/components/WrittenQuoteBuilderModal.tsx`
- `src/components/InstallerLeadFeed.tsx`
- `src/lib/services/lead-service.ts`
- `src/app/homeowner/dashboard/page.tsx`

### Types
- Added/used negotiation status value: `PENDING_ACCEPTANCE`.

Key file:
- `src/types/written-quote.ts`

## DB / Prisma Impact
- No destructive operations.
- No DB reset.
- Handshake implemented by reusing existing Written Quote fields:
  - `agreedAmount`, `agreedAt`, `agreedBy` used to record deal proposal and acceptance.

## Edge Cases / Risk Notes
- Duplicate “Request Done Deal” is blocked while already `PENDING_ACCEPTANCE`.
- Only the **other party** can Accept/Reject the pending deal.
- Rejecting a pending deal restores an “open” negotiation status by comparing recent timestamps.

## Verification
Executed:
- `npx tsc --noEmit` → pass.
- `npm run build` → pass.

Notes:
- Build emitted pre-existing ESLint/Tailwind warnings and “Dynamic server usage” logs during static generation. The build still completed successfully.

## Manual QA Checklist
1. Installer revises up to 4 times; homeowner counters up to 3 times; total stops at 7.
2. Either party requests Done Deal → status becomes `PENDING_ACCEPTANCE` and negotiation locks.
3. Other party can Accept → status becomes `AGREED`.
4. Other party can Reject Deal → status re-opens; agreed fields cleared.
5. Homeowner dashboard lead card displays `WQ: $X • <status>` without opening modal.
