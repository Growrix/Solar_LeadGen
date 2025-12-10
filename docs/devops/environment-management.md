# Environment Management

## What It Is
Governance of configuration and resources across local, staging, and production environments.

## Why It Matters
Prevents config drift, ensures reproducibility, and supports safe experimentation.

## Environments
| Env | Purpose | Data |
|-----|---------|------|
| Local | Developer iteration | Synthetic / seed |
| Staging | Pre-production validation | Sanitized subset |
| Production | Live users | Full dataset |

## Configuration Strategy
- Central `.env.example` documenting required variables.
- Validation module on startup enforcing presence & format.
- Segregate sensitive secrets per environment (no re-use).

## Data Handling
- Mask PII in staging.
- Use migrations equally across envs (no manual schema edits).

## Change Control
- Environment changes tracked via issue + PR referencing reason.
- Secrets rotated periodically (document schedule).

## Pitfalls / Anti-Patterns
- Divergent feature flags causing inconsistent behavior.
- Manual schema hotfixes not captured in migrations.

## AI Guidance
Ask: "Generate env validation module for new VAR_X with format regex; diff only." Provide variable spec.
