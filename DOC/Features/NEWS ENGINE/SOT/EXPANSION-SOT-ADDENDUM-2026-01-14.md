# News Engine Expansion — SOT Addendum (2026-01-14)

**Status**: Draft

## Authority & Inputs

Baseline (current reality):
- `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-post-phase13-audit-2026-01-13.md`
- `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`

Expansion intent:
- `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`

Phase 1 unified plan (this expansion execution guide):
- `DOC/FEATURES/NEWS ENGINE/Plan/NEWS-ENGINE-EXPANSION-UNIFIED-PLAN-V3-2026-01-14.md`

Acceptance criteria (single source of truth):
- `DOC/FEATURES/NEWS ENGINE/Plan/Expand_userstory.md`

## Baseline Statement (Non-Negotiable)

- The News Engine is already **production-ready** post Phase 13.
- Expansion work MUST be additive and MUST NOT break:
  - public `/news` listing/detail
  - admin hub V6 wiring
  - automation runner
  - AI router + key vault
  - audit/provenance

## Expansion Scope (What We Are Enhancing)

1) **Rich manual editing + formatting**
- Admin editor experience must support headings/lists/bold/italic/links.

2) **Review/editor modal clarity**
- Only show sections that are fully functional.
- If a section isn’t implemented, it must be explicitly labeled as unavailable and disabled.

3) **Image URL reliability**
- Provide deterministic health checks, visible status, and recovery actions.

4) **Provenance completeness**
- Provenance must include research sources beyond RSS when present.

5) **(Optional / Later) Research jobs**
- Named jobs with schedules + run history (P3).

## Non-Goals (Explicit)

- Do not redesign the overall Admin Hub information architecture unless required by acceptance criteria.
- Do not remove working endpoints/UI flows.
- Do not introduce placeholder analytics or fake KPIs.

## UX Truthfulness Rules (“Working vs Placeholder”)

- No UI label may imply something is active if it is not.
- If a UI surface is not wired to backend data/actions, it must be:
  - hidden, OR
  - shown as “Planned / Not available yet” with disabled controls.

## Phase Gates (Must Follow)

- **Gate A (Phase 1 complete)**: Phase 1 plan + acceptance criteria exist and are referenced in `DOC/FEATURES/NEWS ENGINE/tasks.md`.
- **Gate B (Phase 2 complete)**: Prompt pack exists, step-locked, and references `Expand_userstory.md`.
- **Gate C (Phase 3 complete)**: Frontend implementation is audited using `comprehensive-feature-implementation-audit-prompt.md`; gaps fixed.
- **Gate D (Phase 4 complete)**: Backend plan + implementation audited with `feature-implementation-inventory-mapping-audit-prompt.md`; gaps fixed.
- **Gate E (Phase 5 complete)**: E2E scripts pass green.
- **Gate F (Phase 6 complete)**: Post-feature audit + updated docs are prepared in `POST FEATURE/`.

## How to Use This Addendum

- Treat this file as the expansion “scope lock”.
- Treat `Expand_userstory.md` as acceptance criteria SOT.
- Treat the unified plan as the implementation map (frontend ↔ backend).
- Update `DOC/FEATURES/NEWS ENGINE/tasks.md` before each phase begins.
