# Feature Specification: News Engine Expansion V2 (2026)

**Feature Branch**: `[news-engine-v2-expansion]`  
**Created**: 2026-01-14  
**Status**: Draft  
**Input**: User description: "See Expanding plan V2 and Visual Findings & Fixes section. Goal: Build a robust, user-friendly, white-label-ready News Engine with full manual editing, reliable review modal, research hub, and automation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Editing & Rich Content (Priority: P1)

Admins can fully edit any post (title, body, tags) with a rich text editor supporting headings, lists, bold, italics, and links. Generated content is auto-formatted for readability.

**Why this priority**: Manual control and readable formatting are essential for quality and trust in published news.

**Independent Test**: Can be fully tested by creating/editing a post, applying formatting, and verifying the output in both editor and published view.

**Acceptance Scenarios**:
1. **Given** a draft post, **When** the admin edits the title/body/tags and applies formatting, **Then** the changes are saved and rendered as expected.
2. **Given** an AI-generated draft, **When** the admin reviews the content, **Then** the text is auto-formatted (headings, lists, etc.) for readability.

---

### User Story 2 - Review Modal: Clarity & Functionality (Priority: P1)

The review modal only shows features that are fully working and wired to the backend. Non-functional UI (SEO, readability, plagiarism) is either implemented or removed. All sections are clearly labeled with tooltips/help.

**Why this priority**: Prevents user confusion and ensures a trustworthy, operator-friendly workflow.

**Independent Test**: Can be tested by opening the review modal for any post and verifying that all visible features work as described, and no dead UI is present.

**Acceptance Scenarios**:
1. **Given** a post in review, **When** the modal is opened, **Then** only working features are shown, and all actions/data are live.
2. **Given** a non-implemented feature, **When** the modal is opened, **Then** it is not visible to the user.

---

### User Story 3 - Reliable AI Image Generation & Image URL Validation (Priority: P1)

Admins can generate AI images in the review modal, and all image URLs are validated before display. Errors or broken images are clearly shown, and admins can re-check or replace images easily.

**Why this priority**: Ensures visual quality and prevents broken or misleading images in published news.

**Independent Test**: Can be tested by generating images, checking image previews, and simulating broken URLs.

**Acceptance Scenarios**:
1. **Given** a post in review, **When** an AI image is generated, **Then** the image is displayed if valid, or an error/fallback is shown if not.
2. **Given** a broken image URL, **When** the admin views the post, **Then** a clear error and option to replace/retry is shown.

---

### User Story 4 - Unified Research Center & Provenance (Priority: P2)

All research (RSS, web, trends, social) is managed as jobs, and the review modal/model profile section shows all relevant sources for each post. Backend and UI are fully wired for provenance.

**Why this priority**: Enables systematic research, traceability, and high-quality content generation.

**Independent Test**: Can be tested by running research jobs, generating drafts, and verifying that all sources are shown in the review modal.

**Acceptance Scenarios**:
1. **Given** a research job, **When** it completes, **Then** all results are normalized, deduplicated, and available for drafting.
2. **Given** a draft linked to multiple sources, **When** the review modal is opened, **Then** all sources are shown in the model profile section.

---

### User Story 5 - Automation, Scheduling, and Operational Hardening (Priority: P2)

All automation (research, drafting, publishing) is handled by a built-in runner, with n8n as an optional helper. Scheduling is flexible and reliable. Health checks, alerts, and audit logs are enforced.

**Why this priority**: Ensures reliability, flexibility, and easy operation for admins and future white-label clients.

**Independent Test**: Can be tested by running scheduled jobs, simulating failures, and verifying alerts/logs.

**Acceptance Scenarios**:
1. **Given** a scheduled post, **When** the publish time arrives, **Then** the post is published once and audit logs are updated.
2. **Given** a job/runner failure, **When** it occurs, **Then** an alert is sent and the error is logged.

---

### User Story 6 - UI/UX, Analytics, and White-Label Readiness (Priority: P3)

All dashboards and controls show live data, are accessible, and are easy to use. Branding, text, and settings are configurable for white-label deployment.

**Why this priority**: Supports future scaling and client onboarding with minimal friction.

**Independent Test**: Can be tested by changing branding/config, using dashboards, and verifying accessibility.

**Acceptance Scenarios**:
1. **Given** a new tenant/brand, **When** branding/config is updated, **Then** the UI reflects the changes everywhere.
2. **Given** a dashboard, **When** data changes, **Then** the UI updates in real time and remains accessible.

---
