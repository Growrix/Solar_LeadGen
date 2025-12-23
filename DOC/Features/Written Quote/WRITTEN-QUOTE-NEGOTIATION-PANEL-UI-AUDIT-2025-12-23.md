# Written Quote — Negotiation Panel + Copy Alignment Audit (2025-12-23)

## Scope
This audit covers the UI/UX alignment work requested after Written Quote E2E integration was confirmed working.

Primary goals (per Raw_plan.md):
- Remove remaining "Bid"/"Bidding" wording from the Written Quote flow UI.
- Replace winner-selection semantics with Written Quote semantics ("Done deal" / agreement).
- Add the right-column Negotiation panel in BOTH:
  - Homeowner review modal
  - Installer builder modal

## Sources of Truth (SOT)
- DOC/Features/Written Quote/Raw_plan.md
- DOC/GUIDELINES & SOT/* and design-token requirements (no hardcoded colors/typography)

## Files In Scope
- src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx
- src/components/WrittenQuoteBuilderModal.tsx

## Findings (Before)
- Homeowner Written Quote review modal still contained bid-centric copy ("Bid", "Select as Winner") and winner-selection confirmation wording.
- Negotiation panel (right column) was missing from both the homeowner review experience and the installer builder experience.

## Changes Implemented
### 1) Homeowner — Review Modal
File: src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx
- Updated bid-centric copy to Written Quote language.
- Replaced winner-selection action with "Done deal" agreement action.
- Added a right-column Negotiation panel:
  - Displays current status and last offer.
  - Shows a compact negotiation timeline/history.
  - Allows homeowner to send a one-time counter offer (PATCH /api/written-quotes/[id]/counter).
  - Allows homeowner to finalize agreement (POST /api/written-quotes/[id]/agree).
- Fixed modal overlap with dashboard UI (z-index/stacking context):
  - Rendered the modal using a React portal to document.body.
  - Locked background scroll while the modal is open.
  - Ensured the overlay uses a high z-index so it always appears above dashboard layout chrome.

### 2) Installer — Builder Modal
File: src/components/WrittenQuoteBuilderModal.tsx
- Added a right-column Negotiation panel:
  - Fetches installer’s existing written quote for the lead.
  - Displays status, last offer, and a timeline.
  - Allows installer to send an updated offer (PATCH /api/written-quotes/[id]/revise).
  - Allows installer to finalize agreement (POST /api/written-quotes/[id]/agree).
- Fixed draft persistence key behavior:
  - Draft key now includes installer id from session (avoids cross-installer collisions).
  - Draft key uses mode === 'quote' for written-quote drafts.

## API Contracts Relied On
- GET /api/written-quotes?leadId=...
- PATCH /api/written-quotes/[id]/counter
- PATCH /api/written-quotes/[id]/revise
- POST /api/written-quotes/[id]/agree

## Verification Checklist
### Build / Type Safety
- npx tsc --noEmit
- npm run build

### Manual UX Checks
Homeowner:
- Open Written Quote review modal.
- Confirm wording: "Written Quote" and "Done deal" (no "Bid" / "Winner" wording).
- Send counter offer once; confirm UI prevents a second counter.
- Finalize with "Done deal"; confirm status becomes AGREED and actions are disabled appropriately.

Installer:
- Open Written Quote builder modal for a purchased WRITTEN_QUOTE lead.
- Confirm negotiation panel appears in right column.
- Revise offer; confirm timeline updates.
- Finalize with "Done deal"; confirm status becomes AGREED.

## Notes / Risks
- Draft autosave keys changed to be per-installer. Existing drafts saved under older keys may not auto-restore.
- Negotiation panel behavior assumes server enforces one-time homeowner counter and prevents changes after AGREED.
- Portal rendering changes DOM placement; if any parent relied on CSS inheritance for the modal container, verify visually (themes/breakpoints).
