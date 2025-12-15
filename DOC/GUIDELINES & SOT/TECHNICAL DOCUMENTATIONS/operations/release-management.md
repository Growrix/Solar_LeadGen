# Release Management

## What It Is
Process governing planning, coordination, and execution of production releases.

## Why It Matters
Ensures predictable cadence, high quality, and transparent communication.

## Release Types
| Type | Frequency | Contents |
|------|----------|----------|
| Minor | Weekly | Features, fixes |
| Patch | As needed | Hotfixes, security |
| Major | Quarterly | Breaking changes (version bump) |

## Planning
- Scope freeze 24h before target.
- Final regression test pass.
- Risk assessment & rollback plan.

## Communication
- Changelog with categorized entries (Added, Changed, Fixed, Security).
- Stakeholder summary (impact + actions).

## Pitfalls / Anti-Patterns
- Last-minute feature merges.
- Unclear rollback steps.
- Missing documentation updates.

## AI Guidance
Ask: "Generate release notes (Added/Changed/Fixed) from diff summary; output markdown." Provide diff categories.
