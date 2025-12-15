# Data Protection

## What It Is
Safeguarding data at rest and in transit plus controlling exposure and retention.

## Why It Matters
Mitigates breach impact, ensures compliance readiness, and preserves user trust.

## Controls
| Aspect | Practice |
|--------|----------|
| In Transit | HTTPS/TLS enforced |
| At Rest | Managed encryption (Supabase) |
| Exposure | Minimal field return to clients |
| Retention | Defined data lifecycle policies |
| Backup | Regular snapshots + integrity checks |
| Classification | Tag sensitive fields (PII) |

## Minimization Strategy
- Return only required fields from repositories.
- Strip internal identifiers (e.g., billing provider IDs) from UI responses.

## Code Example (DTO Mapper)
```ts
function toProfileDTO(row: DbProfile){
  return { id: row.id, name: row.name, plan: row.plan }; // omit internal
}
```

## Pitfalls / Anti-Patterns
- Over-fetching entire rows.
- Logging sensitive values.
- Storing redundant copies of PII.

## AI Guidance
Ask: "Audit data exposure in service X; provide mapper diff removing sensitive fields." Provide current return shape.
