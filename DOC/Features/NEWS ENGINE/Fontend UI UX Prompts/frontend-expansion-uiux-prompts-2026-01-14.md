# Frontend Expansion UI/UX Prompts — News Engine (2026-01-14)

**Purpose**: Step-locked prompt pack for frontend expansion/enhancement work.

**Source of truth** (must be loaded into context before using these prompts):
- Acceptance criteria: `DOC/FEATURES/NEWS ENGINE/Plan/Expand_userstory.md`
- Unified plan: `DOC/FEATURES/NEWS ENGINE/Plan/NEWS-ENGINE-EXPANSION-UNIFIED-PLAN-V3-2026-01-14.md`
- Baseline audit: `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-post-phase13-audit-2026-01-13.md`

**SOP**: Follow `DOC/PROMPTS/PROMPTS & TEMPLATES/FRONTEND/AI Prompting Guideline.md`

---

## Flow Decomposition (Expansion Scope)

We are enhancing **existing** surfaces (no new major routes unless required):
- Admin item editor/review modal (rich formatting editor + clarity + provenance + image reliability)
- Public share modal (WhatsApp + Email)

No undefined transitions: each prompt declares triggers and next steps.

---

## Prompt 1/6 — Page Context (Admin Hub: Where changes live)

This is Step 1 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Task:
Describe where the News Item editor/review modal lives inside the Admin News Engine Hub, including:
- which tab opens it (Drafts & Reviews / Published / Rejected)
- how an item is selected
- what data is expected to be available when the modal opens

Constraints:
- Do not redesign the whole Admin Hub.
- Do not implement modal UI yet.

Output:
- A short UI wiring map (user action → modal opens → expected sections).

Stop after:
- This page context only.

---

## Prompt 2/6 — Review/Editor Modal Audit + Clarity Rules

This is Step 2 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Trigger:
Opened when admin clicks an item to edit/review from the Admin Hub.

Purpose:
Make the review/editor modal trustworthy and confusion-free:
- show only working sections
- if something is not implemented, label it explicitly and disable actions

Modal sections to cover:
- Header (title, status pill, primary actions)
- Metadata (category, tags, timestamps)
- Content (body editor placeholder; do not design editor implementation yet)
- SEO (only if actually wired; otherwise mark as unavailable)
- Image Controls (panel placeholder; do not design detailed panel yet)
- Provenance/Research Summary (panel placeholder; do not design detailed panel yet)

States to consider:
- Default
- Loading
- Empty item fields
- Disabled actions (based on status)
- Error banner

Constraints:
- No backend logic.
- Do not invent features not present in acceptance criteria.

Output:
- A detailed modal layout + rules for what shows/hides.

Stop after:
- This modal only.

---

## Prompt 3/6 — Rich Text Editor UX (Body Editing + Preview)

This is Step 3 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Trigger:
Inside the review/editor modal, in the Content section.

Purpose:
Design the rich formatting editor UX:
- headings (H1/H2/H3)
- bullet/number lists
- bold/italic
- links
- optional: code block (only if it does not confuse editorial users)

UX requirements:
- Provide a “Preview” toggle (matches public render as closely as possible)
- Provide a safe “Format content” action that normalizes spacing/headings/lists
- Provide a fallback “Raw HTML” view only if needed (keep it hidden behind an advanced toggle)

States:
- empty content
- content too large
- invalid link (client-side validation)

Constraints:
- No backend logic.
- Do not choose a specific editor library; describe UX/behaviors only.

Output:
- Detailed editor UI plan (toolbar, keyboard shortcuts optional, preview behavior).

Stop after:
- Editor UX only.

---

## Prompt 4/6 — Image Controls UX (Reliability + Replacement)

This is Step 4 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Trigger:
Inside the review/editor modal, Image Controls panel.

Purpose:
Make OG image management reliable and operator-friendly:
- show current image preview
- show health status badge (OK/Broken/Unknown)
- actions: Re-check, Replace URL, Generate new image, Approve (if approval required)

States:
- no image
- broken image
- checking status
- action in progress
- error

Constraints:
- No backend logic.
- Assume server provides an image-health check action.

Output:
- Image panel layout + action UX + error handling rules.

Stop after:
- Image Controls panel only.

---

## Prompt 5/6 — Provenance / Research Summary UX (All Sources)

This is Step 5 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Trigger:
Inside the review/editor modal, Provenance/Research Summary panel.

Purpose:
Show all source kinds used to create the item:
- RSS
- WEB
- TREND
- SOCIAL
- JOURNAL

Requirements:
- Each source row shows: kind badge, title, URL, timestamp.
- Provide “Copy sources” button.
- Provide “Open all sources” action with a warning if many links.

States:
- no provenance available
- partial provenance

Constraints:
- No backend logic.

Output:
- Panel layout + interaction plan.

Stop after:
- Provenance panel only.

---

## Prompt 6/6 — Public Share Modal Channels (WhatsApp + Email)

This is Step 6 of 6 in the News Engine expansion frontend flow.

Context:
You are a SaaS frontend UI/UX engineer. Scope: UI planning only.

Trigger:
Opened from public news detail page when user clicks Share.

Purpose:
Enhance share options:
- add WhatsApp share
- add Email share

Constraints:
- No backend logic.
- Provide share URLs using standard share link formats.

Output:
- Updated share modal layout + buttons + URL formats.

Stop after:
- Share modal only.
