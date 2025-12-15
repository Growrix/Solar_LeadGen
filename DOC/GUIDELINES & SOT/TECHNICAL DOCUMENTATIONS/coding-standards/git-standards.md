# Git Standards

## What It Is
Branching, commit, and workflow conventions ensuring traceability and clean history.

## Why It Matters
Enables efficient code reviews, reliable rollbacks, and audit trails.

## Branching
- `main`: deployable.
- Feature: `feat/<scope>-<desc>`.
- Fix: `fix/<scope>-<issue>`.
- Chore: `chore/<task>`.
- Hotfix: `hotfix/<critical>`.

## Commits
- Imperative mood: "Add billing webhook handler".
- First line ≤ 72 chars; body explains rationale & references issue IDs.
- Include Co-authored-by lines for significant AI or pair contributions if desired.

## Rebase Strategy
Prefer fast-forward merges; rebase feature on latest main before opening PR.

## Signed Commits
Optional; ensure identity consistency for audit-critical changes.

## Pitfalls / Anti-Patterns
- Squashing unrelated changes into single commit.
- Vague messages ("update code").
- Frequent merge commits cluttering history.

## AI Guidance
Ask: "Generate commit message summarizing diff for feature X referencing issue Y; enforce imperative style." Provide diff summary.
