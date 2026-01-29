# NEWS ENGINE — UX Fine-Tuning (V1) — VS Code Prompt Pack (2026-01-03)

**Purpose**
You will do further UI/UX enhancement in VS Code (not Google AI Studio). This prompt pack converts the plan below into **sequence‑locked, execution‑grade** prompts you can paste into Copilot Chat (or any coding AI) to implement each Phase‑1 item cleanly.

**Plan Source (SOT for this pack)**
- `DOC/FEATURES/NEWS ENGINE/UX-FINE-TUNING-PLAN-2026-01-03.md`

---

## Authority / References
- Prompting SOP: `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- Prompt template: `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`
- Design tokens (do not violate): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`

---

## Global Constraints (apply to every prompt)
1) **Sequence-locked**: each prompt declares `This is Step X of Y` and must not implement future steps.
2) **UI-only**: no real backend calls. You may add UI-only stubs, local state, and local CSV downloads.
3) **Respect existing architecture**:
   - `src/components/news-engine/AdminNewsEngineHub.tsx` remains the modal/state orchestrator.
   - Modals live in `src/components/news-engine/v6/modals/`.
   - Tabs remain in `src/components/news-engine/v6/tabs/`.
4) **Theme safety**:
   - Do NOT introduce `bg-slate-*`, `text-gray-*`, `bg-white`, `text-black`, `dark:*`, hex/rgb/rgba.
   - Use existing semantic tokens (`bg-background`, `bg-surface`, `text-foreground`, etc.).
5) **No dead-end UI**: any clickable control must have deterministic behavior OR be clearly disabled with a reason.
6) **No new pages**: Only add the minimum modals/helpers required by Phase 1.

---

## Build Sequence (Phase 1 Must‑Have) — Total Steps: 7
1) Audit Logs — Date range filter UI
2) Audit Logs — Log Details modal for non-prompt events
3) Audit Logs — Export CSV
4) Automation Logic — View Guidelines modal
5) Automation Logic — Operational Rules → Add Rule modal
6) Sources — Wire filter input
7) Master Control — Refresh Health simulation

Optional Phase 1b:
- Dashboard — pagination + row actions popover (two variants provided at the end)

---

# Copy/Paste Prompts (VS Code)

## Copy: Step 1 of 7 — Audit Logs: Date Range Filter (Modal)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

CONTEXT
Feature: News Engine Admin UI.
Plan SOT: DOC/FEATURES/NEWS ENGINE/UX-FINE-TUNING-PLAN-2026-01-03.md

FLOW POSITION
This is Step 1 of 7 in the News Engine UX fine-tuning flow.

TASK
Implement a working Date Range filter for Audit Logs.

EXISTING FILES
- src/components/news-engine/v6/tabs/AuditLogsTab.tsx (currently has a dead Date Range button)
- src/components/news-engine/AdminNewsEngineHub.tsx (modal orchestrator)

REQUIRED UX
- Clicking "Date Range" opens a small modal (preferred) with:
  - From (native input type="date")
  - To (native input type="date")
  - Apply
  - Reset
  - Cancel/Close
- Apply filters the in-memory audit log list (no backend).
- Reset clears the filter.
- Closing the modal returns to Audit Logs without losing other filters.

IMPLEMENTATION RULES
- Add a new modal component: src/components/news-engine/v6/modals/AuditDateRangeModal.tsx
- Keep all new modal state in AdminNewsEngineHub and pass the current filter + setter down to AuditLogsTabV6.
- Styling must use existing semantic tokens and neumorphic shadows.
- Do not implement CSV export or log details modal in this step.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after Date Range modal + filtering is fully working.
```

---Done

## Copy: Step 2 of 7 — Audit Logs: Log Details Modal (Non‑Prompt)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 2 of 7 in the News Engine UX fine-tuning flow.

TASK
Add a Log Details modal for audit log entries that do NOT have promptUsed.

EXISTING FILES
- src/components/news-engine/v6/tabs/AuditLogsTab.tsx (FileText button is currently dead)
- src/components/news-engine/AdminNewsEngineHub.tsx

REQUIRED UX
- In Audit Logs table, when a log has no promptUsed, clicking the FileText icon opens a modal.
- Modal shows:
  - Title: "Log Details"
  - Timestamp, action, origin, status
  - Full promptUsed section should be omitted (or show "No prompt recorded"), since this is for non-prompt logs.
  - Close button.

IMPLEMENTATION RULES
- Add modal component: src/components/news-engine/v6/modals/AuditLogDetailsModal.tsx
- Hub stores: selectedLogForDetails + open/close.
- AuditLogsTabV6 calls hub handler.
- Keep existing PromptDetailsModal behavior unchanged.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after the Log Details modal opens correctly from the FileText button.
```

---Done

## Copy: Step 3 of 7 — Audit Logs: Export CSV (Filtered)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 3 of 7 in the News Engine UX fine-tuning flow.

TASK
Make the "Export CSV Log" button export the currently filtered audit logs list.

EXISTING FILES
- src/components/news-engine/v6/tabs/AuditLogsTab.tsx (Export CSV is currently dead)
- src/lib/ui-stubs/news-engine.ts (allowed place for helpers)
- or src/components/news-engine/v6/shared.tsx (allowed place for helpers)

REQUIRED UX
- Clicking "Export CSV Log" downloads a CSV file locally.
- CSV includes headers (at minimum): timestamp, action, origin, status, promptUsed.
- Export uses the same filtered list currently displayed in the table.
- No backend.

