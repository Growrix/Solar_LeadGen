# Project Glossary

## What It Is
Centralized vocabulary defining domain concepts, ensuring consistent usage across code, docs, and conversations.

## Why It Matters
Reduces ambiguity, accelerates onboarding, and empowers AI models to interpret instructions correctly.

## Terminology
| Term | Definition | Notes |
|------|------------|-------|
| Tenant | Logical grouping of users/data under an organization | Future multi-tenancy support |
| User | Authenticated actor interacting with the platform | Stored in `users` table |
| Role | Collection of permissions governing actions | Mapped via role policy tables |
| Permission | Atomic capability (e.g., `billing.view`) | Composed into roles |
| Server Action | Next.js function executed server-side for business logic | Must validate input |
| Design Token | Abstract value (color, spacing, typography) driving UI consistency | Lives in theme config |
| Stripe Event | Webhook payload describing payment lifecycle change | Stored for idempotency |
| Audit Log | Immutable record of key state transitions | Append-only table |
| RLS (Row Level Security) | PostgreSQL feature enforcing per-row access rules | Enabled on all tables with user scope |
| ADR | Architecture Decision Record documenting significant decisions | Stored in docs/architecture/adr |
| LCP | Largest Contentful Paint metric | Performance KPI |
| Correlation ID | Unique ID linking logs across a request flow | Generated at request ingress |
| Feature Flag | Configurable switch enabling/disabling functionality | Evaluated server-side |
| Token Compliance | Adherence to using semantic design tokens vs hardcoded values | Mandatory for UI merges |

## Naming Decisions
Use kebab-case for feature branch descriptors, PascalCase for React components, camelCase for variables/functions, snake_case only for SQL column names when required (prefer lowercase without underscores if consistent). Environment variables always SCREAMING_SNAKE_CASE.

## Abbreviation Rules
Minimize abbreviations in code except widely recognized (ID, URL, API, DB). Avoid ambiguous truncations (`cfg`, `usr`, `acct`).

## Pitfalls / Anti-Patterns
- Divergent naming for same concept across layers (`customer` vs `user`)
- Overloaded generic terms (`item`, `data`)
- Duplication of tokens under different names

## AI Guidance
When uncertain about a term, consult this glossary first. If a term is missing, propose addition via structured diff including definition, rationale, and impact.
