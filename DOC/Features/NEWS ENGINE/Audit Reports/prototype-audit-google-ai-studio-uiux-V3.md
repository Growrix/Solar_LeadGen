# AI News Engine — Prototype Audit (Google AI Studio export) — V3

## 0) Purpose
This document audits the **Google AI Studio exported V3 prototype** against the SOT plans:
- `frontend-plan-admin.md`
- `frontend-plan-public.md`

It also validates the two UX architecture requirements introduced during V2:
1) **Admin Settings page must be NewsEngine-only** (no profile + no 2FA)
2) **All admin sections must live under a single “News Engine” surface with tabs** (no separate sidebar pages)

Scope: **UI-only accuracy + deterministic E2E transitions** (no backend).

---

## 1) Audit Targets
### 1.1 Prototype (V3)
Path:
- `DOCS/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin - V3/`

### 1.2 SOT Documents (Alignment Sources)
- `DOCS/NEWS ENGINE/SOT/frontend-plan-admin.md`
- `DOCS/NEWS ENGINE/SOT/frontend-plan-public.md`

---

## 2) Executive Summary (Verdict)
V3 is a **major improvement** over V2.

✅ **PASS** (met and working):
- Single **News Engine Hub** with **tabs** (requirement #2)
- **NewsEngine-only Settings** (no profile/2FA) (requirement #1)
- Shared state for **News items**, **Sources**, **Audit Logs** across tabs (fixes V2’s biggest wiring gap)
- Deterministic modals + confirmations for Review/Schedule/Test/Rewrite/Reject/Sources/Prompt Details

⚠️ **Still not fully aligned to SOT / not fully E2E-ready**:
- Dashboard filters are **missing required SOT controls** (notably **Date Range** and **Source Type**)
- “Create Manual Draft” / “Quick Draft” endpoints are **deterministic** but **semantically mismatched** (they open Test & Preview)
- Public pages are present, but **Public View is not wired to Admin Published items** (public uses its own mock list). This blocks a true E2E “Admin → Published → Public shows it” flow.

Because of these gaps, V3 is **close** but **not yet 100% aligned** with the SOT as-written.

---

## 3) V3 Compliance With Your Two Requirements
### Requirement 1 — Settings is NewsEngine-only
Status: ✅ **PASS**

Evidence:
- `SettingsPage.tsx` contains NewsEngine-related configuration (AI personalization, engine thresholds, notifications, engine API key).
- No personal profile/account settings.
- No 2FA section.

Notes:
- “Security & API” is treated as NewsEngine infrastructure (acceptable under “NewsEngine-only”).

### Requirement 2 — All pages are tabs under “News Engine”
Status: ✅ **PASS**

Evidence:
- `App.tsx` shows a single sidebar entry: **News Engine Hub**.
- Admin sections are rendered as **tabs** (Dashboard, Drafts & Reviews, Audit Logs, Master Control, Automation Logic, Sources, Settings).

---

## 4) SOT Step-by-Step Alignment (Admin Plan: 14 steps)
Legend: ✅ Pass | ⚠️ Partial | ❌ Missing

### Step 1 — News Engine (Main Dashboard Page)
Status: ⚠️ **PARTIAL**

What matches:
- KPI strip exists
- Search exists
- Status filter exists
- Confidence-like filter exists (min score)
- Feed exists with Review endpoint → opens Review modal
- Header includes Pause/Resume + Test & Preview
- “Clear all” resets active filters/search

What is missing / inaccurate vs SOT:
- Missing **Date range** filter/control
- Missing explicit **Source type** filter/control (prototype uses `category`, SOT expects `source type`)

Also note (UI semantics):
- “Create Manual Draft” currently opens Test & Preview (deterministic but not truly “manual draft creation”).

### Step 2 — Sources & Research
Status: ✅ **PASS**

What matches:
- RSS Source Manager table exists
- Add/Edit source opens modal
- Save updates table immediately (shared sources state)
- Research toggles + weights exist
- Research rules panel exists

### Step 3 — Drafts & Reviews
Status: ✅ **PASS**

What matches:
- Kanban board exists and is rendered from shared `news` state
- Clicking a card opens Review modal for that same shared item
- Quick Draft is deterministic

Notes:
- “Quick Draft” currently opens Test & Preview (deterministic, but semantics may be adjusted).

### Step 4 — Schedule & Automation (Rules Page)
Status: ✅ **PASS** (UI intent)

Evidence:
- `AutomationPage.tsx` provides rules/toggles, min-score thresholds, publish windows, and rule CRUD UI.

### Step 5 — Automation Control (Power Panel)
Status: ✅ **PASS**

Evidence:
- `ControlPage.tsx` provides Resume/Pause/Emergency and subsystem health cards.

### Step 6 — Audit & Logs (Logs Page)
Status: ✅ **PASS**

What matches:
- Logs list is shared state (`logs` in `App.tsx`)
- Actions append log entries (schedule, reject, rewrite, save, pipeline actions)
- Prompt Details modal opens from logs where prompt exists

### Step 7 — Settings
Status: ✅ **PASS** (per your requirement)

### Step 8 — AI News Draft View (Core Modal)
Status: ✅ **PASS**

### Step 9 — Scheduling (Modal)
Status: ✅ **PASS**

### Step 10 — Test & Preview (Modal)
Status: ✅ **PASS**

### Step 11 — Request Rewrite (Modal)
Status: ✅ **PASS**

### Step 12 — Reject (Modal)
Status: ✅ **PASS**

Notes:
- Reject currently sets item status to `Error`. SOT does not define a “Rejected” status explicitly; consider adding “Rejected” for clarity (recommended for backend planning).

### Step 13 — Add/Edit Source (Modal)
Status: ✅ **PASS**

### Step 14 — Confirmation Modals (Pause / Emergency Stop / Publish)
Status: ⚠️ **PARTIAL**

What matches:
- Pause/Resume/Emergency confirmations are implemented and logged

What’s incomplete vs the step title:
- There is no explicit “Publish from Review” confirmation path; publishing is simulated from Test & Preview. (This is acceptable UI-wise, but if you want “Publish” confirmation tied to a Review action, it should be added.)

---

## 5) Public/Guest Plan Alignment (6 steps)
Overall Status: ⚠️ **PARTIAL**

What matches:
- Public listing exists and is clean
- Public details exists with back navigation
- Share modal is implemented
- Public surfaces display published-only items (in their own mock state)

Critical gap for true E2E:
- Public View is **not wired** to Admin Published content.
  - Public pages generate and render their **own mock published list**.
  - Admin actions that publish/schedule do **not** change the public list.

This must be fixed to claim the UI is fully “E2E-ready” for backend planning.

---

## 6) Highest Priority Gaps (Must Fix Next)
1) **Wire Public View to Admin published items** (UI-only shared state contract)
2) Add missing Dashboard filters: **Date Range** + **Source Type** (or align the SOT to “Category”)
3) Fix “Create Manual Draft” / “Quick Draft” semantics (either rename to “Test & Preview” or implement real manual-draft creation flow)
4) Optional: introduce a dedicated `Rejected` status instead of mapping rejection to `Error`

---

## 7) Output Needed After This Audit
Because V3 still has gaps, a V3-specific enhancement plan is required:
- `frontend-enhancement-plan-prototype-alignment-V3.md`
