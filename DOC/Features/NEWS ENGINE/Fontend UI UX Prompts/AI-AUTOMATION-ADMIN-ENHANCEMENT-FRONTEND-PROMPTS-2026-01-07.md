# News Engine — AI Automation (Admin Deep Control) — Frontend UI/UX Prompt Pack (SOT)

> **Status:** UI/UX Enhancement Planning Complete (Ready for Step-by-step implementation)
> **Audience:** Frontend AI Builders → Backend Engineers → Product Owners
> **Dependency:** Must be completed BEFORE backend enhancement planning & implementation
>
> This document is intentionally **sequence-locked** and is designed to be **copy/paste friendly** for AI builders.

---

## 0) Purpose & Contract

This document is the Single Source of Truth (SOT) for **frontend UI/UX enhancements** to the existing **News Engine Admin** experience.

It guarantees:
- Deterministic operator UX for “Run Automation Now”
- Clear observability (run history + queue counts + blocked reason)
- Publish Windows v2 UI (timezone + days + time ranges + preview)
- Operational Rules v2 UI (persisted rule semantics + presets + explainability)
- Settings re-grouping for model router + key vault (UI surfaces only, backend-aware)

⚠️ This doc **must** align with the updated SOT in `DOC/FEATURES/NEWS ENGINE/SOT`.

---

## 1) Authority / References (Must Be Read)

- Updated Feature SOT: `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md`
- AI/Automation Addendum: `DOC/FEATURES/NEWS ENGINE/SOT/AI-AUTOMATION-ADMIN-SOT-ADDENDUM.md`
- Frontend contract: `DOC/FEATURES/NEWS ENGINE/SOT/Frontend-Plan.md`
- Enhancement plan: `DOC/FEATURES/NEWS ENGINE/Plan/AI-AUTOMATION-ADMIN-ENHANCEMENT-PLAN-2026-01-07.md`
- Current-state audit report: `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-inventory-mapping-audit-2026-01-07.md`

Prompting SOP + template:
- Prompting SOP: `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`
- Output template: `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/Template_Comprehensive_UI UX.md`

Design system constraints (do not violate):
- Semantic tokens only; no hardcoded palette; no `dark:*`; no hex/rgb.

---

## 2) Non-Negotiable Rules (Must Be Enforced by Any AI)

### Structural rules
- Do **not** add new routes or tabs. All work stays inside existing V6 tab structure:
  - Master Control
  - Automation Logic
  - Sources & Research
  - Settings
  - Audit Logs
- Pages are built **before** modals.
- One step = one page enhancement OR one modal enhancement.
- One modal = one intent.

### Prompting rules
- Every prompt MUST include:
  - `This is Step X of Y in the News Engine Admin enhancement frontend flow.`
- Each step must define:
  - Trigger source
  - Exit destination
  - UI states (default/loading/empty/disabled/error)
- Do not jump ahead.

### UX safety rules
- No invisible state transitions.
- No destructive actions without confirmation UX.
- Every operator click must have a deterministic result:
  - state update OR modal opens OR navigation/scroll focus.

### Styling rules (critical)
- Do NOT use: `bg-slate-*`, `text-gray-*`, `bg-white`, `text-black`, `dark:*`, `#hex`, `rgb()`, `rgba()`.
- Use only existing semantic tokens already used in this codebase (examples):
  - `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `shadow-neu-*`.

---

## 3) Scope & Explicit Constraints

### In scope
- UI/UX enhancements inside existing News Engine admin route `/admin/news-engine`.
- Enhancements to the existing tab components:
  - `src/components/news-engine/v6/tabs/MasterControlTab.tsx`
  - `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx`
  - `src/components/news-engine/v6/tabs/SourcesTab.tsx`
  - `src/components/news-engine/v6/tabs/SettingsTab.tsx`
  - `src/components/news-engine/v6/tabs/AuditLogsTab.tsx`
- Modals may be added/enhanced only if explicitly required by this plan (e.g., Run Details, Queue Details, Publish Window Builder, Key Vault).

### Out of scope (for these frontend prompts)
- Implementing new backend endpoints
- Implementing DB schema or migrations
- Implementing the internal runner logic

> Backend awareness is allowed: each step may list **required backend hooks**, but must not implement server code.

---

## 4) Information Architecture (IA)

### Navigation entry points
- Existing entry: Admin nav → `News Engine` → `/admin/news-engine`

### Pages hierarchy (no changes)
```
Admin
 └─ /admin/news-engine
    ├─ Tab: Dashboard
    ├─ Tab: Drafts & Reviews
    ├─ Tab: Audit Logs
    ├─ Tab: Master Control
    ├─ Tab: Automation Logic
    ├─ Tab: Sources
    └─ Tab: Settings
