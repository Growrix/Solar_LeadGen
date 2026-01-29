# BLOG — SOT Index

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-05

This folder is the **single Source of Truth** for the BLOG feature (planning + execution artifacts).

## Canonical Documents

- `FEATURE-SOT.md`
  - The canonical 6-phase plan (Phases 0–6). All work must align to it.

## Required Pre-Implementation Docs (Non-negotiable)

- `CURRENT-STATE-E2E-AUDIT.md`
  - Canonical E2E current-state audit (frontend + backend + DB + integrations).
- `CURRENT-UI-AUDIT-BLOG.md`
  - Legacy baseline capture (keep for history; superseded by CURRENT-STATE-E2E-AUDIT).
- `Frontend-Plan.md`
  - Visual contract of routes/pages/modals/flows (includes বাংলা ব্যাখ্যা).
- `IMPLEMENTATION-PLAN.md`
  - What is being implemented now, sequencing, acceptance checks, stop rules.
- `tasks.md`
  - Continuity-first execution checklist (must follow `.specify/templates/tasks-template.md`).

## Scope Guardrail

This SOT is for **BLOG** only.
- News (publishing news posts from government feeds) belongs in a separate feature folder (e.g., `DOC/FEATURES/NEWS ENGINE/`).
- Newsletter automation belongs in a separate feature folder.

In scope clarification (new):
- RSS sources used for **blog research/topic discovery** are in scope for BLOG.
- The Blog Engine Hub (AI + automation control center) is part of BLOG.

Additional in-scope CMS extensions (new):
- Media Library for blog assets (`/admin/blog/media`).
- Comments management for moderation (`/admin/blog/comments`). Public commenting UI remains out of scope unless explicitly approved.

## Approval Gates

- Planning is considered “locked” only when all required docs above are present and approved.
- No implementation work should start until the required docs are approved.
