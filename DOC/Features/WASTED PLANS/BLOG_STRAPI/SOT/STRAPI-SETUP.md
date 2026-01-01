---
description: "Strapi provisioning + content model runbook for BLOG_STRAPI (E2E, continuity-first)"
---

# STRAPI-SETUP (Runbook)

**Scope**: This document defines exactly how Strapi is added, configured, and run for the BLOG_STRAPI feature.

**Non-negotiables**:
- Strapi is a separate service and is integrated via HTTP API only.
- The Strapi API token is server-only and must never be exposed to client code.
- Public blog rendering must have a safe fallback to seeded local data when Strapi is not configured or unreachable.

## Architecture Choice (Locked)

- **Strapi location**: Separate Strapi project (recommended: sibling repo/folder or separate deploy), not embedded inside Next.js runtime.
- **Integration**: Next.js server components / server utilities call Strapi REST API.
- **Auth**: Use a Strapi API token stored in Next.js env (`STRAPI_TOKEN`).

## Environments

### Local development
- Strapi runs locally (Node) or via Docker.
- Next.js runs separately.

### Staging/Production
- Strapi runs as its own deployment (container or managed host).
- Next.js uses environment variables to point at the correct Strapi base URL.

## Required Environment Variables (Next.js)

Set these in `.env.local` (or your hosting environment):
- `STRAPI_URL` — Base URL of Strapi, e.g. `http://localhost:1337`
- `STRAPI_TOKEN` — Strapi API token (read-only for public content)

**Security rules**:
- Do not use these vars in client components.
- Do not prefix them with `NEXT_PUBLIC_`.

## Strapi Project Setup (Local)

This repo does not pin a single Strapi scaffolding method in code. Choose one of the following and document your chosen approach in your team ops notes:

### Option A: Create Strapi app (Node)
- Create a new Strapi project outside the Next.js app.
- Start Strapi and confirm Admin UI is reachable.

### Option B: Run Strapi via Docker
- Use a standard Strapi Docker image.
- Persist database + uploads as appropriate.

**Acceptance**: At the end of setup, you must be able to open Strapi Admin and create/publish content.

## Content Model (Locked)

### Collection Types

#### `Post`
Required fields (minimum):
- `title` (string)
- `slug` (UID based on title OR explicit string)
- `excerpt` (text)
- `content` (rich text / markdown / blocks — your choice, but it must be representable as HTML or text on the public site)
- `coverImage` (media, optional)
- `publishedAt` (managed by Strapi publish workflow)
- `seoTitle` (string, optional)
- `seoDescription` (text, optional)

Relations (recommended):
- `category` (many-to-one) → `Category`
- `tags` (many-to-many) → `Tag`

#### `Category`
- `name` (string)
- `slug` (UID or string)

#### `Tag`
- `name` (string)
- `slug` (UID or string)

## Permissions + Token

1) Enable public (or token-authenticated) read access to published `Post` entries.
2) Create an API token for Next.js:
- Scope: read-only
- Content: Posts (+ Categories/Tags if queried)

## API Expectations

Your Next.js integration assumes:
- You can query a list of published posts.
- You can query a single post by `slug`.

If your Strapi API differs, update `src/lib/blog/strapi.ts` mappings accordingly.

## Smoke Tests

- Strapi Admin loads
- Create a Category + Tag
- Create a Post with:
  - title
  - slug
  - excerpt
  - content
  - publish
- Confirm list endpoint returns it
- Confirm slug endpoint returns it

## Failure Modes (Expected)

- If `STRAPI_URL` or `STRAPI_TOKEN` is missing, public blog must still render via seeded fallback.
- If Strapi is down, public blog must still render via seeded fallback.
