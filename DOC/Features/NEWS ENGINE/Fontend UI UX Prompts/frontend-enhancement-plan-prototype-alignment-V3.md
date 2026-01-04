
# AI News Engine — Frontend Enhancement Plan (SOT Template, V3 Alignment)

## 0) Purpose
This document is the **Single Source of Truth** for closing the remaining gaps in the **AI News Engine UI/UX** (admin + public) so the frontend is **truly E2E-ready** for backend planning. It follows the SOT template for sequence-locked, prompt-driven UI development.

---

## 1) Strict Rules (Must Follow)
- Do **not** build complex flows in one prompt.
- Break the feature into **pages first**, then **modals**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine frontend flow.`
- Every click must map to: **what opens next**, fields/options, confirm/cancel behavior, and where the user returns.
- Do not jump ahead. If a next step exists, describe it in words only.

---

## 2) Scope & Constraints
### In Scope
- Public View must reflect Admin Published content (UI-only, shared state)
- Dashboard filters: add Date Range + Source Type
- Manual Draft/Quick Draft semantics: clarify or implement true manual draft
- Rejection status: distinguish `Rejected` from `Error`
- UI-only state handling: default, empty, loading, disabled

### Out of Scope
- Backend logic, API design, automation
- Permissions system

---

## 3) Information Architecture (Routes / Pages)
- News Engine Hub (admin)
	- Dashboard
	- Drafts & Reviews
	- Audit Logs
	- Master Control
	- Automation Logic
	- Sources
	- Settings
- Public View
	- News Listing
	- News Details

---

## 4) Core Domain Objects (UI-Level Only)
### 4.1 News Item
Fields:
- Title
- Status (Draft, Needs Review, Scheduled, Published, Error, Rejected)
- Source
- Date
- Category
- Tags

### 4.2 Statuses (User-Facing)
- Draft
- Needs Review
- Scheduled
- Published
- Error
- Rejected

---

## 5) E2E User Flow (Narrative)
1) Admin publishes a news item → it appears in Public View
2) Dashboard filters by date/source type
3) Manual Draft/Quick Draft actions are clear and deterministic
4) Rejecting an item sets status to `Rejected` (not `Error`)

---

## 6) Build Sequence (Pages First, Modals Later)
Total Steps: **6**
1. Public News Listing (wires to Admin Published)
2. Public News Details (wires to shared published list)
3. Dashboard (add Date Range + Source Type filters)
4. Manual Draft/Quick Draft (clarify or implement true manual draft)
5. Reject Modal (set status to `Rejected`)
6. Confirmation Modals (for publish, reject, etc)

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

## Copy: Step 1 of 6 — Public News Listing
### Purpose
Show all published news items (from Admin) to public users.

### Layout
- List of news cards (title, date, category, tags)
- Search bar, category filter
- Click card → opens News Details

### Interaction Map
- Clicking a card opens News Details for that item

### States
- Default: show published items
- Empty: “No news published yet”
- Loading: skeleton cards

### What to expect in the outcome
- Only items with `status === Published` are shown
- List updates immediately when Admin publishes

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of 6 in the AI News Engine frontend flow.

Task:
Build the Public News Listing page. Show only items where status is Published, sourced from the shared news state. Include search and category filter. Clicking a card opens News Details.

User interactions:
Clicking a card opens News Details (do not design details yet).

Constraints:
- No backend logic
- No modal implementations
- Do not design News Details yet

Output:
- UI layout + component breakdown
- Explicit empty/loading states

Stop after:
- This page only
```

---

## Copy: Step 2 of 6 — Public News Details
### Purpose
Show full details for a published news item.

### Layout
- Title, date, category, tags
- Full content
- Share button
- Back to listing

### Interaction Map
- Share button opens share modal
- Back button returns to listing

### States
- Default: show item
- Not found: “News not found”
- Loading: skeleton

### What to expect in the outcome
- Details are sourced from the shared published list

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of 6 in the AI News Engine frontend flow.

Task:
Build the Public News Details page. Show all fields for the selected published item. Include share and back buttons.

User interactions:
Share button opens share modal (do not design modal yet). Back returns to listing.

Constraints:
- No backend logic
- No modal implementations (unless share modal step)
- Do not design future pages

Output:
- UI layout + component breakdown
- Explicit not found/loading states

