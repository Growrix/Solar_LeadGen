# AI News Engine — Frontend Expansion UI/UX Prompts (Post-Feature) — 2026-01-13

**Purpose**: Provide sequence-locked, one-intent-per-step prompts to close the remaining post-feature UX gaps and prepare the UI for the Expanding plan V2 roadmap.

**Guideline (SOP)**: `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`

**Current-state audit inputs**:
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-FEATURE-AUDIT-2026-01-13.md`
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-13.md`

**Expansion blueprint**:
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

---

## Step 1 of 8 — Master Control: Make “System Health” truthful

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend UI + wiring to existing API calls only.

Flow position:
This is Step 1 of 8 in the AI News Engine frontend flow.

Trigger:
Admin opens the News Engine hub and navigates to the Master Control tab.

Problem:
The Master Control “System Health” / telemetry surfaces currently read like production metrics but are placeholders.

Task:
Update the Master Control tab so all health/telemetry surfaces are either:
- clearly labeled placeholders, OR
- replaced with truthful values already available from the app (pipeline status, last automation run summary, last error, last updated).

Requirements:
- Do not add fake numbers.
- If a value is not available, show “Not available” with a neutral placeholder label.
- Add a small “Last updated” timestamp area for each health panel (use current client time if the API does not provide a timestamp).
- Preserve existing layout style as much as possible.

Constraints:
- Do not design new pages.
- Do not invent new backend endpoints in this step.
- Do not change automation behavior.

Output:
- Exact UI copy changes for the health panels.
- Exact display rules (what shows when data missing).

Stop after:
- Updating the Master Control health/telemetry UI only.

---

## Step 2 of 8 — Master Control: Queue Snapshot shows explicit loading/empty/error

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend UI only.

Flow position:
This is Step 2 of 8 in the AI News Engine frontend flow.

Trigger:
Admin opens Master Control and views the Queue Snapshot section.

Task:
Improve the Queue Snapshot UI states so it never shows confusing nulls.

Requirements:
- Add explicit visual states for:
  - Loading
  - Error
  - Empty/No data
  - Success
- When data is missing, show “—” and a helper line like “Counts unavailable (endpoint not connected yet)”.
- Do not change the meaning of the cards.

Constraints:
- No backend work.
- Do not redesign the whole tab; keep changes localized to Queue Snapshot.

Output:
- State machine description and UI copy.

Stop after:
- Queue Snapshot UI state handling only.

---

## Step 3 of 8 — Drafts & Reviews: Remove hardcoded actor avatar chips

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend UI only.

Flow position:
This is Step 3 of 8 in the AI News Engine frontend flow.

Trigger:
Admin opens Drafts & Reviews and views item cards.

Problem:
The UI shows hardcoded avatar chips (e.g., U1/U2/U3) which implies real actor identity.

Task:
Remove or neutralize those chips so the UI never implies a real user identity unless it is real.

Requirements:
- Remove the hardcoded chips entirely OR replace with a single neutral label (e.g., “System” / “Unknown”).
- Ensure accessibility labels are updated accordingly.
- Keep spacing consistent after removing chips.

Constraints:
- No backend work.
- Do not change item status, actions, or workflow.

Output:
- Exact component changes (which chips removed/replaced).

Stop after:
- Drafts & Reviews card chip changes only.

---

## Step 4 of 8 — Automation Logic: Ensure persisted config always hydrates on mount

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend UI + data hydration.

Flow position:
This is Step 4 of 8 in the AI News Engine frontend flow.

Trigger:
Admin opens the Automation Logic tab.

Problem:
Config is persisted, but the UI does not reliably re-hydrate the saved config on mount, causing operator confusion.

Task:
Ensure the Automation Logic tab always loads the persisted automation config during initialization and renders the saved values.

Requirements:
- On mount, fetch the persisted automation config and populate all fields.
- Add a “Reset to Saved” action that restores last persisted values (without saving).
- When the user edits fields, show an “Unsaved changes” indicator (UI-only).

Constraints:
- Do not change backend schema.
- Do not redesign the entire tab.

Output:
- The exact hydration sequence and UX behavior.

Stop after:
- Automation Logic hydration + Reset to Saved only.

---

## Step 5 of 8 — Master Control: Run Automation Now shows a deterministic run summary panel

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend UI + wiring to existing run-now API if present.

Flow position:
This is Step 5 of 8 in the AI News Engine frontend flow.

Trigger:
Admin clicks “Run Automation Now”.

Task:
Add a “Last Run Summary” panel that displays:
- Run mode (Dry/Live if available)
- Start time / duration (if available)
- Counts (rssSynced, researchSynced, draftsCreated, published, errors)
- Last error message if present

Requirements:
- Show “No runs yet” state until first run.
- Show “Running…” while call in progress.
- Do not invent counts; show “—” when missing.

Constraints:
- Do not add new backend endpoints in this step.
- Do not change the runner behavior.

Output:
- UI structure and data mapping.

Stop after:
- Adding the run summary panel and wiring to the run-now call only.

---

## Step 6 of 8 — Sources: Unified Research Center entry point (UI shell only)

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
UI-only scaffold.

Flow position:
This is Step 6 of 8 in the AI News Engine frontend flow.

Trigger:
Admin wants to view all research (RSS + web/trends/social) in one place.

Task:
Add a “Unified Research Center” entry point in the existing UI and create a UI shell (not a new page) that can host unified research listing.

Requirements:
- Must be reachable from the existing admin hub tabs (no new route).
- Provide filter UI for:
  - Source type (RSS vs Research)
  - Kind (WEB/SOCIAL/JOURNAL/TREND)
  - Status
  - Date range
- The listing area can show an empty placeholder with “Endpoint pending” if no unified endpoint exists yet.

Constraints:
- Do not create new backend endpoints.
- Do not redesign existing tabs significantly.

Output:
- Component placement and UI behavior.

Stop after:
- UI shell + navigation entry point only.

---

## Step 7 of 8 — Dashboard: Placeholder KPIs become explicitly labeled

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
UI-only.

Flow position:
This is Step 7 of 8 in the AI News Engine frontend flow.

Trigger:
Admin views the Dashboard tab.

Task:
Update any remaining hardcoded KPI metrics so they are clearly labeled as placeholders.

Requirements:
- Add a “Placeholder” label and helper text for any metric not backed by real data.
- Do not remove the cards; just make their status explicit.

Constraints:
- No backend work.

Output:
- List of KPI cards updated and exact labels.

Stop after:
- KPI placeholder labeling only.

---

## Step 8 of 8 — Accessibility sweep for changed surfaces

Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 + TypeScript + Tailwind codebase.

Scope:
Frontend accessibility only.

Flow position:
This is Step 8 of 8 in the AI News Engine frontend flow.

Task:
Review the UI changes introduced in Steps 1–7 and ensure accessible labels and keyboard interactions are correct.

Requirements:
- Ensure buttons have clear aria-labels.
- Ensure any new status text is announced appropriately.
- Ensure tab order remains logical.

Constraints:
- Do not redesign UI.
- Do not add new features.

Output:
- Checklist of a11y fixes applied.

Stop after:
- Accessibility fixes only.
