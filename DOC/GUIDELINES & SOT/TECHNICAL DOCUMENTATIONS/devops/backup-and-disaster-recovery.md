# Backup & Disaster Recovery

## What It Is
Strategies ensuring data durability and rapid restoration after catastrophic failure or corruption.

## Why It Matters
Protects against data loss, reduces downtime, and fulfills reliability commitments.

## Backup Types
| Type | Frequency | Retention |
|------|-----------|----------|
| Full DB Snapshot | Daily | 30 days |
| Incremental | Hourly | 72 hours |
| Object Storage | Continuous versioning | 30 days |

## DR Plan
1. Detect anomaly (alerts/log patterns).
2. Assess scope (tables, services affected).
3. Select restore point (most recent safe snapshot).
4. Restore to staging & validate integrity.
5. Promote restored data to production.
6. Post-mortem & remediation tasks.

## Verification
- Quarterly restore drills.
- Hash checks for snapshot integrity.

## Pitfalls / Anti-Patterns
- Unverified backup assumptions.
- Single-region storage risk.
- Manual undocumented recovery steps.

## AI Guidance
Ask: "Draft recovery steps for corrupted subscription table; include validation queries." Provide table schema.
