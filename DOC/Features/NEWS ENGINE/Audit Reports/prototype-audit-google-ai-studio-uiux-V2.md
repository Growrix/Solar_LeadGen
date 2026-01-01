# AI News Engine — Prototype Audit (Google AI Studio export) — V2

## 0) Purpose
This document audits the **Google AI Studio exported V2 prototype** against the SOT plans:
- `frontend-plan-admin.md`
- `frontend-plan-public.md`

It also validates **your two new UX requirements** for V2:
1) **Admin Settings page must be NewsEngine-only** (no profile + no 2FA)
2) **All admin pages must live under a single “News Engine” surface with tabs** (no separate sidebar pages)

Scope: **UI-only accuracy and wiring** (no backend).

---

## 1) Audit Targets
### 1.1 Prototype (V2)
Path:
- `DOCS/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V2/`

### 1.2 SOT Documents (Alignment Sources)
- `DOCS/NEWS ENGINE/SOT/frontend-plan-admin.md`
- `DOCS/NEWS ENGINE/SOT/frontend-plan-public.md`
- `DOCS/NEWS ENGINE/SOT/frontend-enhancement-plan-prototype-alignment.md` (V1 alignment plan)

---

## 2) Executive Summary (Verdict)
V2 is **stronger than V1** in core UI completeness (Review, Scheduling, Test & Preview, Prompt Details, Confirmation), but it is **not fully aligned** with:
- Your new navigation requirement (**tabs under a single News Engine hub**) → **NOT met**
- Your new settings requirement (**NewsEngine-only settings**) → **NOT met**

Additionally, V2 has a **major wiring gap**: key pages (Dashboard, Drafts, Audit Logs, Sources) each keep their **own private mock state**, so actions do not consistently update the UI across views.

---

## 3) V2 Compliance With Your New Requirements
### Requirement 1 — Settings is NewsEngine-only
Status: ❌ **FAIL**

Evidence:
- `SettingsPage.tsx` contains:
  - **Profile & Account** (name/email/theme)
  - **Security & API** including **Two-Factor Authentication**
  - **Notifications** section

Required: Settings must contain **only NewsEngine-related settings**.

### Requirement 2 — All pages are tabs under “News Engine”
Status: ❌ **FAIL**

Evidence:
- `App.tsx` renders a multi-item **sidebar navigation** with separate views:
  - Dashboard, Drafts & Reviews, Audit & Logs, Automation Control, Rules & Logic, Sources & Research, Settings

Required: a single “News Engine” surface with **tabs** for these sections (no separate sidebar pages).

---

## 4) SOT Step-by-Step Alignment (Admin Plan: 14 steps)
Legend: ✅ Pass | ⚠️ Partial | ❌ Missing

### Step 1 — News Engine (Main Dashboard Page)
Status: ⚠️ **PARTIAL**

What matches:
- KPI strip exists (`App.tsx` → `DashboardView`)
- Search exists
- Primary action “Review” opens Review modal
- Header includes Test & Preview + Pause/Resume automation

What is missing / inaccurate:
- Filters are incomplete and mostly **no-op**:
  - Missing confidence range, date range controls
  - “Status” and “Category” buttons do not apply filters
  - “Clear all” does not reset real filter state
- “Create Manual Draft” CTA has no deterministic endpoint (click does nothing meaningful)

### Step 2 — Sources & Research
Status: ⚠️ **PARTIAL**

What matches:
- RSS Source Manager exists
- Research toggles + weights exist
- Research rules panel exists
- Add/Edit Source opens a modal

What is missing / inaccurate:
- Source save does not update the Sources list across the page because Sources list is private state inside `SourcesPage.tsx` while `SourceModal` save is handled in `App.tsx` only by closing the modal.

### Step 3 — Drafts & Reviews
Status: ⚠️ **PARTIAL**

What matches:
- Kanban board exists
- Clicking a card opens Review modal (`DraftsPage.tsx` via `onReviewDraft` → `App.tsx`)

