# AI News Engine — Frontend Enhancement Plan (SOT Template, V5 Fixes vs V4 Alignment)

## 0) Purpose
This document closes the remaining deviations found in the **Google AI Studio V5** prototype so the frontend is **100% aligned** with:
- `frontend-enhancement-plan-prototype-alignment-V4.md`

Audit reference:
- `prototype-audit-google-ai-studio-uiux-V5.md`

---

## 1) Strict Rules (Must Follow)
These rules are taken from:
- `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`

- Do **not** build complex flows in one prompt.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine frontend flow.`
- Every click must map to: what opens next, confirm/cancel behavior, and where the user returns.
- Do not redesign unrelated UI.

---

## 2) Scope & Constraints
### In Scope
- Review modal publish button disabled state when already Published.
- Quick Draft naming/semantics alignment.

### Out of Scope
- Backend/API design.
- Permissions.
- Any new pages.

---

## 3) E2E Goal (Definition)
The frontend is considered V4-aligned only when:
1) Publish Now is present AND correctly disabled for already-published items.
2) Publish confirmation still requires typed confirm (`PUBLISH`).
3) Public pages display `publishedAt` when available.
4) “Quick Draft” meaning matches behavior (rename OR true quick draft).

---

## 4) Build Sequence (Focused Fixes)
Total Steps: **2**

1. Review Modal — Disable Publish if already Published
2. Drafts Board — Align “Quick Draft” semantics (choose Option A)

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

## Copy: Step 1 of 2 — Review Modal: Disable Publish When Already Published
### Purpose
Match V4 requirement: if the item is already published, the publish action must not be actionable.

### Requirements
- If `item.status === Published`:
  - Disable the Publish button
  - Change label to `Already Published`
  - Keep icon, but visually show disabled state
  - (Optional) Add subtle helper text/tooltip explaining it’s already live

### Interaction Map
- If enabled: clicking Publish Now opens the Publish Confirmation modal.
- If disabled: clicking does nothing.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of 2 in the AI News Engine frontend flow.

Task:
Update the AI News Review modal footer so the Publish action is disabled when the news item is already Published.

Requirements:
- If status is Published, disable the button and change its label to "Already Published".
- If status is not Published, keep the label as "Publish Now" and keep current behavior.
- Do not change other footer actions.

Constraints:
- No backend logic
- Do not redesign the modal tabs or content

Output:
- Exact button enabled/disabled rules
- Exact label rules

Stop after:
- This modal change only
```

---

## Copy: Step 2 of 2 — Drafts Board: Rename “Quick Draft” → “Create Manual Draft” (Option A)
### Purpose
Match V4 Step 4: resolve ambiguity so the label matches the actual behavior.

### Decision (Choose ONE)
- Choose **Option A**: Rename “Quick Draft” to “Create Manual Draft” everywhere it opens the manual draft modal.

### Requirements
- In the Drafts board top-right CTA currently labeled “Quick Draft”, rename to:
  - `Create Manual Draft`
- Any secondary trigger (e.g., plus button in columns) should either:
  - Use the same label in tooltip/aria-label, OR
  - Remain icon-only but with accessibility label `Create Manual Draft`

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of 2 in the AI News Engine frontend flow.

Task:
Align the meaning of "Quick Draft" with actual behavior by renaming it.

Requirements:
- Rename the Drafts board CTA "Quick Draft" to "Create Manual Draft".
- Ensure any + icon trigger for the same action has an accessible label consistent with "Create Manual Draft".
- Do not create new pages or new modals.

Constraints:
- No backend logic
- Do not redesign the board layout

Output:
- Updated CTA label(s)
- Accessibility label(s)

