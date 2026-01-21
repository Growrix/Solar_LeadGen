# News Engine Expansion — Phase 14 / Phase 3 Frontend Audit (2026-01-14)

## Scope
Frontend-only audit of Phase 14 expansion items (rich editing + review modal clarity + image UX + provenance actions + share improvements).

**SOT / Requirements**
- Acceptance criteria: `DOC/FEATURES/NEWS ENGINE/Plan/Expand_userstory.md`
- Unified plan (V3): `DOC/FEATURES/NEWS ENGINE/Plan/NEWS-ENGINE-EXPANSION-UNIFIED-PLAN-V3-2026-01-14.md`
- Expansion SOT addendum: `DOC/FEATURES/NEWS ENGINE/SOT/EXPANSION-SOT-ADDENDUM-2026-01-14.md`

**Surfaces reviewed**
- Admin review/editor modal: `src/components/news-engine/v6/modals/ReviewModal.tsx`
- Rich editor component: `src/components/news-engine/v6/components/RichHtmlEditor.tsx`
- Public share modal: `src/app/news/[slug]/page.tsx`

**Build gates (local)**
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS (existing ESLint warnings in unrelated file only)

---

## 1) Page & Modal Audit (Frontend)

### Review/Editor Modal (Admin)
**Findings (implemented)**
- Rich editing replaces textarea with a TipTap-based editor that outputs HTML to `contentHtml`.
- Formatting controls present: H1/H2/H3, bullet list, numbered list, bold, italic, link.
- Preview toggle renders HTML (`dangerouslySetInnerHTML`) matching public rendering expectations.
- “Raw HTML” advanced toggle available.
- “Format” button performs conservative normalization (removes empty paragraphs + duplicate `<br>` chains).
- Deterministic Save persists:
  - `title`
  - `contentHtml`
  - `tags[]` (comma-separated input)
  - `seoTitle`, `seoDescription`
  - image controls persisted via existing image-controls endpoint
- Provenance panel provides:
  - “Copy sources” (clipboard)
  - “Open all” (guarded confirm, tab opening capped)
  - truthful label that Phase 4 is required for enriched provenance rows
- “Compliance & Quality” section is explicitly labeled **Planned / Not available yet** (no dead UI).
- OG image reliability:
  - health badge `OK/BROKEN/UNKNOWN`
  - client-only “Re-check” action
  - explicit tooltip that server check is planned in Phase 4

**Gaps / Deviations vs SOT**
- US3 acceptance expects “Re-check” to reflect **server result**; current implementation is **client-only image load test**.
  - Status: acceptable for Phase 3 if explicitly labeled (it is), but still a gap vs the final acceptance target.
- US4 acceptance expects provenance rows to include kind/title/timestamps when present; current UI is URL-only with “Details pending Phase 4”.
  - Status: expected Phase 3 limitation; must be completed in Phase 4.

### Public News Detail Share Modal
**Findings (implemented)**
- Share modal includes WhatsApp + Email.
- Email `mailto:` body contains both title and URL.

---

## 2) API Endpoint Audit
Phase 3 is frontend-only; no new endpoints were added in this phase.

**Frontend wiring checks**
- Save uses `adminUpdateItem(...)` and `adminUpdateItemImageControls(...)`.
- Provenance pulls `adminFetchItemProvenance(...)`.
- Image controls pull `adminFetchItemImageControls(...)`.

---

## 3) Backend Logic & Service Audit
Out of scope for Phase 3. (Phase 4 owns server-side image health + enriched provenance.)

---

## 4) Database & Prisma Model Audit
Out of scope for Phase 3.

---

## 5) E2E Functional Audit
Automated E2E was not run for Phase 3 (not requested in this cycle).

**Manual verification recommended**
- Open admin News Engine → open Review modal → edit title/body/tags → save → close/reopen and confirm persistence.
- Insert a link, preview, publish, and confirm public `/news/[slug]` renders HTML.

---

## 6) Internal Wiring & Integration Audit
**Wired and deterministic**
- Editor state → HTML → persisted via admin update.
- Image override + approval toggles → persisted via image-controls endpoint.
- Provenance panel pulls from provenance endpoint and provides deterministic copy/open actions.

**Backend-dependent (truthfully labeled)**
- Server-backed OG image health check.
- Enriched provenance rows (kind/title/timestamp) and “all research kinds” completeness.

---

## Static/Unused/Non-Functional UI Elements
None found in the audited Phase 3 expansion surfaces.

Notes:
- Some actions (server image check, enriched provenance) are intentionally deferred and are explicitly labeled as planned/unavailable rather than presented as working.

---

## Summary Table
| Scope | Missing | Incomplete | Non-functional | Notes |
| --- | --- | --- | --- | --- |
| Frontend (Review modal/editor) | 0 | 2 | 0 | Server image health + enriched provenance are Phase 4 |
| Public share modal | 0 | 0 | 0 | WhatsApp + Email present |
| API | 0 | 0 | 0 | Phase 3 added no new endpoints |
| Backend | — | — | — | Phase 4 scope |
| DB | — | — | — | Phase 4 scope |

---

## Recommendations / Next Steps
1. Phase 4: implement server-backed OG image health check endpoint + persist last-check metadata.
2. Phase 4: expand provenance endpoint response to include kind/title/timestamps and full research kinds; update UI from URL-only to enriched rows.
3. Phase 3 follow-up: after any final polish, run the comprehensive audit loop again if Phase 4 changes touch frontend.
