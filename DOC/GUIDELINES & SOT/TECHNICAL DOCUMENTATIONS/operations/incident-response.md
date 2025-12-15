# Incident Response

## What It Is
Structured process for identifying, triaging, mitigating, and learning from production incidents.

## Why It Matters
Reduces downtime, limits impact, and improves organizational resilience.

## Severity Levels
| Level | Criteria | Response SLA |
|-------|---------|--------------|
| SEV1 | Full outage, data corruption | 15 min initial, continuous updates |
| SEV2 | Partial degradation, major feature down | 30 min initial |
| SEV3 | Minor functionality issue | Next business day |
| SEV4 | Cosmetic/non-urgent | Backlog grooming |

## Response Workflow
1. Detect (alert/log)
2. Acknowledge (on-call)
3. Classify severity
4. Communicate status (channel + status page)
5. Mitigate impact (rollback/feature flag)
6. Root cause analysis (RCA)
7. Post-mortem (document actions + prevention)

## Post-Mortem Template
- Summary
- Timeline
- Impact
- Root Cause
- Contributing Factors
- Remediation & Prevention

## Pitfalls / Anti-Patterns
- Blame-focused reviews.
- Missing timeline reconstruction.
- Untracked follow-up tasks.

## AI Guidance
Ask: "Draft post-mortem for SEV2 latency spike; supply template filled with placeholders." Provide incident notes.
