# Installer Dashboard — LeadFeed UX & UI Enhancement (Audit → Plan Only)

Date: 2025-12-27

## Scope (Audit → Plan Only)
This document audits the current Installer LeadFeed / Purchased Leads experience and proposes an implementation plan to make **LeadFeed the single source of truth** for installer lead management with tabs:

- Marketplace
- Quote Submitted
- Negotiation / Under Bidding
- Purchased Leads
- Rejected Leads

Constraints:
- **No implementation changes are made in this task**.
- **No assumptions**: where the current codebase does not support a required behavior (e.g., “installer rejects a lead”), this document explicitly calls out the missing data model / contract.

---

## Current State — What Exists Today

### Pages / Routes (Installer)
There are multiple pages that conceptually represent “LeadFeed”, with overlapping responsibilities:

- `/installer/leads` — main route used by notifications via routeKey `installer.leads`.
  - Source: `src/app/installer/(dashboard)/leads/page.tsx`
  - Fetches: `GET /api/installer/leads/assigned`
  - Uses: `src/components/InstallerLeadFeed.tsx`
  - Uses mocked installer stats (e.g., `creditBalance: 1000`, `successRate: 85`).

- `/installer/lead-feed` — another LeadFeed page.
  - Source: `src/app/installer/(dashboard)/lead-feed/page.tsx`
  - Fetches: `GET /api/installer/profile` + `GET /api/installer/leads/assigned`
  - Uses: `src/components/InstallerLeadFeed.tsx`
  - Contains TODO placeholder analytics (`creditBalance: 0`, `totalUnlocks: 0`, `successRate: 0`).

- `/installer/purchased-leads` — separate page for purchased leads.
  - Source: `src/app/installer/(dashboard)/purchased-leads/page.tsx`
  - Fetches: `GET /api/installer/leads/purchased`
  - Uses: `src/components/InstallerLeadFeed.tsx` but with heavy client-side re-mapping.
  - Includes mock fields such as fake `expiresAt` (“30 days from now”), and forces `status: 'PURCHASED'` regardless of backend.

### APIs

- `GET /api/installer/leads/assigned`
  - Source: `src/app/api/installer/leads/assigned/route.ts`
  - Queries `LeadAssignment` for the installer.
  - Explicitly **excludes leads purchased by this installer**: “they go to Purchased Leads page”.
  - Includes:
    - `bids` for bidding leads (winner/loser detection)
    - `writtenQuotes` filtered to this installer (latest quote) for written quote status banners
  - Returns backend `lead.status` as a raw enum string (`APPROVED`, `PURCHASED`, etc), but the UI layer **re-maps** to client strings like `new/unlocked`.

- `GET /api/installer/leads/purchased`
  - Source: `src/app/api/installer/leads/purchased/route.ts`
  - Queries `Lead` where `installerId = session.user.id` and `purchasedAt != null`.
  - Does **not** include per-installer bid/written-quote state like the assigned route.
  - Does **not** conform to the same response shape as assigned.

### UI Component Reality (InstallerLeadFeed)
`src/components/InstallerLeadFeed.tsx` is the primary UI.

Key behaviors observed:
- No LeadFeed “tabs” exist today. Filtering is done via:
  - type dropdown (call_visit / written / bidding)
  - status dropdown (new / unlocked / submitted)
  - postcode input
  - date range dropdown
  - search
- **Bidding status badge uses localStorage** (`bid:draft:*`, `bid:submitted:*`) rather than backend source of truth.
- **Written quote rejection is handled** (banner when `negotiationStatus === 'REJECTED'`).
- **Bid loser state is handled** (banner when `myBid.status === 'REJECTED'`).
- “Unlocked Today” is currently hardcoded in the stats card (`3`).

---

## Problem Statement (What’s Broken / Missing)

### 1) LeadFeed is not a single source of truth
The user experience is fragmented across multiple pages and multiple data contracts.

Impact:
- Leads “disappear” from one view and show up somewhere else with different formatting.
- The same UI component is forced to support inconsistent inputs via client-side hacks.

### 2) There is no canonical, contract-level “tab state”
Tab-like organization is requested (Marketplace, Quote Submitted, etc.) but the current system only uses a mix of:
- backend `LeadStatus` enum
- client-mapped `lead.status` strings (`new/unlocked/submitted`)
- per-lead sub-states (written quote negotiation status, bid status)

