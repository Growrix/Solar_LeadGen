# Project Overview

## What It Is
Single-tenant to multi-tenant capable SaaS platform built with Next.js App Router, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Stripe for billing, and GitHub Actions + Vercel for CI/CD.

## Why It Matters
Provides a coherent foundation enabling rapid feature delivery without sacrificing reliability, security, scalability, or maintainability. Defines the guiding context for architectural trade-offs and establishes success criteria for every domain (performance, accessibility, security, observability, cost).

## Vision
Deliver a modular, secure, performant SaaS baseline that supports subscription billing, role‑based access, audited data flows, and theme-driven UI extensibility while remaining lean and comprehensible for small teams.

## Core Goals
1. Predictable evolution (architecture that tolerates change with minimal regression risk).
2. Low cognitive overhead (clear boundaries, naming, and documentation for each layer).
3. Automated quality gates (types, tests, security, performance) enforced pre-merge.
4. Token-driven UI theming (no hardcoding; rapid design iteration).
5. First-class accessibility (WCAG 2.2 AA baseline across all interactive components).
6. Transparent operations (metrics + logs + alerts integrated from the start).

## Constraints
- Only approved stack (Next.js, TypeScript, Tailwind, Supabase, Stripe). No ad hoc dependencies without ADR.
- Avoid client state complexity—prefer server actions and streaming responses.
- Database schema evolves via explicit migrations, never silent changes.
- Performance budgets enforced (LCP, TTFB, CLS, bundle size) via CI.

## High-Level Component Map
| Layer | Responsibility | Key Elements |
|-------|----------------|--------------|
| Presentation | User interaction, accessibility, responsive layout, theming | App Router pages, layouts, UI primitives |
| Domain Logic | Business rules, validation, orchestration | Server actions, service modules, schema guards (zod) |
| Data Access | Structured persistence & retrieval | Supabase client, SQL migrations, RLS policies |
| Integration | External payment/storage/auth flows | Stripe webhooks, Supabase Auth, Storage ops |
| Observability | Monitoring health & anomalies | Sentry SDK, structured logs, metrics emission |

## Architecture Diagram (Textual)
```
Browser -> Next.js App Router (Edge/Node) -> Server Action Layer -> Service Modules -> Supabase (Postgres + Auth + Storage)
                                                   |-> Stripe API (billing)
                                                   |-> Logging/Tracing (Sentry/Console JSON)
                                                   |-> Background Tasks (Queued via future worker abstraction)
```

## Success Metrics
- User onboarding time < 2 minutes
- Payment failure tracking 100% coverage
- 0 critical accessibility violations in quarterly audit
- P95 API latency < 400ms for core endpoints
- Error resolution median time < 24h for High severity

## Pitfalls / Anti-Patterns
- Bloated client bundles due to duplicative utility imports
- Direct DB calls inside React components (violates layering)
- Inline color values circumventing tokens
- Silent feature toggles without audit logging
- Skipping test updates leading to false green builds

## AI Guidance
When requesting changes, supply: affected layer, desired outcome, constraints, existing file paths. Ask for diffs, not whole rewrites. Request token usage validation for UI work.