```

---

## 5) Core Domain Objects (UI-level contract)

> These are UI concepts, not final schemas.

### 5.1 Object: Automation Run
Used for:
- Run history list
- Run summary card
- Run details modal

Minimum display fields:
- Run ID
- Status (RUNNING/SUCCESS/FAILURE)
- Started/finished timestamps
- Stage counts (imported, drafted, scheduled, published)
- Errors count
- Blocked reason (if run did not execute)

### 5.2 Object: Queue Snapshot
Used for:
- Queue counts panel

Minimum display fields:
- RSS NEW entries count
- Research NEW entries count (per kind)
- Drafts needing review
- Scheduled due soon
- Errors

### 5.3 Object: Publish Windows v2
Used for:
- Schedule builder UI

Minimum display fields:
- Timezone
- Days of week
- One or more time ranges per day
- Optional jitter
- Optional blackout dates
- Preview next 10 slots

### 5.4 Object: Operational Rule v2
Used for:
- Rules list
- Rule editor modal

Minimum display fields:
- Scope (select/research/draft/gate/schedule/publish)
- Conditions (category/domain/keywords/score/day/time)
- Action (allow/block/require review/force model/priority)
- Severity (warn/block)

---

## 6) End-to-End UX Flow (Narrative)

Primary operator flow (enhanced):
1) Admin opens `/admin/news-engine` → goes to **Master Control** tab.
2) Admin sees pipeline status + queue snapshot + recent runs.
3) Admin chooses **Dry Run** or **Live Run** then clicks **Run Automation Now**.
4) UI shows RUNNING state until completion.
5) On completion, UI shows run summary + link to run details; errors are visible and actionable.
6) Admin configures **Publish Windows v2** in **Automation Logic** and previews next slots.
7) Admin manages **Operational Rules v2** with presets and clear meaning.
8) Admin uses **Sources & Research** to sync RSS and research, and can view entries.
9) Admin uses **Settings** to manage model routing and API keys (Key Vault) safely.

---

## 7) Build Sequence (Locked Order)

**Total Steps:** 9

| Step | Type | Name | Reason |
|---:|---|---|---|
| 1 | Tab enhancement | Master Control — Deterministic Run Now UX | Fix trust problem first |
| 2 | Modal enhancement | Run Summary + Run Details modal | Observability + debuggability |
| 3 | Tab enhancement | Master Control — Queue Snapshot panel | Operator clarity |
| 4 | Tab enhancement | Automation Logic — Publish Windows v2 Builder | Core scheduling pain point |
| 5 | Modal enhancement | Operational Rules v2 editor (presets + explainability) | Rules that “do something” |
| 6 | Tab enhancement | Sources & Research — Sync panels + View Entries | Make research visible |
| 7 | Tab enhancement | Settings — AI Model Router UI grouping | Per-task model control |
| 8 | Tab + Modal enhancement | Settings — Key Vault + Pools UI | Multi-key management |
| 9 | Modal enhancement | Item Provenance + Image Controls (Review modal) | Trust + content control |

⚠️ Steps must be executed strictly in order.

---

# STEP-BY-STEP UI/UX SPEC + AI-READY PROMPTS

> Copy/paste each “Copy:” prompt into your AI builder.
> Do not skip steps.

---

## Copy: Step 1 of 9 — Master Control: Deterministic “Run Automation Now” UX

```
Context:
You are a SaaS frontend UI/UX engineer working inside an existing Next.js admin app.
You must use the existing neumorphic multi-theme design tokens and must not introduce hardcoded palette classes.

Flow position:
This is Step 1 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/MasterControlTab.tsx

Task:
Enhance the Master Control tab so “Run Automation Now” is deterministic and trustworthy.

Required UX behavior:
- Add a small mode selector adjacent to the Run button:
  - Dry Run (no schedule/publish)
  - Live Run (follows automation toggles)