What is missing / inaccurate:
- Drafts board uses **local mock state** (`DraftsPage.tsx`) instead of the shared `news` list from `App.tsx`.
- As a result, actions that update `news` in `App.tsx` (e.g., schedule, simulate publish, save test to drafts) **will not show** in the Drafts board.

### Step 4 — Schedule & Automation (Rules Page)
Status: ✅ **PASS** (UI intent)

Notes:
- “Rules & Logic” (`AutomationPage.tsx`) provides automation toggles, publish windows, and saved feedback.

### Step 5 — Automation Control (Power Panel)
Status: ✅ **PASS**

Notes:
- `ControlPage.tsx` provides Pause/Resume/Emergency buttons.
- `ConfirmationModal.tsx` is used via config in `App.tsx` and closes correctly on confirm.

### Step 6 — Audit & Logs (Logs Page)
Status: ⚠️ **PARTIAL**

What matches:
- Logs table exists
- “View Prompt Details” endpoint exists and opens `PromptDetailsModal.tsx`

What is missing / inaccurate:
- Audit logs are private mock state in `AuditLogsPage.tsx`. User actions (rewrite/reject/schedule/publish) do not append to logs.

### Step 7 — Settings (Settings Page)
Status: ❌ **FAIL**

Reason:
- Violates the new requirement: Settings must be NewsEngine-only.

### Step 8 — AI News Draft View (Core Modal)
Status: ✅ **PASS**

Notes:
- `ReviewModal.tsx` contains clear action endpoints (Approve → Scheduling, Rewrite → RewriteModal, Reject → RejectModal, Save as Draft).

### Step 9 — Scheduling (Modal)
Status: ✅ **PASS**

Notes:
- `SchedulingModal.tsx` exists and schedules, and `App.tsx` updates the selected item status to Scheduled (within the shared `news` list only).

### Step 10 — Test & Preview (Modal)
Status: ⚠️ **PARTIAL**

What matches:
- `TestPreviewModal.tsx` exists
- “Save to Drafts” and “Simulate Publish” are wired in `App.tsx`

What is missing / inaccurate:
- “Save to Drafts” currently adds a new item to `news` and navigates to Drafts, but Drafts board uses local state and will not show the new draft.

### Step 11 — Request Rewrite (Modal)
Status: ⚠️ **PARTIAL**

What matches:
- `RewriteModal.tsx` exists and enforces a required instruction

What is missing / inaccurate:
- Confirming rewrite does not update the item status nor does it add any log entry.

### Step 12 — Reject (Modal)
Status: ⚠️ **PARTIAL**

What matches:
- `RejectModal.tsx` exists and requires a reason

What is missing / inaccurate:
- Confirming rejection does not update item status nor add any log entry.

### Step 13 — Add/Edit Source (Modal)
Status: ⚠️ **PARTIAL**

What matches:
- `SourceModal.tsx` exists with validation and enable toggle

What is missing / inaccurate:
- Saving does not update the Sources list UI.

### Step 14 — Confirmation Modals (Publish / Pause / Emergency Stop)
Status: ✅ **PASS**

Notes:
- `ConfirmationModal.tsx` supports warning/info/danger variants and deterministic close behavior.

---

## 5) Public/Guest Plan Alignment (6 steps)
Overall Status: ✅ **PASS** (UI intent)

Notes:
- Public listing + details pages exist (`PublicNewsPage.tsx`, `PublicNewsDetailsPage.tsx`).
- Details page includes Share trigger (Share modal opens via `App.tsx`).
- Public surfaces show published-only mock content.

---

## 6) Highest Priority Gaps (Must Fix Next)
1) Convert Admin navigation to a **single “News Engine” hub with tabs** (your requirement)
2) Refactor Settings to be **NewsEngine-only** (your requirement)
3) Establish **single source of truth state** for:
   - News items (Dashboard + Drafts + Review actions)
   - Audit logs (to reflect actions)
   - Sources list (save/add/edit must reflect immediately)
4) Fix “dead endpoints” (e.g., Create Manual Draft)
5) Make Review actions update status + audit trail consistently

---

## 7) Output Needed After This Audit
A new V2-specific enhancement plan has been prepared separately:
- `frontend-enhancement-plan-prototype-alignment-V2.md`
