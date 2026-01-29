# News Engine Admin — UX Fine-Tuning Plan (UI Finalization)

Date: 2026-01-03

## Goal
Finalize the News Engine admin UI so **every visible action has a logical end-to-end UX** (even if still UI-only), eliminating dead ends before backend wiring.

This plan is scoped to the Next.js migration implementation (SolarMatch) and is written to preserve the V6 prototype’s IA and overall feel, while allowing targeted UX completion where the prototype itself contains no-op affordances.

## Constraints / Non‑Negotiables
- **V6 prototype remains the UI source of truth** for layout, labeling, and primary flows.
- **Tokenized styling only** (no hardcoded colors, no `dark:*` classes).
- Keep the hub orchestration pattern: `AdminNewsEngineHub.tsx` remains the single modal/state coordinator; modals live in `src/components/news-engine/v6/modals/`.
- All changes remain **UI-only** unless/ until backend endpoints are agreed.

## Findings: Current Dead Ends (Confirmed in Code)

### Dashboard
1) Row kebab (`More options`) has no behavior
- File: `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- Symptom: button renders but does nothing.

2) Pagination controls are inconsistent
- File: `src/components/news-engine/v6/tabs/DashboardTab.tsx`
- Symptom: `Previous` is always disabled; `Next` is clickable but has no handler.

### Drafts & Reviews
3) `View Options` has no behavior
- File: `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`

4) Card kebab icon suggests actions but is non-interactive
- File: `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx`

### Audit Logs
5) `Date Range` control is a dead button
- File: `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`

6) Log details for non-prompt events is a dead button
- File: `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`
- Symptom: logs without `promptUsed` show a FileText button that does nothing.

7) `Export CSV Log` is a dead button
- File: `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`

### Automation Logic
8) `View Guidelines` has no behavior
- File: `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`

9) `Operational Rules → Add Rule` has no behavior
- File: `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`

### Sources
10) “Filter sources…” input is not wired
- File: `src/components/news-engine/v6/tabs/SourcesTab.tsx`

### Master Control
11) `Refresh Health` button has no behavior
- File: `src/components/news-engine/v6/tabs/MasterControlTab.tsx`

## Recommended UX Fixes (Minimal, High-Value)

### Phase 1 (Must-have): remove dead buttons by giving them a UX
These are the highest ROI because they close visible holes without requiring backend.

1) Audit Logs — Date range filter
- UX: Clicking `Date Range` opens a small popover (or modal) with `From`/`To` (native `type="date"`) and Apply/Reset.
- Data: Filter applied to the in-memory logs list.
- Proposed implementation:
  - Add modal: `src/components/news-engine/v6/modals/AuditDateRangeModal.tsx`
  - Hub state: dateRange filter lives in hub and is passed into `AuditLogsTabV6`.

2) Audit Logs — Log Details modal for non-prompt events
- UX: FileText button opens `Log Details` modal showing the full entry.
- Proposed implementation:
  - Add modal: `src/components/news-engine/v6/modals/AuditLogDetailsModal.tsx`
  - Use existing `AuditLogEntry` type.

3) Audit Logs — Export CSV
- UX: Generates a CSV from the **currently filtered** list and triggers a download.
- Proposed implementation:
  - `exportAuditLogsToCsv(filteredLogs)` helper in `src/lib/ui-stubs/news-engine.ts` or `src/components/news-engine/v6/shared.tsx`.

4) Automation Logic — Add Rule
- UX: Opens `Add Operational Rule` modal with fields:
  - Type (select), Label, Value, Description, Active (toggle).
- On Save: adds to local `operationalRules` list and triggers the existing saved indicator.
- Proposed implementation:
  - Add modal: `src/components/news-engine/v6/modals/OperationalRuleModal.tsx`
  - Hub orchestration: open/close modal and pass back `onSave(rule)`.

5) Automation Logic — View Guidelines
- UX (simplest): open a modal showing a short “Guidelines” text block + link-like label (no external link required).
- Alternative: navigate to a local documentation route later.
- Proposed implementation:
  - Add modal: `src/components/news-engine/v6/modals/AutomationGuidelinesModal.tsx`

6) Sources — Wire filter input
- UX: typing filters table by `name` or `url`.
- Implementation: local state `query` + derived `filteredSources`.

7) Master Control — Refresh Health
- UX: click triggers the existing loading shimmer again (simulate refresh) and adds an audit log entry.
- Implementation: store a `refreshNonce` state and re-run the `useEffect` timer when it changes.

8) Dashboard — Pagination + row actions
- Option A (minimal): remove pagination buttons entirely (since list is small UI-only) and keep it as a single table.
- Option B (better UX): implement client-side paging (e.g. 10 rows/page) with real Next/Previous.
- Row kebab:
  - Either remove it, or implement a small “Actions” popover with: Review, Copy Title, Copy Summary.

### Phase 2 (Nice-to-have): consistency & clarity polish
- Drafts board: implement `View Options` (e.g., toggles for showing/hiding columns, or sorting).
- Draft card kebab: either remove the icon, or make it open a small actions menu.

## Backend Wiring Map (for later)
This is not implemented now; it’s the suggested contract surface once UX is frozen.

- Pipeline status actions:
  - `POST /api/news-engine/pipeline/pause`
  - `POST /api/news-engine/pipeline/resume`
  - `POST /api/news-engine/pipeline/emergency-stop` (requires typed confirm)

- Publish actions:
  - `POST /api/news-engine/items/:id/publish-now` (requires typed confirm)
  - `POST /api/news-engine/items/:id/schedule`

- Automation rules/windows:
  - `PUT /api/news-engine/automation/config`
  - `POST /api/news-engine/automation/rules`
  - `DELETE /api/news-engine/automation/rules/:id`

- Sources:
  - `GET/PUT /api/news-engine/sources`

## Acceptance Criteria (UI Finalization)
- No visible action is a no-op.
- Every “button-like” element either:
  - performs an action (UI-only ok), OR
  - is clearly disabled with an explanatory UX.
- All new UI matches the existing tokenized design system.
- Hub remains the orchestration layer (no modal state scattered across tabs).