Stop after:
- This page only
```

---

## Copy: Step 3 of 6 — Dashboard Filters
### Purpose
Add Date Range and Source Type filters to the admin dashboard.

### Layout
- KPI strip
- Search, status, min-score, date range, source type filters
- News feed

### Interaction Map
- Changing filters updates feed
- “Clear all” resets all filters

### States
- Default: show all
- Filtered: show matching
- Empty: “No news matches”

### What to expect in the outcome
- Date range and source type filters are present and functional

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 3 of 6 in the AI News Engine frontend flow.

Task:
Update the Dashboard page to add Date Range and Source Type filters. Filters must update the feed and be reset by Clear All.

User interactions:
Changing filters updates feed. Clear All resets all.

Constraints:
- No backend logic
- No modal implementations
- Do not design future pages

Output:
- UI layout + component breakdown
- Explicit empty/loading states

Stop after:
- This page only
```

---

## Copy: Step 4 of 6 — Manual Draft/Quick Draft
### Purpose
Clarify or implement true manual draft creation.

### Layout
- Button(s): “Create Manual Draft” and/or “Quick Draft”
- If implementing true manual draft: modal with title, topic, category/tags, optional outline

### Interaction Map
- Button opens modal (if implemented)
- Confirm creates draft, routes to Drafts or opens Review

### States
- Default: buttons enabled
- Modal: empty/filled/disabled

### What to expect in the outcome
- Button label and modal intent match
- Flow is deterministic

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 4 of 6 in the AI News Engine frontend flow.

Task:
Clarify the intent of “Create Manual Draft” and “Quick Draft”. Either rename to match current behavior or implement a true manual draft modal (title, topic, category/tags, optional outline). Confirm creates a new draft and routes appropriately.

User interactions:
Button opens modal (if implemented). Confirm/cancel as appropriate.

Constraints:
- No backend logic
- No modal implementations unless this is the modal step
- Do not design future pages

Output:
- UI layout + component breakdown
- Explicit empty/loading/disabled states

Stop after:
- This page/modal only
```

---

## Copy: Step 5 of 6 — Reject Modal
### Purpose
Set status to `Rejected` (not `Error`) when rejecting a news item.

### Layout
- Modal: reason input, confirm/cancel

### Interaction Map
- Confirm sets status to `Rejected`, adds log
- Cancel closes modal

### States
- Default: input empty/filled
- Disabled: confirm disabled if no reason

### What to expect in the outcome
- Rejected items are clearly marked and logged

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 5 of 6 in the AI News Engine frontend flow.

Task:
Update the Reject modal so that confirming sets status to Rejected (not Error) and adds a log entry. Confirm is disabled if no reason is entered.

User interactions:
Confirm/cancel as appropriate.

Constraints:
- No backend logic
- No modal implementations unless this is the modal step
- Do not design future pages

Output:
- UI layout + component breakdown
- Explicit disabled/empty states

Stop after:
- This modal only
```

---

## Copy: Step 6 of 6 — Confirmation Modals
### Purpose
Ensure all confirmation modals (publish, reject, etc) are deterministic and match the flow.

### Layout
- Modal: message, confirm/cancel

### Interaction Map
- Confirm/cancel as appropriate

### States
- Default: message shown
- Disabled: confirm disabled if not allowed

### What to expect in the outcome
- All confirmations are clear and match the action

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 6 of 6 in the AI News Engine frontend flow.

Task:
Review all confirmation modals (publish, reject, etc) to ensure they are deterministic, match the action, and have clear confirm/cancel behavior.

User interactions:
Confirm/cancel as appropriate.

Constraints:
- No backend logic
- No modal implementations unless this is the modal step
- Do not design future pages

Output:
- UI layout + component breakdown
- Explicit disabled/empty states

Stop after:
- This modal only
```

---

## 7) Cross-Cutting UX Requirements (Applies Everywhere)
- Preserve filter state and scroll position when opening/closing modals.
- Buttons must show disabled state when action is not allowed for the current status.
- Any status change should be reflected immediately in UI (optimistic UI behavior).
- Avoid undefined transitions: if user clicks X, the next UI must be explicitly specified.

---

## 8) Deliverable Checklist (Frontend)
- All pages exist and are reachable from navigation.
- All modals open from the correct triggers.
- Every action has a deterministic next step.
- Default/empty/loading/disabled states are defined for each surface.

---

## 9) Phase 2 (Optional, Not In Current Build)
- Advanced analytics for news performance
- User personalization for public view

---

# [END OF PLAN]

