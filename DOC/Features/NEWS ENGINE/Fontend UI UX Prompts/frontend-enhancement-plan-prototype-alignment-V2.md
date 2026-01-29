# AI News Engine — Frontend Enhancement Plan (Prototype Alignment) — V2

## 0) Purpose
This document is a **sequence-locked enhancement plan** to align the **Google AI Studio exported V2 prototype** with:
- `frontend-plan-admin.md`
- `frontend-plan-public.md`

It also includes **your V2 personal UI change requirements**:
1) **Settings page must be NewsEngine-only** (no profile, no 2FA)
2) **All admin pages must appear as tabs under a single “News Engine” surface** (no separate sidebar pages)

Scope: **UI-only wiring and deterministic transitions** (no backend).

---

## 1) Strict Rules (Must Follow)
These rules are taken from: `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

- Do **not** implement multiple complex flows in one prompt.
- Prefer **pages/surfaces first**, then **wiring**, then **modals**, then **confirmations**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine V2 prototype alignment flow.`
- Every click must map to **what opens next** and how the UI returns.
- No undefined transitions (no dead buttons).

---

## 2) Scope & Constraints
### In Scope
- Navigation restructure: **News Engine hub + tabs**
- Settings refactor: **NewsEngine-only settings**
- Single-source-of-truth UI state for items, sources, logs
- Fix dead endpoints and missing UI wiring

### Out of Scope
- Real API calls / persistence
- Auth/roles
- New product features not in SOT

---

## 3) Build Sequence
Total Steps: **7**

1. Create a single “News Engine” hub surface with tabs (replace sidebar multi-page nav)
2. Unify News Items state across Dashboard + Drafts + Review actions
3. Unify Sources state so Add/Edit Source updates the table
4. Unify Audit Logs state so user actions appear in logs
5. Fix Dashboard filters (status/category/date/confidence) and “Clear all”
6. Fix dead endpoints (Create Manual Draft / Quick Draft)
7. Refactor Settings to NewsEngine-only (remove Profile + 2FA sections)

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

---

## Copy: Step 1 of 7 — Convert Admin navigation into a single “News Engine” hub with tabs
### Purpose
Meet your requirement: all admin pages appear under **one News Engine surface** using **tabs**, not separate sidebar pages.

### Requirements
- Replace the multi-item sidebar navigation with:
  - Sidebar item: **News Engine** (single entry)
  - Optional separate entry: **Public View** (kept separate because it’s a different surface)
- Inside the News Engine page, render tabs:
  - Dashboard
  - Drafts & Reviews
  - Sources & Research
  - Rules & Logic
  - Automation Control
  - Audit & Logs
  - Settings
- The existing page components (`DashboardView`, `DraftsPage`, `SourcesPage`, `AutomationPage`, `ControlPage`, `AuditLogsPage`, `SettingsPage`) must render under their respective tab panels.

### Interaction Map
- Click “News Engine” in sidebar → opens the hub page.
- Click each tab → switches content without unmounting modals incorrectly.
- Keep global modals (Review/Scheduling/Test/Confirm/etc.) working across tabs.

### What to expect in the outcome
- No separate sidebar pages for dashboard/drafts/audit/etc.
- Tabs control the currently visible section.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer working in a React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 1 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Refactor the Admin UI so all admin sections are shown as tabs inside a single "News Engine" hub page.
Remove separate sidebar entries for each section.

User interactions:
- Clicking a tab swaps the active panel.
- Global modals still open and close correctly.

Constraints:
- UI only
- Do not add new pages
- Keep Public View accessible

Output:
- Proposed component structure (NewsEngineHub + tabs)
- Where state should live

Stop after:
- Navigation and tabs structure only
```

---Done

## Copy: Step 2 of 7 — Unify News Items state across Dashboard + Drafts + Review actions
### Purpose
Fix the biggest wiring gap: Dashboard uses `news` state in `App.tsx`, but Drafts uses local mock state.

### Requirements
- Create a single source of truth for `NewsItem[]` in the top-level state.
- Pass items into:
  - Dashboard feed
  - Drafts board columns
- Ensure actions update the shared items:
  - TestPreview “Save to Drafts” → appears in Drafts board
  - Scheduling confirm → updates item status everywhere
  - Reject/Rewrite confirm → updates status everywhere

### Interaction Map
- Card click in Drafts → opens Review modal for that same item reference.

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 2 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Remove the Drafts page internal mock state and instead render drafts from a shared NewsItem[] state.
Ensure Dashboard + Drafts + Review actions read and write the same state.

Constraints:
- UI only
- Keep the existing look and layout

Output:
- Minimal state shape and prop passing
- How status transitions update the board

Stop after:
- Shared NewsItem state wiring only
```

