# Feature Specification: News Engine — Phase 17 (OG Image & Model Access Remediation)

**Feature Branch**: `[news-engine-phase17-og-image-model-access]`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Fix OG image generation/fetching + approval blocking issues; ensure OpenAI models (text + image) are usable and validated."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable OG image generation with safe fallback (Priority: P1)

As an admin operator reviewing a NewsItem, I can generate an OG image via OpenAI (when available) and, if not available, the system falls back to a supported image approach so the workflow does not block publishing.

**Why this priority**: OG images are blocking publish and breaking the public/news experience.

**Independent Test**: Can be fully tested by opening a NEEDS_REVIEW/DRAFT_READY item, clicking **Generate OG Image**, seeing a preview, approving it, and publishing.

**Acceptance Scenarios**:

1. **Given** `OPENAI_API_KEY` is configured and the requested image model is accessible, **When** I click Generate OG Image, **Then** an image is generated and previewed and the item stores a stable `ogImageUrl`.
2. **Given** `OPENAI_API_KEY` is configured but the requested image model is not accessible (authorization/model not found), **When** I click Generate OG Image, **Then** the system falls back to a supported strategy (alternate allowed image model or free-source image flow) and shows an actionable message explaining what happened.
3. **Given** no OpenAI key is configured, **When** I click Generate OG Image, **Then** I see a clear actionable error (what env var is missing) and no silent failure occurs.

---

### User Story 2 - Free-source image URL suggestions are relevant and valid (Priority: P1)

As an admin operator, when the system uses free sources (e.g. Unsplash or similar), it returns an image URL that is relevant to the article and can be ingested reliably.

**Why this priority**: Operators currently get broken/irrelevant URLs, which blocks approval/publish.

**Independent Test**: Can be tested by requesting a free-source image for an item, verifying the preview loads, saving/ingesting, approving, then publishing.

**Acceptance Scenarios**:

1. **Given** an item has a title/summary, **When** the system fetches a free-source image, **Then** the URL resolves to a real image (direct `image/*` OR resolvable `og:image`) and the preview loads.
2. **Given** a URL is returned but is broken/unresolvable, **When** the system attempts to ingest, **Then** the UI shows a specific reason and does not persist a broken `ogImageUrl`.

---

### User Story 3 - OG preview works immediately (auto-ingest initial image URL) (Priority: P1)

As an admin operator, I see an OG preview as soon as the system has an initial OG image URL; I should not have to click “Save to S3” to make preview work.

**Why this priority**: The current flow is confusing and causes operators to think the system is broken.

**Independent Test**: Can be tested by opening the Review modal; if the item has an initial OG image URL, it should auto-ingest and preview immediately.

**Acceptance Scenarios**:

1. **Given** an item has an initial `ogImageUrl` set (generated or fetched), **When** I open the Review modal, **Then** the system auto-ingests it into stable storage and preview loads without manual action.
2. **Given** I paste an override URL, **When** I click Save to S3, **Then** the override still works and replaces `ogImageUrl` with the ingested version.

---

### User Story 4 - Approval must not block if preview is valid (Priority: P1)

As an admin operator, if a valid image preview is shown, approving the image must succeed and must not block publish.

**Why this priority**: This is actively blocking publishing.

**Independent Test**: Can be tested by making the preview visible, clicking Approve Image, and then publishing successfully.

**Acceptance Scenarios**:

1. **Given** the preview is visible and the stored (or ingested) image URL is valid, **When** I click Approve Image, **Then** approval succeeds and persists without an “invalid URL” error.
2. **Given** ingest changes the final URL (e.g., from a page URL to a resolved image URL), **When** I approve, **Then** the approved record corresponds to the final ingested URL.
3. **Given** there is truly no valid image (preview not visible / ingest failed), **When** I click Approve, **Then** the UI blocks approval with an actionable error.

---

### User Story 5 - Model enablement is safe and validated (Priority: P2)

As an admin/operator, I can configure which OpenAI models are used for text and images, but the server validates model IDs for each task type to prevent broken production behavior.

**Why this priority**: Misconfigured models are a recurring failure mode; validation prevents outages.

**Independent Test**: Can be tested by selecting/configuring models, running generation for each task type, and observing validated outcomes.

**Acceptance Scenarios**:

1. **Given** a supported model is configured for a task type, **When** the task runs, **Then** it succeeds and logs the model used.
2. **Given** an unsupported model is configured for an image task, **When** the task runs, **Then** the server rejects it (or falls back) with a clear message.

---

### Edge Cases

- What happens when a user pastes a URL that is an HTML page (Unsplash photo page) instead of a direct image URL?
- How does the system handle an `og:image` meta tag that is relative and must be resolved?
- What happens when S3 is configured but the bucket is private (no public read)?
- How does the system behave if the image is larger than the ingest size limit?
- What happens when `OPENAI_API_KEY` is present but invalid/revoked?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate an OG image via OpenAI when configured and supported.
- **FR-002**: System MUST fall back predictably when an OpenAI image model is unavailable (authorization/not found), with actionable operator feedback.
- **FR-003**: System MUST ensure free-source image URLs are valid (direct image or resolvable via `og:image`/`twitter:image`) before persisting.
- **FR-004**: System MUST auto-ingest the initial OG image URL into stable storage so preview is available without manual “Save to S3”.
- **FR-005**: System MUST NOT block approval/publish when a valid preview exists; approval must map to the final persisted image URL.
- **FR-006**: System MUST validate model IDs per task type (text vs image) and reject unsupported combos with clear errors.
- **FR-007**: System MUST NOT use test/dummy keys in real UI paths; env `OPENAI_API_KEY` MUST be used by default when present.

### Key Entities *(include if feature involves data)*

- **NewsItem**: Stores `ogImageUrl`, approval fields, tags/title/content.
- **NewsAiRequestLog**: Captures provider/model/task type and error output for traceability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operators can generate/fetch → preview → approve → publish an OG image successfully for a published item in one Review session.
- **SC-002**: Approval no longer fails with “Image URL is invalid” when preview is visible.
- **SC-003**: Public `/news` and `/news/[slug]` render the published OG image reliably within one refresh after publish.
- **SC-004**: Misconfigured/unsupported model IDs produce clear validation errors (or documented fallback) without crashing the request.
