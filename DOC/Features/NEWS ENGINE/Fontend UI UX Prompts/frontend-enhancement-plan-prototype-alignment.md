# AI News Engine — Frontend Enhancement Plan (Prototype Alignment)

## 0) Purpose
This document is a **sequence-locked enhancement plan** to align the Google AI Studio exported prototype with the SOT plans:
- `frontend-plan-admin.md`
- `frontend-plan-public.md`

Scope: **UI-only wiring and deterministic transitions** (no backend).

---

## 1) Strict Rules (Must Follow)
These rules are taken from: `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

- Do **not** implement multiple complex flows in one prompt.
- Prefer **wiring pages first**, then **modals/drawers**, then confirmations.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine prototype alignment flow.`
- Every click must map to **what opens next** and how the UI returns.
- No undefined transitions.

---

## 2) Scope & Constraints
### In Scope
- Wire missing UI endpoints to match the SOT flow
- Local UI state updates (optimistic, UI-only)
- Minimal “saved/updated” feedback states

### Out of Scope
- Real API calls / persistence
- Auth/roles
- Data modeling beyond UI mocks

---

## 3) Build Sequence
Total Steps: **8**

1. Drafts & Reviews → open Review modal (critical)
2. Automation Control → confirmations (pause/resume/emergency)
3. Audit Logs → prompt details drawer/modal
4. Test & Preview → “Save to Drafts” and “Simulate Publish” wiring
5. Sources toggles → remove no-op interactions + saved feedback
6. Automation page → remove no-op toggle + saved feedback
7. Settings → add/align minimal News Engine settings block
8. Public Share modal → ensure minimal “copy link” intent alignment (optional)

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

---

## Copy: Step 1 of 8 — Drafts & Reviews card opens Review modal
### Purpose
Restore the core SOT pathway: **Drafts board card click → AI News Draft View modal**.

### Requirements
- Clicking any DraftCard opens the existing `ReviewModal`.
- The modal receives the clicked `NewsItem`.
- Closing returns to the Drafts board without losing scroll.

### Interaction Map
- DraftCard click → `selectedNewsItem = item` → `isReviewModalOpen = true`.

### States
- If item is missing: disable click.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer working in a React + TypeScript Vite prototype.
Scope: UI only.

Flow position:
This is Step 1 of 8 in the AI News Engine prototype alignment flow.

Task:
Wire the Drafts & Reviews board so that clicking any draft card opens the existing Review modal.

User interactions:
- Clicking a card sets the selected item and opens ReviewModal.
- Closing ReviewModal returns to the Drafts board.

Constraints:
- UI only (no backend)
- Do not redesign the modal
- Avoid undefined transitions

Output:
- Describe the state flow and where props/state should live
- Minimal code changes (lift state or pass callbacks)

Stop after:
- Drafts → Review modal wiring only
```

---Done

## Copy: Step 2 of 8 — Automation Control confirmations (Pause/Resume/Emergency)
### Purpose
Align with SOT Step 14: global actions require confirmations.

### Requirements
- “Pause Pipeline” opens a warning confirmation.
- “Resume All” opens a confirmation (or a lighter confirm) before resuming.
- “Emergency Stop” opens a destructive confirmation.

### Interaction Map
- ControlPage button click → open ConfirmationModal with correct copy/variant → confirm updates UI-only system state.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 2 of 8 in the AI News Engine prototype alignment flow.

Task:
Wire the Automation Control global actions so each one triggers the correct confirmation modal, then updates UI-only state.

User interactions:
- Pause Pipeline -> open confirmation (warning). Confirm sets system paused.
- Resume All -> open confirmation. Confirm clears paused.
- Emergency Stop -> open confirmation (destructive). Confirm sets emergency state.

Constraints:
- One modal = one intent
- UI only
- Do not introduce new pages

Output:
- State model (paused/emergency/nominal)
- Modal copy and transitions

Stop after:
- Control page confirmations wiring only
```

---Done

## Copy: Step 3 of 8 — Audit Logs “View Prompt Details” endpoint
### Purpose
Provide the missing endpoint for viewing prompt text in logs.

### Requirements
- If a log row has `promptUsed`, clicking the icon opens a small modal/drawer.
- The drawer shows prompt text (read-only) and a Copy button.
- Close returns to logs.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 3 of 8 in the AI News Engine prototype alignment flow.