---Done

## Copy: Step 3 of 7 — Unify Sources state so Add/Edit Source updates the table
### Purpose
Currently Add/Edit Source opens the modal, but Save does not update the Sources list UI.

### Requirements
- Lift sources state to the hub/App level.
- Pass `sources[]`, `onAdd`, `onEdit`, and `onSave` so:
  - Add Source inserts a new row
  - Edit Source updates an existing row

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 3 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Make the Sources & Research page source table a single source of truth that updates when the Add/Edit Source modal is saved.

Constraints:
- UI only
- Do not redesign the page

Output:
- Where sources state lives
- How SourceModal save updates the table

Stop after:
- Sources state wiring only
```

---Done

## Copy: Step 4 of 7 — Unify Audit Logs state so user actions appear in logs
### Purpose
Audit Logs is currently static mock data and does not reflect user actions.

### Requirements
- Lift logs state to the hub/App level.
- When these actions occur, append a log entry:
  - Simulate Publish
  - Schedule Confirm
  - Rewrite Confirm
  - Reject Confirm
- Keep Prompt Details modal working.

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 4 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Refactor Audit Logs to use shared log state and append new entries when user actions occur (schedule, publish, rewrite, reject).

Constraints:
- UI only
- Keep PromptDetailsModal

Output:
- Minimal LogEntry creation rules
- Where log state lives

Stop after:
- Logs state wiring only
```

---Done

## Copy: Step 5 of 7 — Dashboard filters: implement status/category/date/confidence and “Clear all”
### Purpose
Align the dashboard to SOT Step 1 filter expectations.

### Requirements
- Implement real filter state:
  - Status
  - Category
  - Confidence range (relevance score)
  - Date range (UI-only; can filter by `createdAt` label buckets if needed)
- “Clear all” resets all filters.
- Filter affects the feed results.

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 5 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Make the dashboard filters real (status/category/confidence/date) and ensure Clear all resets them.

Constraints:
- UI only
- Keep existing layout

Output:
- Filter state model and filtering logic
- Empty state behavior

Stop after:
- Dashboard filter wiring only
```

---Done

## Copy: Step 6 of 7 — Fix dead endpoints (Create Manual Draft / Quick Draft)
### Purpose
Avoid undefined transitions.

### Requirements
- “Create Manual Draft” (Dashboard empty state) must do something deterministic:
  - Option A (recommended): open Test & Preview modal in Custom URL mode
  - Option B: create a blank draft item and open Review modal
- “Quick Draft” (Drafts page) must do something deterministic:
  - Create a new draft item and open Review modal

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 6 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Remove dead-end buttons by wiring Create Manual Draft and Quick Draft to deterministic UI outcomes.

Constraints:
- UI only
- Minimal changes

Output:
- Which option you chose and why
- The exact state transitions

Stop after:
- Only these endpoints
```

---Done

## Copy: Step 7 of 7 — Refactor Settings to NewsEngine-only (remove Profile + 2FA)
### Purpose
Meet your requirement: Settings must be NewsEngine-only.

### Requirements
- Remove these sections:
  - Profile & Account
  - Security & API (including Two-Factor Authentication)
- Keep only NewsEngine-relevant sections such as:
  - AI Personalization (writing tone, default model, hallucination monitoring)
  - News Engine Settings (dedup sensitivity, archive period, etc.)
- Update save feedback copy from “Syncing Profile” to “Syncing Settings” (or similar NewsEngine wording).

### Copy and paste this prompt into Google AI Studio:
```
Context:
React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 7 of 7 in the AI News Engine V2 prototype alignment flow.

Task:
Refactor the Admin Settings page so it contains only NewsEngine-related controls.
Remove Profile/Account and Two-Factor Authentication content.

Constraints:
- UI only
- Do not add new unrelated sections

Output:
- Updated Settings page structure
- Confirmation of removed sections

Stop after:
- Settings page only
```

---Done

---

## 4) Cross-Cutting UX Requirements (Applies Everywhere)
- Preserve scroll position when closing modals.
- Avoid dead controls: every button must map to an explicit outcome.
- Shared state must keep Dashboard, Drafts, and Logs consistent.

---

## 5) Deliverable Checklist (V2)
- Tabs-based News Engine hub exists.
- Settings page is NewsEngine-only.
- Drafts, Dashboard, and Review actions reflect the same items.
- Sources Add/Edit updates table immediately.
- Audit Logs reflect user actions.