IMPLEMENTATION RULES
- Create a helper function (choose one location and keep it small):
  - exportAuditLogsToCsv(logs: AuditLogEntry[], filename?: string)
- Use Blob + URL.createObjectURL + a temporary anchor click.
- Ensure CSV escaping for quotes/newlines.
- Do not change table layout.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after CSV export works from the UI.
```

---Done

## Copy: Step 4 of 7 — Automation Logic: View Guidelines (Modal)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 4 of 7 in the News Engine UX fine-tuning flow.

TASK
Make "View Guidelines" in Automation Logic open a guidelines modal.

EXISTING FILES
- src/components/news-engine/v6/tabs/AutomationLogicTab.tsx (View Guidelines is currently dead)
- src/components/news-engine/AdminNewsEngineHub.tsx

REQUIRED UX
- Clicking "View Guidelines" opens a modal with short guidelines text:
  - reinforce manual approval requirement
  - clarify what automation toggles do (UI-only)
  - include a simple bullet list
- Modal has Close.

IMPLEMENTATION RULES
- Add modal component: src/components/news-engine/v6/modals/AutomationGuidelinesModal.tsx
- Hub orchestrates open/close.
- Do not add new pages/routes.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after modal opens and closes correctly.
```

---Done

## Copy: Step 5 of 7 — Automation Logic: Operational Rules → Add Rule (Modal)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 5 of 7 in the News Engine UX fine-tuning flow.

TASK
Make the "Add Rule" button in Operational Rules open an Add Operational Rule modal and actually add a rule.

EXISTING FILES
- src/components/news-engine/v6/tabs/AutomationLogicTab.tsx
- src/components/news-engine/AdminNewsEngineHub.tsx

REQUIRED UX
- Clicking "Add Rule" opens a modal with fields:
  - Type (select: Limit, Filter, Constraint)
  - Label (text)
  - Value (text)
  - Description (textarea)
  - Active (toggle)
  - Save + Cancel
- On Save:
  - Adds the rule to the Operational Rules list in the tab.
  - Triggers the existing "Persisting Logic…" saved indicator.

IMPLEMENTATION RULES
- Add modal component: src/components/news-engine/v6/modals/OperationalRuleModal.tsx
- Keep actual Operational Rules array state in the tab (local UI state is fine), but the hub must control modal open/close.
- The modal should return a rule object via onSave(rule).
- Avoid ID collisions (simple increment or Date.now).
- No backend.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after Add Rule works end-to-end.
```

---Done

## Copy: Step 6 of 7 — Sources: Wire Filter Input
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 6 of 7 in the News Engine UX fine-tuning flow.

TASK
Make the "Filter sources…" input actually filter the sources table.

EXISTING FILES
- src/components/news-engine/v6/tabs/SourcesTab.tsx

REQUIRED UX
- Typing filters rows by source name OR source url.
- Filtering is client-side only.
- Table actions (edit/toggle) still work on filtered results.

IMPLEMENTATION RULES
- Add local state `query` and a derived `filteredSources`.
- Keep styling unchanged.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after filtering works.
```

---Done

## Copy: Step 7 of 7 — Master Control: Refresh Health (Simulated)
**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI working in an existing Next.js 14 + TypeScript app.

FLOW POSITION
This is Step 7 of 7 in the News Engine UX fine-tuning flow.

TASK
Make "Refresh Health" actually simulate a refresh and add an audit log entry.

EXISTING FILES
- src/components/news-engine/v6/tabs/MasterControlTab.tsx
- src/components/news-engine/AdminNewsEngineHub.tsx
- src/lib/ui-stubs/news-engine.ts (appendAuditLog helper already exists)

REQUIRED UX
- Clicking "Refresh Health" triggers the existing loading shimmer again (simulate a fetch).
- Adds an audit log entry like:
  - action: "Health Check Refreshed"
  - origin: "admin" or "system" (match existing conventions)
  - status: INFO

IMPLEMENTATION RULES
- Do not add backend.
- Prefer: expose an `onRefreshHealth()` prop from MasterControlTabV6 to the hub.
- In hub: set a `masterControlRefreshNonce` and pass it down so MasterControlTabV6 can re-run its loading effect.
- Keep tokens.

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after refresh re-triggers loading and logs the event.
```

---

# Optional Phase 1b — Dashboard Pagination + Row Actions

## Variant A (Minimal): Remove Pagination + Remove Kebab
Use if you want the smallest surface and no menus.

**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI.

TASK
On the Dashboard tab table:
- Remove the dead pagination controls (Previous/Next) entirely.
- Remove the dead row kebab (More options) entirely.

CONSTRAINTS
- Do not change the table layout otherwise.
- No new UI surfaces.

FILES
- src/components/news-engine/v6/tabs/DashboardTab.tsx

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after removing the dead controls.
```

## Variant B (Better UX): Implement Client Pagination + Row Actions Popover
Use if you want the UI to stay feature-complete without backend.

**Copy/paste into Copilot Chat:**
```
ROLE
You are a Senior Frontend Engineer AI.

TASK
On the Dashboard tab table:
1) Implement client-side pagination (10 rows/page): Previous/Next must work.
2) Implement the row kebab as a small popover menu with actions:
   - Review (same as clicking title)
   - Copy Title
   - Copy Summary

CONSTRAINTS
- UI-only.
- If clipboard API fails, show a subtle inline feedback (no new global toasts).
- Use semantic tokens; do not add new colors.

FILES
- src/components/news-engine/v6/tabs/DashboardTab.tsx

VALIDATION
- npx tsc --noEmit
- npm run build

STOP
Stop after pagination + popover actions work.
```
