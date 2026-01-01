# [FEATURE NAME] — Frontend Plan (SOT Template)

## 0) Purpose
This document is the **Single Source of Truth** for building the **[FEATURE NAME] UI/UX** (admin/user/role as needed) as a **sequence-locked** set of **pages → modals → confirmations**, optimized for Google AI Studio or similar tools.

Goal: Any AI or human can start frontend development **without context loss**.

---

## 1) Strict Rules (Must Follow)
These rules are taken from: `[PATH TO PROMPTING GUIDELINE]`

- Do **not** build complex flows in one prompt.
- Break the feature into **pages first**, then **modals**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the [FEATURE NAME] frontend flow.`
- Every click must map to: **what opens next**, fields/options, confirm/cancel behavior, and where the user returns.
- Do not jump ahead. If a next step exists, describe it in words only.

---

## 2) Scope & Constraints
### In Scope
- [List all in-scope UI/UX areas for this feature]
- UI-only state handling: default, empty, loading placeholders, disabled actions

### Out of Scope (For This Plan)
- Backend logic, API design, automation, etc (unless required for UI context)
- Permission system implementation (only describe UX expectations)

---

## 3) Information Architecture (Routes / Pages)
Add a new top-level nav group or section as needed:

- [Main Nav Group]
  - [Page 1]
  - [Page 2]
  - ...

---

## 4) Core Domain Objects (UI-Level Only)
These are conceptual UI objects (no schema assumptions):

### 4.1 [Object Name]
Minimum fields to display in UI:
- [Field 1]
- [Field 2]
- ...

### 4.2 Statuses (User-Facing)
Status badge options:
- [Status 1]
- [Status 2]
- ...

---

## 5) E2E User Flow (Narrative)
This is the human-readable E2E path that every page/modal must support.

1) [Step 1]
2) [Step 2]
3) ...

---

## 6) Build Sequence (Pages First, Modals Later)
Total Steps: **[N]**

1. [Page 1]
2. [Page 2]
3. ...
[N]. [Modal/Confirmation]

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

**How to use this plan:**
- For each step, find the section titled `Copy: Step X of [N] — ...`.
- Copy the prompt block under that heading and paste it into Google AI Studio (or similar).
- After running each prompt, check the "Expected Outcome" section to verify the UI matches the plan before moving to the next step.
- Always proceed in order (Step 1, then Step 2, etc). Do not skip ahead.

---

## Copy: Step 1 of [N] — [Page/Modal Name]
### Purpose
[Short description of the page or modal]

### Layout
[Describe sections, fields, actions]

### Interaction Map
[Describe what each button/click does]

### States
- Default
- Loading
- Empty
- Disabled

### What to expect in the outcome
- [List the UI elements and behaviors you should see]
- No modals or backend logic unless specified.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of [N] in the [FEATURE NAME] frontend flow.

Task:
[Describe the UI to build for this step]

User interactions:
[Describe what triggers the next modal/page, but do not design it yet]

Constraints:
- No backend logic
- No modal implementations (unless this is a modal step)
- Do not design future pages/modals

Output:
- UI layout + component breakdown
- Explicit empty/loading states

Stop after:
- This page/modal only
```

---

## Copy: Step 2 of [N] — [Page/Modal Name]
### Purpose
[...]

### Layout
[...]

### Interaction Map
[...]

### States
[...]

### What to expect in the outcome
[...]

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of [N] in the [FEATURE NAME] frontend flow.

Task:
[...]

User interactions:
[...]

Constraints:
- No backend logic
- ...

Output:
- ...

Stop after:
- This page/modal only
```

---

[Repeat for all steps...]

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
[List any advanced/optional features for future phases]

---

# [END OF TEMPLATE]
