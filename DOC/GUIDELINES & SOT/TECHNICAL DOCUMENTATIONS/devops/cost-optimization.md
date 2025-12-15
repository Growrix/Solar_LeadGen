# Cost Optimization

## What It Is
Continuous process of managing infrastructure and third-party spend without degrading performance or reliability.

## Why It Matters
Preserves margins and allows sustainable scaling.

## Focus Areas
| Area | Practice |
|------|---------|
| Database | Index audits, query optimization |
| Storage | Lifecycle policies, compression |
| Compute | Efficient server components, avoid over-provisioning |
| External APIs | Monitor usage tiers, right-size plans |
| Observability | Sample logs, retain critical only |

## Optimization Cycle
1. Gather spend metrics.
2. Identify top 20% cost drivers.
3. Propose reduction experiments (ADR if architectural).
4. Implement & measure impact.

## Pitfalls / Anti-Patterns
- Premature optimization sacrificing clarity.
- Ignoring hidden egress fees.
- Neglecting performance causing indirect cost (support time).

## AI Guidance
Ask: "Analyze monthly cost report; propose top 3 reduction experiments with estimated savings." Provide cost breakdown.
