# AI News Engine — Prototype Audit vs SOT (Google AI Studio UI/UX)

## 0) Purpose
This document audits the **Google AI Studio exported prototype** against the existing SOT plans:
- Admin SOT: `frontend-plan-admin.md` (14 steps)
- Public SOT: `frontend-plan-public.md` (6 steps)

Goal: identify **what is missing** (especially **missing UI endpoints/triggers**) and note **spec divergences** so we can produce a clean, sequence-locked enhancement plan.

---

## 1) Audit Targets
### Prototype location
- `DOCS/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin/`

### Key router/state file
- `App.tsx` (routes/views + global modals)

---

## 2) Executive Summary (High Impact Gaps)
**Critical E2E blockers (Admin):**
1) **Drafts & Reviews cards do not open the Review modal** (card click only logs).
2) **Automation Control global actions do not open confirmations** (buttons only log).
3) **Audit & Logs “View Prompt Details” has no endpoint** (button has no handler).
4) **Test & Preview modal has “Simulate Publish” / “Save to Drafts” buttons but no behavior** (no state update or navigation).

**Major spec mismatches / partials:**
- Settings page exists but does not match SOT Step 7 “News Engine Settings” scope.
- Multiple toggles exist but are **no-op** (`onChange={() => {}}`) and/or don’t provide any saved feedback.

**Public pages:** largely match the public SOT steps (listing, details, share trigger, optional SEO preview, loading/error/empty states), but the Share modal includes extras beyond SOT (social buttons + hard-coded brand colors).

---

## 3) Admin SOT (14 Steps) — Coverage Matrix
Legend: **✅ Implemented** / **🟡 Partial** / **❌ Missing**

| SOT Step | Surface | Expected in SOT | Prototype status | Evidence / Notes |
|---:|---|---|---|---|
| 1 | News Engine Dashboard | KPIs + filters + feed; Review opens Step 8; Pause opens Step 14; Test opens Step 10 | 🟡 Partial | Dashboard exists and Review opens ReviewModal. Pause uses ConfirmationModal (pause only). Filters are mostly UI-only. |
| 2 | Sources & Research | Add/edit source modal (Step 13); toggles + save config | 🟡 Partial | Add/Edit modal exists and is wired from App. Multiple toggles are no-op (`onChange={() => {}}`). Save buttons do not show saved feedback. |
| 3 | Drafts & Reviews | Board/queue; card click opens Step 8 modal; optional schedule action opens Step 9 | ❌ Missing (critical) | DraftsPage card click logs only; DraftsPage is mounted with no props from App so it cannot open ReviewModal. |
| 4 | Schedule & Automation | Rules + publish windows + safeguards | 🟡 Partial | AutomationPage exists with rules/windows UI. “Save Configuration” has no handler/feedback. Restricted auto-publish toggle is no-op. |
| 5 | Automation Control | Global actions (pause/resume/emergency) open Step 14 confirmations | ❌ Missing (critical) | ControlPage global actions log only; no confirmation modals are triggered. |
| 6 | Audit & Logs | Logs table; “View prompt” opens details drawer/modal (optional) | ❌ Missing (critical) | AuditLogsPage has prompt details icon but no click handler/endpoint. |
| 7 | Settings | Minimal News Engine settings (region, limits, dedupe, etc.) | 🟡 Partial | SettingsPage exists but appears to be general profile/AI config vs SOT News Engine settings. |
| 8 | AI News Draft View Modal | Tabs; actions: approve→schedule, rewrite→rewrite modal, reject→reject modal, save draft | ✅ Implemented | ReviewModal exists; onApprove/onRewrite/onReject are wired via App. Save as Draft shows local “Saving...” state. |
| 9 | Scheduling Modal | Schedule controls; confirm updates status | ✅ Implemented (UI-only) | SchedulingModal exists; App updates selected item status to Scheduled on confirm. |
| 10 | Test & Preview Modal | Run test; save-to-drafts; simulate publish | 🟡 Partial | TestPreviewModal runs test state machine, but footer actions are not wired. |
| 11 | Request Rewrite Modal | Single-intent rewrite reason; returns to review | ✅ Implemented (UI-only) | RewriteModal exists; App opens it from ReviewModal. |
| 12 | Reject Modal | Single-intent reject reason; returns to review | ✅ Implemented (UI-only) | RejectModal exists; App opens it from ReviewModal. |
| 13 | Add/Edit Source Modal | Add/edit source fields; save | ✅ Implemented (UI-only) | SourceModal exists; opened from SourcesPage via App handlers. |
| 14 | Confirmation Modals | Publish / Pause / Emergency stop confirmations | 🟡 Partial | ConfirmationModal exists and is used for “Pause News Pipeline” only. No confirmations for Resume/Emergency/Publish. |

