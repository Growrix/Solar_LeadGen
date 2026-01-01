# AI News Engine — Frontend Enhancement Plan (SOT Template, V5 Fixes vs V4 Alignment)

## 0) Purpose
This document closes the remaining deviations found in the **Google AI Studio V5** prototype so the frontend is **100% aligned** with:
- `frontend-enhancement-plan-prototype-alignment-V4.md`

Audit reference:
- `prototype-audit-google-ai-studio-uiux-V5.md`

---

## 1) Strict Rules (Must Follow)
These rules are taken from:
- `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

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
