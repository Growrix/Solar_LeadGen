---
description: "Logic audit for T062 [US6] homeowner dashboard DS-only migration"
---

# T062 Logic Audit — Homeowner Dashboard Surfaces (UI-only)

## Scope

Primary dashboard surface:
- `src/app/homeowner/dashboard/page.tsx`

Dashboard-adjacent homeowner components touched during this migration:
- `src/components/homeowner/HomeownerDashboardHeader.tsx`
- `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
- `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- `src/components/homeowner/QuoteTypeDistributionModal.tsx`
- `src/components/homeowner/LeadLimitReachedModal.tsx`
- `src/components/homeowner/LeadPreviewModal.tsx`
- `src/components/homeowner/LeadEditModal.tsx`
- `src/components/homeowner/SimplifiedQuoteForm.tsx`

## Hard constraints

- UI-only migration: preserve business logic, state transitions, handlers, API calls, and validation.
- DS-only: components import from `@/ds` for primitives, modals, and icons (no direct `lucide-react`).

## Behavior inventory (must remain identical)

### `src/app/homeowner/dashboard/page.tsx`
- Renders homeowner dashboard summary and lead list with multiple modal entry points.
- Maintains existing callbacks/handlers passed down to modals and CTA components:
  - `onRequestMoreQuotes`, `onVerifyContact`, `onEditLead`, `onPreviewLead`, `onCancelLead`, `onLimitReached`
- Status-derived behavior for lead actions remains:
  - Edit only when `PENDING_APPROVAL`
  - Preview for approved/purchased/quoted/accepted states (as implemented)
- Loading / error / empty summary paths remain.

### `src/components/homeowner/HomeownerDashboardHeader.tsx`
- State: `isSearchOpen` toggles expanded/collapsed search UI.
- No data fetching or mutation.
- Interactions:
  - Search toggle button toggles `isSearchOpen`
  - Help button remains a non-navigating button (as implemented)
  - Notifications dropdown is still rendered

### `src/components/homeowner/QuoteTypeDistributionModal.tsx`
- State: `callVisitCount`, `writtenQuoteCount`, `biddingCount`.
- Effects:
  - When `isOpen` becomes true, resets all counts to `0`.
- Derived values:
  - `totalSelected`, `isValid`, `exceedsQuota`.
- Validation rules preserved:
  - Total must be `> 0` and `<= remainingQuota`.
  - Bidding requests are capped by `remainingBiddingQuota = max(0, biddingLeadsLimit - biddingLeadsSubmitted)`.
  - If user attempts bidding when quota is 0, shows an alert (existing behavior).
- Submission:
  - `handleSubmit` builds `distributions` array with only positive counts.
  - Calls `onSubmit(distributions)` then `onClose()`.

### `src/components/homeowner/LeadLimitReachedModal.tsx`
- Pure display modal with two actions:
  - Close (`onClose`).
  - Contact support: sets `window.location.href` to a `mailto:` URL.
- Inputs used for display only: `usedQuotes`, `totalQuoteLimit`.

### `src/components/homeowner/LeadPreviewModal.tsx`
- Read-only view of a lead’s `quoteData`.
- No mutations.
- Closes via `onClose`.
- Uses local helpers for date formatting and boolean display.

### `src/components/homeowner/LeadEditModal.tsx`
- State:
  - `isLoading`, `error`, `success`.
- Submission flow preserved:
  - Calls `PATCH /api/leads/[id]` with `quoteData` payload derived from the form result.
  - On success sets `success = true`, then after delay triggers `onSaveSuccess()` and `onClose()`.
  - On error sets `error` message.
- Cancel behavior:
  - `handleCancel` closes only if not loading.

### `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
- State preserved:
  - Bid selection state, expansion state for sections, confirmation flow state.
- Data fetching preserved:
  - Uses `fetch` helpers as implemented to load lead and bids; retry via existing buttons.
- Winner selection preserved:
  - Confirmation flow unchanged (open confirm UI, then call `onSelectWinner`).
  - Updates local bids state to reflect winner immediately.
  - Keeps modal open for 2 seconds to show winner badge, then closes.

### `src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx`
- Negotiation/review flow preserved.
- Reject / reject-deal buttons:
  - Same handlers and disabled states.
  - UI styling only changed; no conditional logic changed.

### `src/components/homeowner/SimplifiedQuoteForm.tsx`
- Quote calculation + form behavior unchanged.
- Only text styling adjusted (no state/validation changes).

## Notes

- This migration intentionally focuses on removing hardcoded color utilities and responsive typography utilities flagged by migration verification scans, while keeping all existing logic intact.
