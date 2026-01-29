# NEWS ENGINE — Google AI Studio Prototype Hardening (V7) — Prompt Pack

**Status**: Draft (Optional)

**Purpose**
This prompt pack is optional, but recommended if you want to reduce migration pain.

It hardens the existing Google AI Studio prototype by:
- Removing/avoiding hardcoded Tailwind palette usage (e.g., `bg-slate-*`, `text-gray-*`, `bg-white`, `text-black`, `dark:*`).
- Switching to **your repo’s semantic tokens** in className (even if the prototype preview won’t fully render them).
- Wiring all **missing UI endpoints** identified by the audit report:
  - Drafts board cards open Review modal
  - Control actions open Confirmation modal(s)
  - Audit logs open Prompt Details modal
  - Test & Preview actions update UI state
  - No-op toggles become real UI state

This is NOT a Next.js export. This is a “migration-friendly” UI reference.

---

## Authority / References

- Prompting SOP: `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- Prompt template: `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`
- Audit report: `DOC/FEATURES/NEWS ENGINE/Audit Reports/prototype-audit-google-ai-studio-uiux.md`
- Design tokens (do not violate): `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`

---

## Global Constraints (apply to every prompt)

1) **This is Step X of Y** (sequence-locked). Do not jump ahead.
2) **No new UX surfaces**. Do not add pages/modals/features not already in V6 + SOT.
3) **UI-only + wiring only** (state handlers + modal triggers). No backend.
4) **Theme semanticization**:
   - Do NOT use: `bg-slate-*`, `bg-gray-*`, `text-slate-*`, `text-gray-*`, `border-slate-*`, `border-gray-*`, `bg-white`, `text-black`, `dark:*`, `#hex`, `rgb()`, `rgba()`.
   - Use semantic tokens (examples): `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `shadow-neu-*`.
   - If a color is needed for status labels, use existing semantic/status tokens already defined in the app (do not invent new color classes).
   - If the prototype environment can’t render these tokens, that is acceptable: the goal is migration fidelity.
5) **Maintain E2E flow**: every click must do something deterministic (open modal, update state, or navigate view).

---

## V7 Build Sequence (Total Steps: 8)

1) Step 1 — Normalize global styling tokens (remove hardcoded palette)
2) Step 2 — Wire Drafts & Reviews card → Review modal
3) Step 3 — Wire Control global actions → Confirmation modal(s)
4) Step 4 — Wire Audit Logs prompt details → PromptDetails modal
5) Step 5 — Wire Test & Preview footer actions
6) Step 6 — Fix no-op toggles (Sources + Automation) to update state + show “saved” feedback
7) Step 7 — Settings surface alignment (minimal, match SOT intent; no extra settings)
8) Step 8 — Final E2E click-through verification checklist

---

# Copy/Paste Prompts (Google AI Studio)

## Copy: Step 1 of 8 — Normalize styling to semantic tokens
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer working inside an existing Neumorphic multi-theme design system.
Scope: UI only (no backend).

Flow position:
This is Step 1 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Update the prototype’s styling usage to be migration-friendly:
- Remove/avoid hardcoded Tailwind palette usage (bg-slate-*, text-gray-*, border-slate-*, bg-white, text-black, dark:*).
- Replace with semantic tokens used by our Next.js app:
  - bg-background (structural containers)
  - bg-surface (cards/modals/inputs)
  - text-foreground (primary)
  - text-muted-foreground (secondary)
  - border-border
  - shadow-neu-* (neumorphic shadows)

Constraints:
- Do not change layout or add new UI.
- Do not introduce any new colors or CSS variables.
- If the preview looks less colorful, that’s fine.

Output:
- Updated className strategy in the existing components.

Stop after:
- Only this token normalization pass.
```

---

## Copy: Step 2 of 8 — Drafts & Reviews card click opens Review modal
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI-only wiring.

