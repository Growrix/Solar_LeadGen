# SaaS Project Constitution

Note: This document operates under the higher authority of SYSTEM DESIGN/SYSTEM_CONSTITUTION.md. For day-to-day implementation workflow and safety rules, defer to IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md.

Authoritative operating manual for all human and AI contributors. Every change, line of code, architectural decision, and audit MUST align with this constitution. Non‑compliant work is rejected.

## 1. Core Principles
1. User Value First: Ship features that demonstrably improve user outcomes (speed, clarity, reliability, security).
2. Architectural Integrity: Prefer composability, isolation, explicit data boundaries, and predictable side‑effects.
3. Least Privilege Everywhere: Auth, DB access, secrets, API scopes—always minimum necessary.
4. Server‑First Strategy: Push logic to server/actions; keep client lean and declarative.
5. Theme & Token Driven UI: Zero hardcoded colors, spacing, font sizes, shadows, radii, breakpoints.
6. Deterministic Builds: Reproducible environments using lockfiles and documented setup.
7. Observability by Default: Log structured events, trace critical flows, measure performance budgets.
8. Non‑Blocking Quality Gates: Automation enforces standards (lint, type check, tests, security scans) before merge.
9. Auditability: Every significant change references an issue, an ADR (Architecture Decision Record) or audit item.
10. AI Assist, Human Owns: AI can draft; humans review, adapt, and approve.

## 2. Canonical Tech Stack
- Frontend: Next.js App Router + React 18 + TypeScript
- Styling: Tailwind CSS (design tokens + semantic layer)
- Backend Runtime: Node (server actions, edge where appropriate)
- Database: PostgreSQL (Supabase managed) + RLS
- Auth: Supabase Auth (JWT/session hybrid) + role/permission model
- Storage: Supabase Storage (versioned, lifecycle policies)
- Payments: Stripe (subscription, usage events, invoices)
- Testing: Vitest/Jest (unit) + React Testing Library + Playwright (E2E)
- CI/CD: GitHub Actions → Vercel deployments
- Observability: Sentry + structured JSON logs (console + external sink)

## 3. Non‑Negotiable Quality Gates
| Gate | Tooling | Threshold |
|------|---------|-----------|
| Type Safety | `tsc --noEmit` | 0 errors |
| Lint | ESLint + custom rules | No warnings on changed lines |
| Formatting | Prettier | Auto enforced |
| Unit Coverage | Vitest/Jest | ≥ 80% lines critical modules |
| E2E Stability | Playwright | 100% required flows green |
| Performance | Lighthouse CI | ≥ 90 Performance, ≥ 95 Accessibility, ≥ 95 Best Practices, ≥ 90 SEO |
| Security Scan | Dependency + secret scan | 0 critical/high vulns |
| Bundle Size | CI diff check | No regression >5% without ADR |

## 4. Definition of Done (DoD)
An issue/feature is DONE only if: design tokens applied, responsive verified, accessibility (WCAG 2.2 AA) passed, tests added/updated, docs updated, no hardcoding, logs & errors instrumented, migration scripts (if schema changes) tested in staging, rollback plan documented.

## 5. Branching & Change Control
- `main`: Protected, deployable at all times.
- `develop`: Optional (if release batching needed).
- Feature branches: `feat/<scope>-<short-desc>`.
- Fix branches: `fix/<scope>-<issue>`.
- Release branches: `release/<version>`.
- Hotfix: `hotfix/<critical-desc>`.
- Every PR: linked issue, summary, test evidence, screenshots (UI), performance diff (if applicable).

## 6. Architecture Decision Records (ADRs)
Stored in `/docs/architecture/adr/` (future folder). Each includes: Context, Decision, Alternatives, Consequences, Owner, Review Date. AI must never invent ADRs—only extend existing template.

## 7. Secure Development Baseline
Mandatory: parameterized queries, input validation (zod / schema), output encoding, CSRF tokens where forms mutate state, strict CSP, no eval/dynamic require, secrets via environment (never committed), rotating tokens for external integrations.

## 8. Theming & Design Tokens
Design tokens categories: color, typography, spacing, sizing, elevation, radii, transitions, breakpoints, semantic roles (e.g., `bg-surface`, `text-muted`).
Forbidden: inline style literals for theme values, arbitrary Tailwind hacks unless justified (ADR). Variant composition done in a UI abstraction layer, not per raw component.

## 9. Accessibility Charter
All interactive elements reachable via keyboard (Tab order logical). Focus states visible. Color contrast ≥ required ratios. ARIA used only when native semantics insufficient. Motion-reduced animations respect prefers-reduced-motion.

## 10. Performance Budget (Key Targets)
- LCP ≤ 2.0s @ 75th percentile (mobile)
- TTFB ≤ 300ms (cached) / 500ms (uncached)
- CLS ≤ 0.10
- Total JS ≤ 250KB gzip initial route
- API P95 latency ≤ 400ms for business-critical endpoints

## 11. Logging & Monitoring Essentials
Structured JSON logs: timestamp, level, correlationId, userId (if auth), requestId, component, event, duration, error stack. Do not log PII beyond minimal necessary (e.g., hashed identifiers). Alerts escalate by severity tiers.

## 12. Audit Operating Procedure (AOP)
Purpose: Determine current vs desired state, identify gaps, produce actionable remediation roadmap.