Stop after:
- This change only
```

---

## 5) Deliverable Checklist (V5)
- Review modal publish action shows `Already Published` when applicable.
- Drafts board no longer uses “Quick Draft” for the manual draft modal.
- No change to typed publish confirmation behavior (`PUBLISH`).
- Public pages still show `publishedAt` when present.

---

# [END OF PLAN]

---

# Expansion Audit & Planning Phase (2026-01-12) — Frontend Addendum

**Purpose**
Translate the latest implementation audit into an actionable frontend expansion plan grounded in the real codebase (not the prototype).

**Primary audit input**
- `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-phase1-comprehensive-feature-implementation-audit-2026-01-12.md`

**Expansion blueprint**
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

## What Is Already Implemented (Keep)
- Admin hub + tabs + key modals are present and largely wired (Review, Schedule, image controls, research sync triggers).
- Research sync per kind (WEB/SOCIAL/JOURNAL/TREND) is API-backed and functional.
- OG image generation + approval gating is enforced on publish paths.

## Gaps / Missing / Operator-Confusing UI
1) Misleading “UI only” labeling
- Sources tab shows “Visibility surface (UI only)” while the section is actually wired.

2) Dashboard tab contains placeholder KPI values
- KPIs are hardcoded; pagination controls are static.

3) Drafts & Reviews “View Options” is a dead-end
- Button exists but has no action.

4) “More options” (ellipsis) buttons are present but not connected
- Appears interactive but has no deterministic outcome.

5) Automation Logic: Publish Windows v2 + Operational Rules are misleading/incomplete
- Publish Windows v2 builder exists, but runner scheduling uses a different schema.
- Operational rules UI is not connected to DB-backed `NewsAutomationRule` CRUD or runner enforcement.

## Locked Expansion Outcomes (Frontend)
### A) Reduce “static UI” confusion (trust-first)
- Remove/rename any “UI only” labels that are untrue.
- Add explicit “Not yet enforced” banners where the UI is intentionally a placeholder.

### B) Automation Logic alignment
- Ensure saving Publish Windows v2 results in an automation schedule that the runner actually uses.
- Ensure Operational Rules UI is either:
  - persisted via the existing rules endpoints and enforced by runner, OR
  - explicitly labeled as draft and not persisted.

### C) Run Automation Now: deterministic feedback
- When an admin runs automation (Dry/Live), show a run summary (counts, timing, errors) and store last-run state.

## Implementation Prompts (VS Code / Copilot oriented)

### Step 1 — Sources Tab: Remove misleading label
**Goal:** Remove operator confusion where API-backed UI is labeled “UI only”.

**Acceptance criteria:**
- The “Recent Research Sync” section no longer says “UI only”.
- The label (if any) accurately reflects reality (API-backed).

### Step 2 — Automation Logic: Persist runner-compatible schedule windows
**Goal:** Make Publish Windows v2 actually drive the internal runner.

**Acceptance criteria:**
- Saving Automation config results in a `windows: string[]` payload compatible with the runner schedule parser.
- Scheduling decisions are derived from saved config (no silent mismatch).

### Step 3 — Automation Logic: Clarify or wire Operational Rules
**Goal:** Stop “rules exist but do nothing” UX.

**Acceptance criteria (choose ONE):**
- Option A (preferred): Operational Rules UI reads/writes DB-backed `NewsAutomationRule` and is enforced by runner.
- Option B: Operational Rules UI is clearly labeled “Not enforced yet” and is not persisted.

### Step 4 — Dashboard: remove/label hardcoded KPIs
**Acceptance criteria:**
- Either replace with API-backed stats or clearly label as demo/placeholder.

---

**NOTE:** This addendum is implementation-grounded. It intentionally avoids prototype alignment language.

---

# Expansion Audit & Planning Phase (2026-01-13) — Frontend Addendum v2 (Post-Feature)

**Purpose**
Update the expansion UI plan using the post-feature audit so we only ship UI that is deterministic, truthful, and operationally useful.

**Primary current-state audit inputs**
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-FEATURE-AUDIT-2026-01-13.md`
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-13.md`

**Expansion blueprint**
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

## Additional Gaps / Static / Operator-Confusing UI (from 2026-01-13 audit)

1) Master Control “telemetry” and Safety Center are presentation-only
- The UI implies live system health, but the underlying values are placeholders.

2) Queue Snapshot counters show nulls
- RSS / Research NEW counts are displayed but not computed/returned.

3) Drafts & Reviews shows hardcoded avatars (U1/U2/U3)
- These chips read like real actor identity but are not derived from users.

4) Automation Logic config reload gap
- The UI persists config, but does not reliably re-hydrate persisted config on mount (operator confusion).

## Locked Expansion Outcomes (Frontend v2)

### A) Trust-first UX (truthful surfaces)
Acceptance criteria:
- No placeholder numbers are presented as real metrics.
- If a surface is intentionally UI-only, label it as such and link to the planned backend work.
- If a surface is backend-driven, label it as live and show last-updated timestamps.

### B) Runner feedback & visibility
Acceptance criteria:
- “Run Automation Now” shows a deterministic run summary (counts, duration, errors) and last-run metadata.
- Queue snapshot counters update from a real API response.

### C) Automation clarity (config is what runs)
Acceptance criteria:
- Persisted automation config is always reloaded on tab/page load.
- The UI explicitly shows which saved config version/timestamp is active.

### D) Research Center foundation (UI readiness)
Acceptance criteria:
- UI structure supports unified listing/search of RSS entries + research entries with consistent filters.
- Any missing endpoints are represented as TODO surfaces, not fake data.

## Implementation Prompts (New Steps)

### Step A — Master Control: replace fake telemetry with truthful status
**Goal:** Stop placeholder health values being interpreted as production metrics.

**Acceptance criteria:**
- Replace placeholder metrics with: pipeline status, last runner run status, last error (if any), and last updated.
- For any remaining placeholder card, include an explicit "Placeholder" label.

### Step B — Queue Snapshot: wire real counters
**Goal:** Show real RSS/Research queue counts.

**Acceptance criteria:**
- UI displays non-null counts from a backend endpoint.
- Loading/empty/error states are explicit.

### Step C — Drafts & Reviews: remove hardcoded actor avatars
**Goal:** Stop implying real user identity.

**Acceptance criteria:**
- Remove U1/U2/U3 chips or replace with real actor identity when available.
- If identity is not available, show "System" / "Unknown" with neutral styling.

### Step D — Automation Logic: guaranteed persisted config hydration
**Goal:** Prevent saved config vs displayed config mismatch.

**Acceptance criteria:**
- On mount, Automation Logic tab loads persisted config and renders it.
- A "Reset to Saved" action restores last persisted values.

