# Written Quote Purchase Flow — Re-Audit (2025-12-23)

Scope: validate the Written Quote purchase flow matches `WRITTEN-QUOTE-PURCHASE-FLOW-AUDIT.md`, and fix gaps so the flow is end-to-end and the installer lead card reflects state changes without requiring modals.

## Expected Flow (per plan)
1. Homeowner clicks **Done Deal** → quote becomes **AGREED**.
2. Homeowner can click **Reject** → quote becomes **REJECTED** and installer is notified.
3. Installer lead card shows **Deal Agreed** banner with **Proceed to Payment**.
4. Installer clicks **Proceed to Payment** → quote `purchasedAt` is set; lead becomes **PURCHASED**.
5. After purchase, both parties can see each other’s contact details.
6. Lead cards must show updated state based on actions (no “hidden state only inside modal”).

## Gaps Found (Root Causes)
### Gap A — Lead card didn’t update after submit/agreed/reject
- **Why:** Installer lead cards render from `/api/installer/leads/assigned`, but the UI pages were not consistently passing Written Quote state into the `Lead` objects.
- **Why (secondary):** `/installer/lead-feed` page used placeholder installer id (`1`) and stubbed handlers for submit/unlock, so nothing refreshed and the card couldn’t match the installer’s quote.
- **Fix locations:**
  - Installer leads mapping now includes `writtenQuotes`: `src/app/installer/(dashboard)/leads/page.tsx`
  - Lead-feed page now uses real endpoints + refresh + real installer id: `src/app/installer/(dashboard)/lead-feed/page.tsx`

### Gap B — Installer/quote id type mismatches prevented quote matching
- **Why:** Many relations store `installerId` as string, but UI assumed a numeric id. This caused `myWrittenQuote` / `myBid` lookups to fail, hiding the banners.
- **Fix location:** `src/components/InstallerLeadFeed.tsx`
  - Normalized comparisons via `String(...)`.

### Gap C — No explicit “Quote Submitted / Awaiting homeowner” status on lead card
- **Why:** Even when a written quote existed, the lead card had no visible status; updates were effectively only visible inside the modal.
- **Fix location:** `src/components/InstallerLeadFeed.tsx`
  - Added a visible banner for “Written quote submitted — awaiting homeowner”.
  - Updated the action button label to “View / Update Quote” when a written quote exists.

## What Was Fixed
- Installer feed payload wiring and refresh so lead cards reflect:
  - quote exists (submitted)
  - agreed (shows Proceed to Payment)
  - rejected (shows rejection banner)
  - purchased (handled by purchase flow + purchased leads)
- `/installer/lead-feed` is now functional (no placeholders / no stub handlers).

## Manual Verification Checklist
1. Installer opens assigned written lead → submits written quote → lead card shows “Written quote submitted — awaiting homeowner” and button becomes “View / Update Quote”.
2. Homeowner clicks Done Deal → installer sees “Deal Agreed” banner on the lead card.
3. Installer clicks Proceed to Payment → purchase succeeds and contact details unlock.
4. Homeowner clicks Reject → installer sees rejection banner.
