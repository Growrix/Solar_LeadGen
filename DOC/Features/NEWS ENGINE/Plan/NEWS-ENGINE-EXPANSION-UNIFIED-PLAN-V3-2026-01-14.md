# News Engine Expansion — Unified Frontend + Backend Plan (V3)

**Date**: 2026-01-14

**Inputs (must-read, source of truth)**
- Latest audit report (baseline reality): `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-post-phase13-audit-2026-01-13.md`
- Post-feature docs (operator/user guide): `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`
- Expansion intent (high-level): `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md`
- Planning instructions: `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/Expansion Instructions.md`

---

## 0) Current Baseline (What Exists Today)

Per the 2026-01-13 audit, News Engine is **production-ready** and fully wired end-to-end:
- Public `/news` listing + `/news/[slug]` detail are API-backed.
- Admin Hub V6 tabs/modals are wired to real APIs (no localStorage stubs).
- Automation runner, AI Router, Key Vault, audit logs, provenance, and OG image controls exist.

**Known minor gap (documented in audit)**
- Share modal is missing WhatsApp/Email share actions (non-blocking).

**Expansion goal (V2 plan)**
Enhance the *editorial experience* and *operator clarity* without regressing the working system:
- Better manual editing + rich formatting
- Review modal clarity (only show what is real)
- Image reliability + validation + replacement workflows
- Provenance/research summary completeness (not just RSS)
- (Future) Research jobs unification and scheduled health checks

---

## 1) Gap List (Expansion Plan V2 vs Baseline)

### 1.1 Manual Editing & Rich Formatting
**Baseline**: Admin can edit items; stored body is `contentHtml`.
**Gap**: “Rich formatting editor” and “auto-format generated content” are not specified as existing behavior.

### 1.2 Review Modal Clarity & Dead UI Removal
**Baseline**: Review/editor modal is wired; controls are functional.
**Gap**: Expansion requires a strict rule: **only show sections that are implemented** (or label them explicitly as pending).

### 1.3 AI Image + URL Reliability
**Baseline**: OG image generation + approval controls exist.
**Gap**: Expansion requires deterministic image URL health checks, visible status, and easy replacement flows.

### 1.4 Provenance Completeness
**Baseline**: Provenance exists; unified research ingestion exists.
**Gap**: Expansion requires the review surface to display **all relevant research sources** (RSS + WEB + TREND + SOCIAL + JOURNAL) consistently.

### 1.5 Unified Research Center “Jobs”
**Baseline**: Unified entries and research sync endpoints exist.
**Gap**: Expansion wants “named jobs” with schedules, run history, and last-success/last-error surfaces.

---

## 2) Frontend Expansion/Enhancement Plan (Phase 3 Target)

### FE-1: Rich Text Editing (Editor Upgrade)
**Primary surface**: Admin item editor / review modal.

**UX requirements**
- Support headings (H1/H2/H3), lists, bold/italic, links.
- Preserve current storage contract (initially) by outputting **HTML** into `contentHtml`.
- Add a **live preview** panel (optional toggle) matching public rendering.

**Implementation approach (safe, incremental)**
- Add a Rich Text Editor component (e.g., TipTap/ProseMirror style) that edits an HTML document.
- Provide a fallback “Raw HTML” view for power-users/debugging.

**States**
- Loading existing content
- Empty content (show helpful starter text)
- Validation error (e.g., invalid link)

### FE-2: Auto-format Generated Content
**Goal**: Make AI-generated content reader-friendly by default.

**Frontend-only first**
- Add a “Format” action that transforms current content into a normalized structure (headings, paragraph spacing, bullet list formatting).
- The formatting operation must be explicit (user-triggered) in Phase 3 to avoid surprise changes.

### FE-3: Review Modal Clarity + Tooltips
**Goal**: Remove confusion by aligning UI labels with reality.

**Rules**
- If a section does not have a corresponding API/data source today, it must be:
  - hidden, OR
  - shown as “Planned / Not available yet” (explicit label), with disabled actions.

**Deliverables**
- Add tooltips/help text to explain:
  - provenance
  - image approval
  - how auto-publish is gated by pipeline status + automation settings

