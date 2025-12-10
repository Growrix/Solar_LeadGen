# Architecture Decision Records (ADR)

Store significant architectural decisions with context, alternatives, and consequences. Each ADR is immutable once accepted (only superseded by a new ADR).

## ADR Format
| Field | Description |
|-------|-------------|
| Number | Incremental integer (start at 001) |
| Title | Short imperative summary |
| Status | proposed | accepted | superseded | rejected |
| Context | Relevant forces, constraints, goals |
| Decision | What was chosen |
| Alternatives | Considered options + pros/cons |
| Consequences | Positive & negative outcomes |
| References | Links to issues/audits/specs |
| Review Date | Optional future reassessment time |

## Workflow
1. Draft ADR (Status: proposed).
2. Review + discussion.
3. Accept & merge (Status: accepted) OR reject.
4. Supersede by referencing prior ADR number.

## Naming Convention
`ADR-<number>-<kebab-title>.md` (e.g., `ADR-001-adopt-server-actions.md`).

## When To Create
- Introducing new persistence technology.
- Changing integration boundary patterns.
- Adjusting performance budgets.
- Modifying security posture (e.g., auth strategy).
- Significant refactors altering layering.

## AI Guidance
Ask: "Draft ADR (proposed) for adopting queue worker service; include context, alternatives (X,Y), consequences, review date." Provide rationale and constraints.
