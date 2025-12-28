# Installer Dashboard — LeadFeed UX & UI Enhancement (Task Plan)

Date: 2025-12-27

References:
- Audit + Findings + Your decisions: `DOC/Features/Written Quote/INSTALLER-LEADFEED-UX-AUDIT-PLAN-2025-12-27.md`
- Guidelines entry: `DOC/GUIDELINES & SOT/README.md`
- Implementation SOT: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`
- UI/Routing SOT: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

---

## 1️⃣ Executive Summary
Goal: Make **/installer/leads (LeadFeed)** the **single lead management area** with tabs and deterministic state placement so **no lead disappears**.

Your confirmed decisions (from `### MY answers : ###`):
- **Rejected tab** includes both:
  - rejected by homeowner
  - rejected/declined by installer
- **Bidding “Under Bidding”** includes: bid submitted by installer and homeowner has not accepted/rejected it yet.
- **Call/Visit** has no “quote submitted” concept. After purchase it appears under Purchased → Call/Visit.
- **Expired leads** remain visible in an **Expired** tab with an expired badge.
- **Purchased tab** must be sub-tabbed by lead type: Call/Visit, Written, Bidding.

What will be implemented:
- LeadFeed tabs: Marketplace, Quote Submitted, Negotiation/Under Bidding, Purchased, Rejected, Expired.
- Purchased sub-tabs: Call/Visit, Written, Bidding.
- Unified data loading for LeadFeed so purchased/expired/rejected leads are visible without separate pages.
- Replace existing mock stat cards with real counts derived from the unified dataset.

---

## 2️⃣ Audit Findings (Summary)
From the audit doc:
- Lead management is split across `/installer/leads`, `/installer/lead-feed`, `/installer/purchased-leads`.
- APIs are split and inconsistent:
  - `/api/installer/leads/assigned` excludes purchased leads.
  - `/api/installer/leads/purchased` does not include writtenQuote/bid state.
- UI has partial “rejected” visuals but no rejected destination (no tab).
- Stat cards include placeholders/hardcoded values.

---

## 3️⃣ Proposed LeadFeed Tab Structure

### Top-level tabs
1) Marketplace
- Assigned leads the installer can act on (unlock/submit bid/submit written quote) and not in any other terminal tab.

2) Quote Submitted
- Written Quote: installer has a written quote record and negotiation is not in a terminal state.
- Bidding: installer has submitted a bid and homeowner has not selected/rejected outcome.

3) Negotiation / Under Bidding
- Written Quote: negotiation is active and in back-and-forth states (counter/revise/pending acceptance).
- Bidding: bid is in a selection-in-progress state (based on bid status + lead status mapping).

4) Purchased Leads
- Leads purchased by this installer.
- Must be sub-tabbed by: Call/Visit, Written, Bidding.

5) Rejected Leads
- Written Quote: negotiation closed (REJECTED / NEGOTIATION_EXPIRED) and includes who rejected.
- Installer-declined lead assignment: explicit decline action (requires persistence).

6) Expired
- Leads that are expired for this installer (based on lead.status and/or expiresAt).

---

## 4️⃣ Lead State Transition Table (Minimum)

| Action | From Tab | To Tab | Notes |
|---|---|---|---|
| Lead assigned | (none) | Marketplace | Shows countdown if applicable |
| Installer submits written quote | Marketplace | Quote Submitted | Lead card should reflect latest offer without opening modal |
| Homeowner counters / installer revises | Quote Submitted | Negotiation / Under Bidding | Real-time sync handled by existing written quote logic |
| Either party rejects negotiation | Any | Rejected | Includes rejectedByRole + reason if present |
| Negotiation expires | Any | Rejected (or Expired) | Use existing NEGOTIATION_EXPIRED semantics; final placement confirmed during impl |
| Installer purchases after agreed | Negotiation/Submitted | Purchased | Contact details visible after purchase |
| Installer declines lead assignment | Marketplace | Rejected | Requires new persistence so it survives refresh |
| Lead expires (assignment window ends) | Marketplace | Expired | Must remain visible |

---

## 5️⃣ UI Card Enhancements (Replace Mock Data)
Replace mock cards with real, tab-driven analytics derived from the unified dataset:
- Marketplace count
- Quote Submitted count
- Negotiation/Under Bidding count
- Purchased count
- Rejected count
- Expired count

(We will keep the number of cards minimal and avoid introducing new visual design patterns.)

---

## 6️⃣ Filter Enhancements
Keep existing filters but scope to the active tab:
- Lead type
- Postcode
- Date range

Add requested filters only where data already exists:
- State filter (from lead.state)
- Value filter (range bucket using leadPrice when available)

---

## 7️⃣ Risks & Dependencies
- True “installer declined lead” requires persistence. Current schema does not support it.
- Bidding status is partially localStorage-driven today; we must prefer backend state where possible.
- Purchased leads must be visible in LeadFeed; currently excluded from assigned endpoint.

---

## 8️⃣ Implementation Phases + Checkpoints

### Phase 0 — Safe consolidation of entry points
- Make `/installer/leads` the canonical LeadFeed.
- Redirect `/installer/lead-feed` and `/installer/purchased-leads` to `/installer/leads`.

Checkpoint:
- `npx tsc --noEmit`
- `npm run build`

### Phase 1 — Unified feed data contract
- Add a unified API endpoint that returns a consistent view model containing:
  - assigned leads (including expired)
  - purchased leads
  - per-installer writtenQuote/bid state
- Update LeadFeed page to use this unified endpoint.

Checkpoint:
- `npx tsc --noEmit`
- `npm run build`

### Phase 2 — Tabs + deterministic placement
- Implement LeadFeed tabs + Purchased sub-tabs.
- Implement deterministic “tab assignment rules” based on unified data.

Checkpoint:
- `npx tsc --noEmit`
- `npm run build`

### Phase 3 — Installer decline (Rejected leads persistence)
- Add persistence for installer-declined leads.
  - Preferred: extend `LeadAssignment` with decision fields.
  - Add endpoint to decline.
  - Ensure declined leads appear under Rejected tab.

Checkpoint:
- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run build`

### Phase 4 — Replace mock analytics
- Replace mock stats (e.g. hardcoded “Unlocked Today”, credit balance placeholders) with real counts.

Checkpoint:
- `npx tsc --noEmit`
- `npm run build`

---

## 9️⃣ Success Criteria
- LeadFeed is the single management area; purchased-leads page is no longer required for navigation.
- Tabs exist exactly as planned, including Expired.
- Purchased tab contains sub-tabs by quoteType.
- Rejected tab includes homeowner/installer rejection outcomes.
- No leads disappear across lifecycle transitions.
- No mock stats remain in LeadFeed header cards.
- `npx tsc --noEmit` and `npm run build` pass.