Impact:
- State transitions cannot be reliably visualized.
- “Rejected leads” have no formal destination.

### 3) “Installer rejects a lead” is not represented in the DB schema
The request explicitly calls out “especially rejected leads” and implies installers can reject/decline leads. However:
- Prisma `LeadAssignment` has no acceptance/rejection fields.
- `POST /api/leads/[id]/reject` is **admin-only** and rejects the lead globally.

What exists today:
- Rejection of *a deal* exists via:
  - Bid outcome (loser bid)
  - Written quote negotiation rejection (`WrittenQuote.negotiationStatus = REJECTED`)

What does not exist today:
- A first-class “installer declined this assigned lead (marketplace)” record.

### 4) Analytics/summary cards are partly mocked
Across installer lead pages:
- `creditBalance` / `successRate` / `totalUnlocks` are placeholders or hardcoded.

### 5) Filters do not match requested UX
Requested: filters by state/type/timeline/value and tab-scoped behavior.
Current: basic filtering without a lifecycle-oriented model.

---

## Proposed UX (LeadFeed as Single Lead Management Area)

### Tab Structure (Requested)
Implement tabs inside the LeadFeed page (do not rely on separate pages).

Tabs:
1. **Marketplace**
2. **Quote Submitted**
3. **Negotiation / Under Bidding**
4. **Purchased Leads**
5. **Rejected Leads**

### “No Disappearing Leads” Rule
A lead relevant to the installer must always belong to exactly one visible tab based on explicit rules.

---

## Tab Assignment Rules (Proposed Contract)
These rules should be computed from backend data and returned explicitly (preferred), or computed client-side from a unified API contract.

> NOTE: Some rules require additional backend fields not present today. Those are marked as **Dependency**.

### Inputs Required per Lead (for a given installer)
For each lead, the feed needs:
- `lead.status` (backend enum)
- `lead.quoteType`
- `lead.purchasedAt`, `lead.installerId`
- Assignment relationship (LeadAssignment exists)
- Per-installer sub-state:
  - `myBid` (if bidding)
  - `myWrittenQuote` (if written)
  - `myQuote` (if call/visit) **Dependency** (currently not provided)
- Installer “declined lead” state **Dependency** (currently no schema)

### 1) Purchased Leads tab
If purchased by this installer:
- `lead.installerId == installerId && lead.purchasedAt != null`

### 2) Rejected Leads tab
This should include any leads that are “closed for this installer” and should remain visible.

Proposed inclusion:
- Written Quote: `myWrittenQuote.negotiationStatus in ['REJECTED', 'NEGOTIATION_EXPIRED']`
- Bidding: `myBid.status == 'REJECTED'` (lost bid)
- Installer declined assignment: `assignmentDecision == 'REJECTED'` **Dependency**

Optional (needs business confirmation):
- Global lead rejected/cancelled/expired: `lead.status in ['REJECTED','CANCELLED','EXPIRED']`

### 3) Negotiation / Under Bidding tab
Written Quote:
- `myWrittenQuote exists` AND negotiation is active (not purchased/rejected)
- Examples:
  - `HOMEOWNER_COUNTERED`, `INSTALLER_RESPONDED`, `PENDING_ACCEPTANCE`

Bidding:
- `myBid exists` AND homeowner selection pending
- This likely requires a stable backend signal, e.g. lead status / bid status transitions.

### 4) Quote Submitted tab
Written Quote:
- `myWrittenQuote exists` AND negotiation not yet in “active back-and-forth” OR it’s simply “submitted awaiting homeowner”.
- (Exact status mapping needs confirmation.)

Call/Visit:
- Installer has submitted a quote record for this lead **Dependency** (needs API field)

Bidding:
- Installer has submitted a bid but still in early stage.

### 5) Marketplace tab
Everything else assigned/visible to installer that is not Purchased, not Rejected, and not QuoteSubmitted/Negotiation.

---

## Required Backend Contract Changes (Plan)

### A) Unify assigned + purchased into one feed endpoint
Preferred: introduce a single endpoint:
- `GET /api/installer/leads/feed?tab=...&includeExpired=...` (name TBD)