---

## 4) Public SOT (6 Steps) — Coverage Matrix
| SOT Step | Surface | Prototype status | Notes |
|---:|---|---|---|
| 1 | Public News Listing (/news) | ✅ Implemented | Search + category + tag filters + loading/error/empty states exist. |
| 2 | Public News Details (/news/:slug) | ✅ Implemented | Details render w loading/error/not-found states. |
| 3 | Listing enhancement (search/filters) | ✅ Implemented | Included in listing already. |
| 4 | Share / Copy Link modal | 🟡 Partial | Share modal exists and copies link. Includes extra social buttons (not required by SOT). |
| 5 | Optional SEO preview panel | ✅ Implemented | “View Search Metadata” toggle exists on details page. |
| 6 | Final state coverage pass | ✅ Implemented | Listing/details cover loading/error/empty/not-found. |

---

## 5) Missing UI Endpoints (Concrete)
These are UI triggers/actions that exist visually but are not wired to the next state.

### 5.1 Drafts & Reviews → Review modal (SOT Step 3 → Step 8)
- Current: `DraftsPage` uses `console.log` in `handleCardClick`.
- Missing endpoint: `onCardClick(item)` should set `selectedNewsItem` and open `ReviewModal`.
- Additional structural issue: `App.tsx` mounts `<DraftsPage />` with **no props**, so Drafts cannot influence global modal state.

### 5.2 Automation Control global actions → confirmations (SOT Step 5 → Step 14)
- Current: `ControlPage` buttons call `handleGlobalAction()` which logs.
- Missing endpoint: `onRequestGlobalAction(action)` should open the correct confirmation modal.
- Confirmation coverage gap: Resume and Emergency actions have no confirmation at all.

### 5.3 Audit Logs prompt details (SOT Step 6)
- Current: prompt icon button has no `onClick`.
- Missing endpoint: open a small modal/drawer showing `promptUsed` (read-only) + copy.

### 5.4 Test & Preview footer actions (SOT Step 10)
- Current: buttons are enabled when state is `completed` but have no handlers.
- Missing endpoints:
  - “Save to Drafts” should create a draft record in UI state and route user to Drafts or open Review modal.
  - “Simulate Publish” should confirm and update a UI-only published state.

### 5.5 No-op toggles (Sources/Automation)
- Current: multiple toggles use `onChange={() => {}}`.
- Missing endpoint: toggle should update local state and reflect active/inactive correctly.

---

## 6) Backend/API Endpoints Implied by SOT (Not Implemented in Prototype)
These are suggested endpoints the backend will likely need to support the SOT UX. Names are examples only.

### Admin
- `GET /admin/news-engine/dashboard` (KPIs)
- `GET /admin/news-items?status&sourceType&confidence&dateRange&search` (feed)
- `GET /admin/news-items/:id` (full draft/research/seo/history)
- `POST /admin/news-items/:id/rewrite` (reason + optional guidance)
- `POST /admin/news-items/:id/reject` (reason)
- `POST /admin/news-items/:id/schedule` (datetime, priority, expiry, featured)
- `POST /admin/news-items/:id/publish` (immediate publish)
- `POST /admin/test-preview/run` (inputs: source or url + optional prompt override)
- `POST /admin/test-preview/save-draft` (persist test output)

### Sources & Automation
- `GET /admin/sources`
- `POST /admin/sources` / `PUT /admin/sources/:id` / `PATCH /admin/sources/:id/status`
- `GET /admin/automation/config` / `PUT /admin/automation/config`

### Control + Logs
- `POST /admin/pipeline/pause`
- `POST /admin/pipeline/resume`
- `POST /admin/pipeline/emergency-stop`
- `GET /admin/audit-logs?filters...`

---

## 7) Spec Divergences (Callouts)
- Public Share modal includes social share buttons and hard-coded brand colors, while SOT Step 4 specifies a minimal “copy link” modal.
- Some prototype labels/structure differ from SOT naming (e.g., “Rules & Logic” vs “Schedule & Automation”). This is fine as long as the surface responsibilities match.

---

## 8) Recommendation
Use the enhancement plan document to close the missing endpoints first (Drafts → Review; Control → Confirm; Logs → Prompt details; TestPreview actions), then tighten no-op toggles and align Settings with SOT Step 7.