- When pipeline status is PAUSED or EMERGENCY_STOP:
  - Run button is disabled
  - Show a visible “Blocked reason” message explaining why
- When Run is clicked:
  - Show RUNNING state (disable button + spinner + clear label)
  - Do not require navigation to another tab to see result

Interaction map:
- Select mode → updates local UI state
- Click Run Automation Now → opens existing confirmation OR immediately runs (whichever current app pattern uses), but MUST show running state after confirmation

UI states:
- Default
- Disabled (blocked)
- Running
- Completed (success)
- Completed (failure)

Constraints:
- Do not add new tabs or routes.
- Do not invent new colors.
- Do not implement backend logic.

Backend hooks required (list only):
- A single frontend call that starts a run and returns a runId + status.

Stop after:
- Only the deterministic Run Now UX changes on Master Control.
```

---

## Copy: Step 2 of 9 — Run Summary + Run Details modal

```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI + wiring only.

Flow position:
This is Step 2 of 9 in the News Engine Admin enhancement frontend flow.

Trigger:
Opened after a run completes OR when user clicks “View run details” from Master Control.

Task:
Add a Run Summary card area to Master Control and a Run Details modal.

Run Summary card requirements:
- Visible on Master Control after a run completes
- Shows: runId, started/finished, status, counts (imported/drafted/scheduled/published), errors count
- Has CTA: “View run details” (opens modal)

Run Details modal requirements:
- Sections:
  - Header: Run ID + status badge
  - Stage breakdown table (Ingest/Select/Research/Draft/Gate/Schedule/Publish)
  - Skip reasons (if any)
  - Errors list (if any)
- Exit rules:
  - Close → returns to Master Control without losing scroll position

Constraints:
- No new pages.
- No backend logic.

Backend hooks required (list only):
- Fetch run details by runId

Stop after:
- Only Run Summary + Run Details modal UX.
```

---

## Copy: Step 3 of 9 — Master Control: Queue Snapshot panel

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 3 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/MasterControlTab.tsx

Task:
Add a Queue Snapshot panel that makes the automation backlog visible.

Layout structure:
- A card/panel near the top of Master Control (below the hero section is fine)
- Display counts:
  - RSS NEW entries
  - Research NEW entries (WEB/SOCIAL/JOURNAL/TREND) — show as grouped rows
  - Drafts needing review
  - Scheduled due soon
  - Errors

Interaction map:
- Click a queue row → (optional) opens a lightweight “Queue Details” modal OR navigates user to the most relevant existing tab (Sources, Drafts & Reviews, Audit Logs)

UI states:
- Default
- Loading
- Empty (all zero)

Constraints:
- No new tabs/routes.
- Do not implement backend logic.

Backend hooks required (list only):
- A single endpoint or state field that returns these counts.

Stop after:
- Only the Queue Snapshot panel.
```

---

## Copy: Step 4 of 9 — Automation Logic: Publish Windows v2 Builder

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 4 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/AutomationLogicTab.tsx

Task:
Replace the current “windows string list” UI with a Publish Windows v2 builder.

Required layout:
- Section header: Publish Windows v2
- Inputs:
  - Timezone (required) selector/input
  - Days of week checkboxes
  - For each selected day: one or more time ranges (start/end)
  - Optional jitter (minutes)
  - Optional blackout dates list
- Preview:
  - “Next 10 slots” list computed from the builder state

Interaction map:
- Add time range → appends to that day
- Remove time range → removes
- Preview updates immediately
- Save → uses existing “Persisting Logic” UX

UI states:
- Default
- Invalid (end <= start)
- Empty (no ranges)
- Saving feedback (use existing saved indicator pattern)

Constraints:
- Do not add new tabs/routes.
- Do not invent scheduling semantics beyond what’s written here.
- No backend logic.

Backend hooks required (list only):
- Persist publish windows config JSON