It should return a **single consistent shape** for all tabs, including:
- lead base fields
- assignment fields
- per-installer state for bids/written quotes/quotes
- explicit computed `tab` and `subStatus` (optional but recommended)

Alternative (less ideal):
- keep both endpoints but standardize the returned view model, then merge client-side.

### B) Add data model support for “installer rejects a lead”
Because the schema currently cannot represent this state, you need one of:

Option 1 (minimal): extend `LeadAssignment`
- Add fields:
  - `decisionStatus` (e.g. `PENDING | ACCEPTED | REJECTED`)
  - `decisionAt`
  - `rejectionReason` (optional)

Option 2 (more flexible): create a new table `LeadAssignmentDecision`
- Supports multi-event history and auditing.

This is required to implement a true “Rejected Leads tab” for installer-declined leads.

### C) Add per-installer quote signals for call/visit leads
To support Quote Submitted/Negotiation tabs for Call/Visit leads, the feed contract must include at least one of:
- `myQuoteStatus` / `myQuoteId` / `hasSubmittedQuote`
- or include `quotes(where: installerId == installerId)`

---

## Frontend Implementation Plan (High-Level)

### Phase 1 — Consolidate UX entry points
- Make `/installer/leads` the canonical LeadFeed entry.
- Decide what to do with `/installer/lead-feed` and `/installer/purchased-leads`:
  - redirect to `/installer/leads` (preferred) OR
  - keep as thin wrappers that set the initial active tab.

### Phase 2 — Implement tabs in `InstallerLeadFeed`
- Add tab state and counts.
- Implement deterministic placement rules.
- Ensure lead cards can render correctly across tabs without fake fields (no fake expiresAt, no forced status strings).

### Phase 3 — Replace mocked analytics
- Replace “Unlocked Today” hardcoded value.
- Replace placeholder `creditBalance/totalUnlocks/successRate` with real computations.
  - If no wallet model exists yet, remove or show `—` with a clear “not available” state.

### Phase 4 — Filters per tab
- Keep existing filters but scope them to current tab.
- Add requested filters once the contract supports it:
  - state
  - timeline (countdown window / expiresAt)
  - value (leadPrice ranges)

### Phase 5 — QA: state transitions
Validate that each state transition moves the lead to the expected tab:
- quote submitted → quote submitted tab
- homeowner countered → negotiation tab
- bid lost → rejected tab
- agreed + purchased → purchased tab

---

## Risks / Dependencies
- **Missing schema support** for installer-declined leads means “Rejected Leads tab” cannot fully meet the requirement without backend work.
- **LocalStorage-based bid status** is not authoritative; it can desync across devices/browsers.
- Current UI status mapping (`new/unlocked/submitted`) does not align to backend `LeadStatus` and will cause edge cases unless unified.

---

## Open Questions (Must Confirm; No Assumptions)
1. Does “Rejected Leads” mean:
   - leads the installer *declined*, OR
   - leads where the installer *lost*, OR
   - both?

   (### MY answers : THe lead might be rejected by installer or rejected by homeowner. So both cases should be included in Rejected Leads tab. ###)
2. For Bidding leads, what is the exact “Under Bidding / Selection Pending” signal?
   - lead.status transitions? bid.status transitions?
   (### MY answers :  If the bid is submitted by installer and homeowner has not accepted or rejected it yet, then it should be in Under Submitted Bidding ###)
3. For Call/Visit leads, what defines “Quote Submitted”? Is it `Quote.status`? Does that quote exist for installers?
(### MY answers :  no, there is no quote submission for the Call/visit leads. So after purchase it will move to purchased leads tab > Under call/visit type leads tab ###)
4. Should expired marketplace leads be visible (and in which tab)? (### MY answers :  Yes, they should be visible in "Expired" tab with an "expired" badge ###)
5. Are Purchased Leads expected to be tabbed by quoteType (call/visit vs written vs bidding) inside Purchased tab? (### MY answers :  Yes, they should be tabbed by quoteType inside Purchased tab ###)
---

## Deliverables (When Implemented Later)
- One LeadFeed page with the requested tabs.
- One unified feed API contract supporting deterministic state placement.
- A first-class “installer rejects lead” capability with persistence + auditability.
- No disappearing leads across lifecycle transitions.