### FE-4: Image Reliability UX
**Goal**: Make broken images obvious and recoverable.

**UI behaviors**
- Before rendering an OG image URL, validate it (see BE plan for server-side checks).
- Show status badge: OK / Broken / Unknown.
- Provide actions:
  - Re-check
  - Replace URL
  - Generate new image (existing)

### FE-5: Provenance Summary (All Sources)
**Goal**: Show sources from RSS and research kinds.

**UI requirements**
- “Sources used” panel lists each source with:
  - kind (RSS/WEB/TREND/SOCIAL/JOURNAL)
  - title
  - URL
  - timestamp
- Link out to the original source.

### FE-6 (Quick Win): Public Share Modal channels
- Add WhatsApp + Email share links.

---

## 3) Backend Expansion/Enhancement Plan (Phase 4 Target)

### BE-1: Content Format Support (Optional: Markdown/Structured)
**Decision point**
- Keep **HTML-only** (lowest risk), OR
- Add `contentMarkdown` (or structured JSON) alongside `contentHtml` for safer editing.

**Recommendation**
- Keep HTML contract for now; add `contentMarkdown` only if editor needs it.

### BE-2: Image URL Health Checks
**Additions**
- New endpoint: `POST /api/admin/news-engine/items/[id]/og-image/check` (admin)
  - validates that the current `ogImageUrl` is reachable and returns status.
- Persist status fields on `NewsItem` (proposed):
  - `ogImageLastCheckedAt`
  - `ogImageLastCheckStatus` (OK|BROKEN|UNKNOWN)
  - `ogImageLastCheckError` (optional)

### BE-3: Provenance Endpoint Enrichment
**Goal**: Ensure provenance endpoint returns merged sources across RSS + research entries.

- If current `/items/[id]/provenance` is incomplete, extend response to include:
  - RSS entry (when present)
  - research entries used (by kind)
  - AI request logs relevant to the item (taskType/intent, modelProfileId, apiKeyId)

### BE-4: Research Jobs (Unified Research Center jobs)
**Add**
- `NewsResearchJob` model (+ job runs table), with:
  - kind (WEB/TREND/SOCIAL/JOURNAL/RSS optional)
  - schedule config
  - lastRunStatus, lastRunAt, lastError
- Admin endpoints for CRUD + run-now + pause.

### BE-5: Daily Image Re-check Job
- Runner stage: once per day, verify published items’ OG image URLs.
- Auto-actions (policy decision):
  - only flag as broken + notify, OR
  - attempt replacement via provider/AI.

---

## 4) Mapping Table (Frontend ↔ Backend)

| Frontend surface | Change | Backend dependency |
|---|---|---|
| Admin item editor/review modal | Rich text editor outputting HTML | None (Phase 3), optional schema change (Phase 4) |
| Admin item editor/review modal | “Format content” action | None (Phase 3), optional server formatting (Phase 4) |
| Admin image controls | Show health status + re-check | BE-2 endpoint + fields |
| Admin provenance panel | Show all sources | BE-3 enrich provenance response |
| Public share modal | WhatsApp/Email actions | None |
| Unified Research Center | Research jobs UI (future) | BE-4 models/endpoints |

---

## 5) Implementation Checklist (high-level)

### Phase 1 (Docs)
- Produce acceptance criteria: `DOC/FEATURES/NEWS ENGINE/Plan/Expand_userstory.md`
- Produce SOT addendum for expansion scope (and phase gates)

### Phase 2 (Prompt pack)
- Create sequential prompts for pages/modals (step-locked)

### Phase 3 (Frontend)
- Implement editor upgrade + review modal clarity + image UX + provenance UI + share channels
- Run comprehensive feature audit (frontend focus) and fix gaps

### Phase 4 (Backend)
- Implement image health check endpoint + persistence
- Enrich provenance
- Add research jobs (if included in scope)
- Run inventory/mapping audit vs Phase 1 plan

### Phase 5 (E2E)
- Add scripts/tests for the expanded flows

### Phase 6 (Docs)
- Post-implementation audit + updated user guide/tooltips/map/checklist