Stop after:
- Only Publish Windows v2 builder UI + preview.
```

---

## Copy: Step 5 of 9 — Operational Rules v2: Presets + Explainability (Rule Editor Modal)

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 5 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/AutomationLogicTab.tsx
- src/components/news-engine/v6/modals/OperationalRuleModal.tsx

Task:
Upgrade Operational Rules UI so rules have clear meaning and can be created from presets.

Requirements:
- Rules list should show:
  - Scope
  - Summary of conditions
  - Action + severity
  - Enabled toggle
- Rule editor modal must support:
  - Scope selector
  - Conditions builder (simple UI; no complex DSL)
  - Action selector
  - Severity selector (warn/block)
- Presets:
  - Provide preset buttons that prefill the editor:
    - “Policy posts require manual review”
    - “Block blacklisted keywords”
    - “Require ≥2 independent sources/citations”
    - “If duplicate similarity > 90% ignore”

Explainability UX:
- Every rule shows a short “What this does” helper text.

Constraints:
- Do not add new tabs/routes.
- No backend logic.

Backend hooks required (list only):
- Persist operational rules and retrieve them on load

Stop after:
- Only the Operational Rules UX upgrade.
```

---

## Copy: Step 6 of 9 — Sources & Research: Sync panels + View Entries

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 6 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/SourcesTab.tsx

Task:
Make RSS and Research “visible” by adding recent sync panels and entry visibility.

Required UX additions:
- In RSS Source Manager table:
  - Add a per-source “Sync now” action
  - Display last fetched and last error (if available)
- Add a “Recent Research Sync” panel showing WEB/SOCIAL/JOURNAL/TREND:
  - last sync time
  - last error
  - count imported (if available)
  - buttons: “Sync Research Now” per kind
  - button: “View Entries” per kind

Constraints:
- Keep within the existing tab.
- No backend logic.

Backend hooks required (list only):
- Trigger RSS sync for a source
- Trigger research sync per kind
- Fetch entries list per kind

Stop after:
- Only these Sources & Research visibility surfaces.
```

---

## Copy: Step 7 of 9 — Settings: AI Model Router UI grouping

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 7 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/SettingsTab.tsx

Task:
Refactor Settings UI information architecture to make “AI Router” explicit.

Required grouping (within Settings tab):
- Section: AI Router
  - Task types list:
    - research_deep
    - research_fast
    - draft_longform
    - rewrite
    - seo
    - dedup_semantic
    - image_prompt
    - image_generate
  - For each task type: choose a default model profile
  - Show a small note: “Operational rules may override defaults”

Constraints:
- Do not add new tabs/routes.
- Do not reveal or store raw keys here.
- No backend logic.

Backend hooks required (list only):
- Fetch model profiles
- Persist task → model mappings

Stop after:
- Only AI Router grouping and UI.
```

---

## Copy: Step 8 of 9 — Settings: Key Vault + Pools UI

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 8 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/tabs/SettingsTab.tsx

Task:
Add a Key Vault management surface (still within Settings tab).

Requirements:
- Key Vault list shows:
  - Provider
  - Label
  - Pool assignment (Research/Drafting/Images)
  - Enabled toggle
  - Health indicators (last success, last error, last used)
- Add Key flow:
  - Open “Add Key” modal
  - Raw key is entered only on create/update
  - Raw key is never shown again (masked only)
- Pools are assignable per key.

Constraints:
- Do not leak raw keys in UI once saved.
- No backend logic.

Backend hooks required (list only):
- Create/update key (write-only raw key)
- List keys (masked)
- Enable/disable

Stop after:
- Only Key Vault UI + Add Key modal.
```

---

## Copy: Step 9 of 9 — Review modal: Provenance + Image controls

```
Context:
You are a SaaS frontend UI/UX engineer.

Flow position:
This is Step 9 of 9 in the News Engine Admin enhancement frontend flow.

Target file(s):
- src/components/news-engine/v6/modals/ReviewModal.tsx

Task:
Enhance the Review modal so Admin can trust provenance and manage images.

Provenance panel requirements:
- Show “Research used: RSS only / RSS + Web / Web only / Trend”
- List URLs used (RSS entry URLs + research URLs)
- Show model profile used per stage (label only)

Image controls (UI only):
- Show current OG image (if any)
- Add controls:
  - Generate AI image (disabled if not enabled)
  - Require approval before publish (toggle)
  - Override image URL (admin manual)

Constraints:
- Do not add new flows beyond what is listed.
- No backend logic.

Backend hooks required (list only):
- Fetch provenance fields for an item
- Trigger image generation
- Persist ogImageUrl + approval flag

Stop after:
- Only Review modal enhancements.
```
