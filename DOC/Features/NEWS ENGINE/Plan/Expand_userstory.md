# Feature Specification: News Engine Expansion (2026-01-14)

**Feature Branch**: `[news-engine-expansion-2026-01-14]`  
**Created**: 2026-01-14  
**Status**: Draft  
**Input**: Expansion plan `DOC/FEATURES/NEWS ENGINE/Plan/Expanding plan V2.md` grounded by baseline audit `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-post-phase13-audit-2026-01-13.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Rich Manual Editing + Formatting (Priority: P1)

As an admin editor, I can fully edit a post’s title/body/tags using a rich formatting editor so content is readable and publish-ready without manual HTML work.

**Why this priority**: The editor experience directly affects daily throughput and quality; it’s the primary expansion intent.

**Independent Test**: Create or open a draft item → edit body with headings/lists/links → save → reopen item and verify formatting is preserved → publish and verify public page renders as expected.

**Acceptance Scenarios**:
1. **Given** a draft news item exists, **When** an admin opens the editor and adds a heading and bullet list, **Then** the saved content persists and re-renders with the same formatting after reload.
2. **Given** an item has empty body content, **When** an admin opens the editor, **Then** the UI shows an explicit empty-state and allows editing/saving without errors.
3. **Given** an admin inserts a link, **When** they save, **Then** the link remains clickable in preview and on the public page after publish.

---

### User Story 2 — Review Modal Clarity (Only Real Features) (Priority: P2)

As an admin, I can trust that every section/action shown in the review/editor UI is actually functional and backed by real data, so there is no “static vs working” confusion.

**Why this priority**: Confusing “dead UI” causes operator mistakes and slows down editorial workflows.

**Independent Test**: Open the review/editor modal and verify every visible button/section either performs a working action or is explicitly labeled as unavailable with disabled controls.

**Acceptance Scenarios**:
1. **Given** a review/editor modal is open, **When** the admin sees a section, **Then** it is either wired to an API/data source or explicitly labeled “Planned / Not available yet” with disabled actions.
2. **Given** an admin uses any visible action button (save/publish/schedule/reject/regenerate/image actions), **When** the action is submitted, **Then** the UI shows deterministic loading/success/error states.

---

### User Story 3 — Image URL Reliability + Replacement (Priority: P2)

As an admin, I can see whether the OG image URL is valid, and I can re-check or replace it quickly if it’s broken.

**Why this priority**: Broken OG images reduce trust and harm share previews; reliability is an operator requirement.

**Independent Test**: Set an invalid image URL → observe “Broken” status → click re-check → replace URL or generate new image → status returns to “OK”.

**Acceptance Scenarios**:
1. **Given** a news item has an OG image URL, **When** the editor UI loads, **Then** the system displays a health status (OK/Broken/Unknown) with a last-checked timestamp if available.
2. **Given** an OG image URL is broken, **When** an admin clicks “Re-check”, **Then** the UI updates deterministically based on the server result and provides a clear recovery action.

---

### User Story 4 — Provenance/Research Summary Completeness (Priority: P2)

As an admin, I can see all research sources used to produce a draft (RSS + WEB + TREND + SOCIAL + JOURNAL), not just RSS.

**Why this priority**: Editorial trust and debugging depend on understanding where content came from.

**Independent Test**: Open an item created from research sync or RSS → verify provenance panel lists all source URLs and kinds.

**Acceptance Scenarios**:
1. **Given** an item was created from a research bundle, **When** an admin opens provenance, **Then** it lists the research sources (kind + url + title) used.
2. **Given** an item was created from RSS, **When** an admin opens provenance, **Then** it lists the RSS entry source url/title.

---

### User Story 5 — Research Jobs (Unified Research Center Jobs) (Priority: P3)

As an admin/operator, I can manage research as named jobs with schedules and run history so the research pipeline is transparent and operable.

**Why this priority**: Jobs improve operability but are not required to improve the editor UX immediately.

**Independent Test**: Create a research job → run now → verify results are stored and visible in the Unified Research Center with a run log.

**Acceptance Scenarios**:
1. **Given** the operator creates a research job, **When** they click “Run Now”, **Then** a job run is recorded with status + duration and results are ingested.

---

### Edge Cases

- What happens when rich editor content includes unsupported HTML tags or malformed markup?
- What happens when the image host blocks HEAD/GET requests or rate-limits checks?
- What happens when provenance data exists but source URLs are missing or invalid?
- What happens when an item is soft-deleted or rejected—does the editor still behave deterministically?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to edit title/body/tags with rich formatting (headings, lists, bold/italic, links).
- **FR-002**: System MUST persist formatted content and render it consistently after reload and on the public page after publish.
- **FR-003**: Review/editor UI MUST NOT show misleading non-functional sections; any unavailable features MUST be explicitly labeled and disabled.
- **FR-004**: System MUST provide OG image URL health status and provide operator recovery actions (re-check/replace/generate).
- **FR-005**: Provenance UI MUST display all relevant source kinds (RSS + WEB + TREND + SOCIAL + JOURNAL) when present.
- **FR-006**: Research jobs (if implemented) MUST support CRUD + run history + last success/error status.

### Key Entities *(include if feature involves data)*

- **NewsItem**: News article draft/published item; includes `contentHtml`, `ogImageUrl`, status fields.
- **Provenance**: Derived from RSS entries, research entries, and AI request logs.
- **Image Health** *(proposed)*: persisted fields on `NewsItem` describing last image check status.
- **Research Job** *(proposed)*: named operator-managed research workflow with schedules and run logs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create/edit/publish a richly formatted article end-to-end without editing raw HTML.
- **SC-002**: No visible “dead UI” remains in the review/editor surfaces; every visible action is functional or explicitly labeled unavailable.
- **SC-003**: OG image reliability is transparent: status is visible and broken images are recoverable via UI.
- **SC-004**: Provenance panel consistently shows the full set of research sources used by an item when available.
