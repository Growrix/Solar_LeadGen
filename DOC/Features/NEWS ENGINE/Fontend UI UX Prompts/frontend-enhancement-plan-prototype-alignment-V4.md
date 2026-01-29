# AI News Engine — Frontend Enhancement Plan (SOT Template, V4 Alignment)

## 0) Purpose
This document closes the remaining gaps found in the **Google AI Studio V4** prototype so the frontend is **truly E2E-ready** (Admin → Publish → Public) for backend planning.

This plan is a continuation of:
- `frontend-enhancement-plan-prototype-alignment-V3.md`

Audit reference:
- `prototype-audit-google-ai-studio-uiux-V4.md`

---

## 1) Strict Rules (Must Follow)
These rules are taken from:
- `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

- Do **not** build complex flows in one prompt.
- Break the feature into **pages first**, then **modals**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine frontend flow.`
- Every click must map to: **what opens next**, fields/options, confirm/cancel behavior, and where the user returns.
- Do not jump ahead. If a next step exists, describe it in words only.

---

## 2) Scope & Constraints
### In Scope
- Add a standard admin **Publish** path from the Review flow.
- Ensure “Published” becomes the single contract for Public visibility.
- UI-level `publishedAt` contract (no backend assumptions).
- Align “Quick Draft” label/intent with actual behavior.

### Out of Scope
- Backend/API design.
- Permissions system.
- Automation engine implementation.

---

## 3) E2E Goal (Definition)
The frontend is considered E2E-ready only when:
1) Admin can publish from the normal review flow.
2) Published items appear in Public view immediately (shared state UI).
3) Public pages show a publish date contract (`publishedAt`).

---

## 4) Build Sequence (Focused Enhancements)
Total Steps: **4**

1. Review Modal → Add “Publish Now” action
2. Publish Confirmation Modal (typed confirm)
3. PublishedAt UI contract + Public pages display
4. Quick Draft semantics alignment

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

## Copy: Step 1 of 4 — Review Modal → Add “Publish Now” Action
### Purpose
Allow admin to publish an item directly from the standard review flow.

### Layout
In the Review modal footer actions area:
- Add primary action: **Publish Now**
- Keep existing actions: Reject, Request Rewrite, Save as Draft, Approve for Scheduling

### Interaction Map
- Clicking **Publish Now** opens **Publish Confirmation** modal (Step 2).
- Confirming publish:
  - Sets status to `Published`
  - Sets `publishedAt` to “now” (UI-only)
  - Adds an audit log entry: `Published`
  - Closes confirmation, then closes review modal

### States
- Default: enabled when item is eligible.
- Disabled: if status already `Published`, disable and show label `Already Published`.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of 4 in the AI News Engine frontend flow.

Task:
Update the AI News Review modal to include a new action “Publish Now” in the footer.
It must not publish immediately; it must open a confirmation modal.

User interactions:
- Clicking “Publish Now” opens a Publish Confirmation modal (do not design the confirmation modal yet).
- Existing actions remain unchanged.

Constraints:
- No backend logic
- Do not redesign unrelated modal sections

Output:
- Exact footer button layout
- Enabled/disabled rules

Stop after:
- This modal change only
```

---

## Copy: Step 2 of 4 — Publish Confirmation Modal (Typed Confirm)
### Purpose
Make publishing deterministic and hard to mis-click.

### Layout
Confirmation modal:
- Title: “Publish to Public Feed?”
- Message: explains this becomes visible in Public view immediately.
- Confirm button: “Publish Now”
- Require typed confirm text: `PUBLISH`

### Interaction Map
- Confirm triggers publish mutation (UI-only) and closes.
- Cancel closes with no changes.

### States
- Confirm disabled until typed text matches.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of 4 in the AI News Engine frontend flow.

Task:
Design or update the Publish confirmation modal.
The user must type “PUBLISH” to enable the confirm action.

User interactions:
- Confirm sets status to Published, sets publishedAt to now, logs “Published”, and closes both confirmation + review modals.
- Cancel closes confirmation only.

Constraints:
- No backend logic
- Deterministic confirm/cancel

Output:
- Modal layout
- Disabled rules

Stop after:
- This modal only
```

---

## Copy: Step 3 of 4 — `publishedAt` UI Contract + Public Date Display
### Purpose
Ensure Public pages display the correct “publish date” concept.

### Requirements
- Add a UI-level field `publishedAt` to the News Item shape.
- Public listing and details should display `publishedAt` when present; otherwise fall back to existing date field.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 3 of 4 in the AI News Engine frontend flow.

Task:
Add a UI-level publishedAt field to the news item type and update the public listing/details to display publishedAt as the publish date when available.

User interactions:
- No new navigation; only display contract changes.

Constraints:
- No backend logic
- Do not expose admin-only fields

Output:
- Updated UI contracts
- Where the date is rendered in public listing and details

Stop after:
- Public date display only
```

---

## Copy: Step 4 of 4 — Quick Draft Semantics Alignment
### Purpose
Remove ambiguity between “Create Manual Draft” and “Quick Draft”.

### Options (Choose One; do not do both)
A) Rename “Quick Draft” to “Create Manual Draft” (since it opens the same modal)
OR
B) Implement true “Quick Draft” as a lighter-weight action that opens a minimal modal (prompt-only) and immediately creates a Needs Review draft.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 4 of 4 in the AI News Engine frontend flow.

Task:
Align the meaning of “Quick Draft” with actual behavior.
Choose ONE:
A) Rename it to match the existing manual draft modal.
OR
B) Make Quick Draft a lighter-weight flow (prompt-only) that creates a Needs Review draft.

Constraints:
- Do not redesign unrelated pages
- Do not add new pages

Output:
- Updated labels and/or minimal modal UX

Stop after:
- This change only
```

---

## 5) Deliverable Checklist (V4)
- Admin can publish from standard review flow.
- Published items show immediately in Public view.
- Public UI shows `publishedAt` as the date contract.
- Quick Draft label/intent matches behavior.

---

# [END OF PLAN]
