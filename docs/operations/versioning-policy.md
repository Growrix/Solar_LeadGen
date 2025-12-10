# Versioning Policy

## What It Is
Semantic versioning rules for managing breaking, feature, and patch changes.

## Why It Matters
Clarifies impact of updates, enables safe dependency integration, and supports automation.

## SemVer
`MAJOR.MINOR.PATCH`
| Segment | Trigger |
|---------|--------|
| MAJOR | Breaking API/contract changes |
| MINOR | Backward-compatible new features |
| PATCH | Backward-compatible fixes |

## Guidelines
- Increment major only with documented migration steps.
- Bundle related minor changes logically.
- Patch releases contain no schema changes requiring data migration.

## Tagging
- Git tag after successful production deploy (`v1.4.2`).
- Annotated tag containing changelog excerpt.

## Pitfalls / Anti-Patterns
- Sneaking breaking changes in minor releases.
- Inconsistent tagging leading to confusion.

## AI Guidance
Ask: "Determine appropriate version increment for changeset X; justify using policy." Provide changes summary.