Flow position:
This is Step 2 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Fix the critical missing UI endpoint:
- In Drafts & Reviews board/queue, clicking a news card MUST open the Review modal.

Required behavior:
- Card click sets the selected item.
- Review modal opens with that selected item.
- Closing the modal returns user to Drafts & Reviews without losing scroll position.

Constraints:
- No backend.
- Do not redesign the Drafts layout.
- Do not add new modals.

Output:
- The DraftsPage must be able to trigger the global ReviewModal open state.

Stop after:
- Drafts → Review modal wiring only.
```

---

## Copy: Step 3 of 8 — Control actions open confirmations
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI-only wiring.

Flow position:
This is Step 3 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Fix the missing UI endpoints in the Master Control page:
- Pause → opens Confirmation modal
- Resume → opens Confirmation modal
- Emergency Stop → opens Confirmation modal (stronger warning)

Required behavior:
- Confirmation modal must show a clear title, warning text, and Cancel/Confirm actions.
- Confirm updates UI state (e.g., pipeline status label) immediately.

Constraints:
- No backend.
- No new pages.

Stop after:
- Control actions → confirmations wiring only.
```

---

## Copy: Step 4 of 8 — Audit Logs prompt details opens PromptDetails modal
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI-only wiring.

Flow position:
This is Step 4 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Fix the missing endpoint in Audit Logs:
- If a log row has prompt context (promptUsed), clicking the prompt icon/button MUST open PromptDetails modal.

PromptDetails modal requirements:
- Read-only content area showing the prompt text.
- Copy-to-clipboard action.
- Close returns to the logs table.

Constraints:
- No backend.
- No redesign of the logs table.

Stop after:
- Logs → PromptDetails modal wiring only.
```

---

## Copy: Step 5 of 8 — Test & Preview footer actions
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI-only wiring.

Flow position:
This is Step 5 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Wire the missing behaviors in the Test & Preview modal:
- After testState becomes completed:
  - “Save to Drafts” must create a new Draft (UI state) and route user to Drafts & Reviews (or open Review modal for the new draft).
  - “Simulate Publish” must update a UI-only Published status and optionally route user to Public Listing view to verify.

Constraints:
- No backend.
- Preserve existing modal layout.

Stop after:
- Test & Preview footer action wiring only.
```

---

## Copy: Step 6 of 8 — Fix no-op toggles + show saved feedback
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI-only state wiring.

Flow position:
This is Step 6 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Replace no-op toggles (onChange={() => {}}) with real local UI state updates for:
- Sources & Research toggles
- Automation toggles

Also add minimal saved feedback:
- A small “Saving…” then “Saved” indicator (UI-only) after changes.

Constraints:
- No backend.
- No new design elements beyond minimal feedback.

Stop after:
- Toggle wiring + saved feedback only.
```

---

## Copy: Step 7 of 8 — Settings alignment (minimal)
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 7 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Align the Settings surface to the News Engine intent (minimal):
- Region/locale (if present)
- Limits (if present)
- Deduplication toggle (if present)

Constraints:
- Do not add unrelated profile/account settings.
- No backend.

Stop after:
- Settings UI alignment only.
```

---

## Copy: Step 8 of 8 — Final E2E click-through checklist
### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend QA engineer verifying UI-only E2E flow.

Flow position:
This is Step 8 of 8 in the NEWS ENGINE prototype hardening flow.

Task:
Produce a click-through verification checklist for the prototype confirming:
- Dashboard → Review modal works
- Drafts board card click → Review modal works
- Review modal actions (schedule/rewrite/reject) open the correct modals
- Control actions (pause/resume/emergency) open confirmations and update visible state
- Audit logs prompt details opens PromptDetails modal
- Test & Preview Save to Drafts creates a draft and is visible in Drafts
- Public listing shows only Published items
- Share modal copies link

Constraints:
- No new features.

Stop after:
- Checklist only.
```
