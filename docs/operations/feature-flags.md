# Feature Flags

## What It Is
Runtime switches controlling exposure of functionality allowing gradual rollout and quick disable.

## Why It Matters
Reduces deployment risk, supports experimentation, and enables progressive delivery.

## Flag Types
| Type | Use |
|------|-----|
| Boolean | Simple enable/disable |
| Percentage Rollout | Gradual exposure |
| Permission-Gated | Role-specific access |
| Conditional | Based on attributes (plan tier) |

## Management
- Central flag registry table.
- Evaluation server-side; no critical logic on client toggle alone.
- Logging evaluations for audit.

## Lifecycle
1. Create flag (document intent + expiry date).
2. Rollout progression (10% → 50% → 100%).
3. Monitor metrics & errors.
4. Sunsetting (remove code paths, delete flag).

## Pitfalls / Anti-Patterns
- Permanent flags without cleanup.
- Client-only gating exposing behavior.
- Overlapping flags causing combinatorial complexity.

## AI Guidance
Ask: "Add new percentage rollout flag 'newOnboarding'; provide schema change + evaluation helper diff." Provide current flag schema.
