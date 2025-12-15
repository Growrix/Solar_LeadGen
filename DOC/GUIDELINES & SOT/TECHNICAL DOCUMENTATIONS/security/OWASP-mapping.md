# OWASP Mapping

## What It Is
Mapping of platform controls to OWASP Top 10 categories for gap analysis.

## Why It Matters
Ensures coverage against prevalent web application risks and guides future improvements.

## Mapping Table
| OWASP Category | Control Implementations | Status |
|----------------|------------------------|--------|
| Broken Access Control | RLS, permission checks | Ongoing |
| Cryptographic Failures | Managed TLS, minimal custom crypto | Adequate |
| Injection | Parameterized queries, input validation | Adequate |
| Insecure Design | ADR process, architecture reviews | Improving |
| Security Misconfiguration | Hardened headers, env validation | Adequate |
| Vulnerable Components | Dependency scanning | Ongoing |
| Identification & Auth Failures | Supabase Auth practices | Adequate |
| Data Integrity Failures | Idempotent webhooks | Improving |
| Security Logging & Monitoring | Structured logs, alerts | Improving |
| SSRF | No raw arbitrary URL fetch; whitelist patterns | Adequate |

## Gap Handling
Document unresolved gaps; create audit items & remediation timeline.

## Pitfalls / Anti-Patterns
- Assuming coverage without verification.
- Stagnant mapping not updated after architectural changes.

## AI Guidance
Ask: "Update OWASP mapping after introducing queue worker feature; list new category impacts." Provide change summary.
