# Documentation Index

Concise navigation & usage instructions for human and AI contributors. Always load only the minimum relevant files for a task to preserve context quality.

Note: For system authority, workflow rules, and AI navigation controller, start at IMPLEMENTATION SOT/README.md.

## Quick Purpose Map
| Need | Read These First | Optional Follow-ups |
|------|------------------|---------------------|
| Understand project fundamentals | `overview.md`, `product-vision.md` | `constitution.md` |
| Architecture structure | `architecture/architecture-overview.md` | Specific architecture subpages |
| Make a code change (frontend) | `coding-standards/react-nextjs-guidelines.md`, `theming/ui-components.md` | `theming/tokens.md` |
| Make a code change (backend) | `coding-standards/backend-node-guidelines.md`, `architecture/backend-architecture.md` | `security/api-security.md` |
| Introduce new decision | `architecture/adr/README.md` | `architecture/adr/ADR-000-template.md` |
| Security review | `security/security-overview.md` | Other security docs |
| Performance optimization | `seo-performance/performance-budget.md` | `seo-performance/lighthouse-standards.md` |
| Add tests | `testing/testing-overview.md` | Specific test level docs |
| Deploy / release | `devops/deployment-guidelines.md` | `operations/release-management.md` |
| Incident handling | `operations/incident-response.md` | `devops/monitoring.md` |

## Loading Guidance For AI
1. Identify the task category (architecture, backend, frontend, security, performance, testing, operations).
2. Load only 2–4 most relevant files using above map.
3. Confirm assumptions (list them) before generating code.
4. Request additional docs only if a gap is detected.

## Sections Directory
- Project Core: `constitution.md`, `overview.md`, `product-vision.md`, `glossary.md`
- Architecture: `architecture/*`
- Coding Standards: `coding-standards/*`
- Theming: `theming/*`
- Security: `security/*`
- SEO & Performance: `seo-performance/*`
- Testing: `testing/*`
- DevOps: `devops/*`
- Operations: `operations/*`

## ADR Usage Summary
Create ADR for any change affecting performance budgets, security boundaries, key abstractions, or introducing/removing dependencies.

## AI Guidance
Ask: "Given task X (describe), suggest minimal doc subset to load and confirm assumptions; then propose diff plan." Provide clear task context.