Task:
Add a minimal Prompt Details modal/drawer opened from the Audit Logs table.

User interactions:
- Click "View Prompt Details" icon -> open prompt details UI.
- Copy button copies prompt text.
- Close returns to Audit Logs.

Constraints:
- One modal = one intent
- UI only
- Do not redesign Audit Logs page

Output:
- Modal/drawer layout and state wiring

Stop after:
- Prompt details endpoint only
```

---Done

## Copy: Step 4 of 8 — Test & Preview: wire “Save to Drafts” and “Simulate Publish”
### Purpose
Ensure Test & Preview has deterministic end states.

### Requirements
- When test is completed:
  - “Save to Drafts” adds a new draft item to UI state and routes user to Drafts (or opens Review).
  - “Simulate Publish” opens a confirmation, then updates UI-only status to Published.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 4 of 8 in the AI News Engine prototype alignment flow.

Task:
Wire the footer actions in the Test & Preview modal.

User interactions:
- Save to Drafts -> persist test output in UI state (no backend) and route user to Drafts OR open ReviewModal.
- Simulate Publish -> open confirmation and then set UI-only published state.

Constraints:
- UI only
- Avoid undefined transitions
- Do not redesign the modal

Output:
- Proposed minimal state changes and transitions

Stop after:
- TestPreview actions wiring only
```

---Done

## Copy: Step 5 of 8 — Sources: replace no-op toggles with UI state
### Purpose
Remove misleading UI controls that do nothing.

### Requirements
- RSS source Active/Inactive toggle updates `sources[]` status in UI.
- Research toggles update UI state.
- Save Configuration shows a non-invasive “Saved” feedback state.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 5 of 8 in the AI News Engine prototype alignment flow.

Task:
Replace no-op toggles on the Sources & Research page with real UI-only state updates and minimal saved feedback.

Constraints:
- UI only
- No backend
- Do not add new pages

Output:
- State wiring and feedback behavior

Stop after:
- Sources page toggle wiring only
```

---Done

## Copy: Step 6 of 8 — Automation: remove no-op toggle and add save feedback
### Purpose
Make automation rules deterministic.

### Requirements
- Restricted auto-publish toggle must be disabled with clear UI state (no-op removed).
- Save Configuration shows saved feedback.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 6 of 8 in the AI News Engine prototype alignment flow.

Task:
Make the Automation (Rules & Logic) page deterministic by removing no-op toggle behavior and adding minimal save feedback.

Constraints:
- UI only
- No backend
- Do not invent new automation features

Output:
- Toggle behavior and save feedback state

Stop after:
- Automation page wiring only
```

---Done

## Copy: Step 7 of 8 — Settings: align to minimal News Engine settings
### Purpose
Match SOT Step 7 expectations.

### Requirements
Add a clear “News Engine Settings” block with UI-only fields:
- Geographic focus
- Max daily drafts
- Deduplication toggle
- Draft expiry / retention

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 7 of 8 in the AI News Engine prototype alignment flow.

Task:
Add/align a minimal "News Engine Settings" section in the Settings page matching the SOT requirements.

Constraints:
- UI only
- No backend
- Keep it minimal

Output:
- Section layout and states

Stop after:
- Settings enhancement only
```

---Done

## Copy: Step 8 of 8 — Public Share modal: keep single intent (optional alignment)
### Purpose
Ensure public Share behavior matches SOT Step 4 “copy link” intent.

### Requirements
- Must support copy link success feedback.
- Any extra social buttons are optional; if kept, they must not distract from copy-link.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend engineer.
Scope: UI only.

Flow position:
This is Step 8 of 8 in the AI News Engine prototype alignment flow.

Task:
Ensure the public Share modal follows the "one modal = one intent" rule with a primary copy-link flow and success feedback.

Constraints:
- UI only
- Keep it minimal

Output:
- Modal intent alignment notes

Stop after:
- Share modal alignment only
```

---

## 4) Deliverable Checklist (Alignment)
- Drafts board opens Review modal deterministically.
- Control actions require confirmations.
- Audit logs prompt details opens and can copy prompt.
- Test & Preview footer actions do something deterministic.
- No-op toggles removed (or disabled intentionally) with clear feedback.
- Settings contains minimal News Engine settings.
