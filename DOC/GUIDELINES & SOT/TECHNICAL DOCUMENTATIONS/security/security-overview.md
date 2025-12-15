# Security Overview

## What It Is
Holistic security posture: policies, controls, and practices protecting data confidentiality, integrity, and availability.

## Why It Matters
Mitigates breach risk, supports compliance, builds user trust, and prevents costly remediation.

## Security Pillars
| Pillar | Focus | Examples |
|--------|-------|----------|
| Identity | Auth & session | Supabase Auth, short-lived tokens |
| Access Control | Authorization & RLS | Role/permission matrix, policies |
| Data Protection | Encryption & minimization | TLS in transit, hashed secrets |
| Application Hardening | Input/output safety | Validation, output encoding |
| Dependency Hygiene | Vulnerability management | Automated scans, pin versions |
| Observability | Detection & response | Structured logs, alerts |
| Secrets & Config | Secure storage | Environment vars, rotation |

## Best Practices
- Principle of least privilege everywhere.
- Enforce RLS on all user-scoped tables.
- Validate and sanitize all external inputs.
- Log auth and permission denials with context (no sensitive values).
- Maintain SBOM (software bill of materials) in CI.

## Pitfalls / Anti-Patterns
- Granting broad admin privileges without auditing.
- Storing plaintext tokens or keys.
- Missing correlation between log events for forensic analysis.

## AI Guidance
Ask: "Assess new feature X for security gaps (auth, RLS, input validation); produce list + mitigation plan." Provide involved tables/actions.