### Audit Scope Dimensions
1. Functional correctness
2. UX/UI compliance (tokens, accessibility)
3. Security posture (authZ, data exposure, secret handling)
4. Performance (metrics & budget adherence)
5. Reliability (error handling, retries, idempotency)
6. Maintainability (structure, naming, abstraction quality)
7. Observability (coverage of logs, tracing, metrics)

### Audit Workflow Steps
1. Intake: Confirm requested objective & constraints.
2. Context Gathering: Enumerate related modules, data models, API endpoints, UI surfaces.
3. Baseline Capture: Run automated scans (lint, type, test, size, security) and record results.
4. Manual Review: Code walkthrough focusing on scope dimensions.
5. Findings Classification: Severity (Critical / High / Medium / Low), Type (Bug / Gap / Risk / Debt / Enhancement).
6. Root Cause Analysis: Underlying systemic issue vs isolated mistake.
7. Remediation Planning: Group fixes into phases (Immediate / Near-Term / Strategic).
8. Risk Analysis: Impact vs effort matrix; highlight dependencies.
9. Approval Gate: Human reviewer signs off plan (AI cannot self‑approve).
10. Execution: Implement fixes in atomic PRs referencing audit item IDs.
11. Verification: Re-run baseline capture; all deltas justified.
12. Closure: Publish final audit report & create ADRs if architectural changes.

### Audit Report Required Sections
1. Executive Summary
2. Scope & Methodology
3. Baseline Metrics Table
4. Detailed Findings (grouped by dimension)
5. Root Cause Narratives
6. Remediation Plan (phased table)
7. Risk & Impact Assessment
8. Execution Tracker (item → PR link → status)
9. Post‑Remediation Metrics Comparison
10. Lessons Learned & Preventative Actions

## 13. Standard Audit Prompt Template
Copy, fill placeholders, and run. DO NOT alter structural sections.

```
You are a Senior SaaS Audit & Remediation AI operating under the project constitution.

Objective:
<Insert concise objective>

Scope Modules/Features:
<List related frontend components, server actions, DB tables, API endpoints>

Constraints:
- Stack: Next.js App Router + TypeScript, Node, PostgreSQL (Supabase), Tailwind tokens, Stripe, Supabase Auth.
- No hardcoded styling; must use design tokens.
- Preserve existing functional logic unless fixing a confirmed bug.

Audit Dimensions:
Functional correctness, UI/theming compliance, accessibility, security, performance, reliability, maintainability, observability.

Tasks:
1. Gather context & list analyzed assets.
2. Produce Baseline Metrics (types, tests, perf proxies, security scan summary).
3. Enumerate Findings with severity, type, description, evidence (file:line or metric), and impacted user flow.
4. Provide Root Cause for each critical/high item.
5. Build Remediation Plan table: Phase, Item ID, Action, Effort (S/M/L), Owner (placeholder), Risk.
6. Generate Atomic Task Checklist (implementation order optimizing impact vs dependencies).
7. Suggest Preventative Enhancements (lint rules, abstraction refactors, monitoring additions).
8. Output Final Structured Report.

Rules:
- Never invent libraries or modify outside defined stack.
- Do not mix audit with implementation—only propose; implementation follows separate PRs.
- No partial remediation suggestions; every finding must map to a plan item or explicit defer rationale.
- Use consistent IDs: AUD-<yyyyMMdd>-<increment>.
- Provide explicit confirmation if an expected dimension has zero findings.

Deliverables:
FULL AUDIT REPORT (Markdown) + TASK CHECKLIST.

Begin now.
```

## 14. Strict Rules for Implementation (Post-Audit)
1. One concern per PR (single logical change set).
2. No UI hardcoding: all colors, spacing, typography via tokens/utilities.
3. Never bypass lint/type errors—solve root cause.
4. Maintain test parity: existing tests must pass; new logic covered.
5. Migration safety: DB changes are forward + backward compatible (nullable additions, phased drops).
6. Security review for auth/permission modifications (sign off required).
7. Performance neutral or improved unless justified via ADR.
8. Avoid hidden coupling—prefer explicit dependency injection or module boundaries.
9. Documentation update mandatory for public API or architectural changes.
10. Rollback plan documented for every production deployment.

## 15. AI Contribution Guidelines
AI MUST:
- Read relevant docs paths (not entire repo) based on task tags.
- Confirm assumptions with a short validation list before outputting code.
- Provide diff‑style changes for modifications (never whole file unless new).
- Suggest minimal test additions first, then implementation.
- Flag uncertainty explicitly; never fabricate metrics.

AI MUST NOT:
- Introduce new dependencies without ADR
- Hardcode secrets, tokens, or styling values
- Bypass error handling conventions
- Mutate global state implicitly
- Ship code without referencing related issue/audit item

## 16. Enforcement & Escalation
Automations block merges failing gates. Repeated non‑compliance escalates to maintainers for intervention. Critical security deviations trigger immediate rollback/hotfix protocol.

## 17. Continuous Improvement
Quarterly architecture review updates budgets, token sets, and ADR validations. Audit backlog triaged monthly. Constitution updated only via formal ADR referencing change justification.

---
End of Constitution.

## AI Guidance
When using this `constitution.md` file:
- Load it only for tasks involving global rules, audits, architectural changes, or enforcement clarification.
- Before code generation: list which constitution sections apply (e.g., Quality Gates, Theming, Audit Operating Procedure).
- If a requested action conflicts with a constitution rule, respond with a clarification request and suggest compliant alternatives.
- For audits: cite Constitution section numbers alongside findings for traceability.
- Never modify constitution contents directly; propose an ADR instead for any change.

