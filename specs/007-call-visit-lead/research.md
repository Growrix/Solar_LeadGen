# Research: CALL_VISIT Lead Purchase Flow
Date: 2025-11-24

## Decisions

### Atomic Purchase Strategy
- **Decision**: Single Prisma transaction updating lead where `status='APPROVED' AND installerId IS NULL` then set `installerId`, `status='PURCHASED'`, `purchasedAt=NOW()`.
- **Rationale**: Prevents race condition; ensures only one row matches criteria.
- **Alternatives Considered**: Optimistic client lock (rejected: unreliable); application-level mutex (rejected: adds infra complexity).

### Conflict Detection
- **Decision**: Check affected rows count; if 0, return conflict error (`already_purchased`).
- **Rationale**: Simple, DB-driven; avoids second SELECT.
- **Alternatives**: Unique constraint with retry (rejected: extra migration not needed if single conditional update suffices).

### Audit Logging
- **Decision**: On any attempt, insert purchase log entry: `{ leadId, installerId, outcome, timestamp }`.
- **Rationale**: Complete traceability, supports monitoring.
- **Alternatives**: Log only successes (rejected: loses failure analysis), external logging service (rejected: overkill now).

### Contact Masking
- **Decision**: Backend resolves masking: if requesting installer matches `installerId` after purchase, return name/phone plain; else masked placeholders.
- **Rationale**: Centralizes security logic server-side.
- **Alternatives**: Client decides based on status (rejected: risk of leakage by rendering bug).

### Card State Derivation
- **Decision**: Derive `purchasedByMe`, `purchasedByOther`, `canPurchase` purely from `installerId`, `status` fields in response.
- **Rationale**: Eliminates local unlock arrays / mockLeads technical debt.
- **Alternatives**: Maintain parallel client state (rejected: drift risk).

### Expiry Handling (Optional)
- **Decision**: If `expiresAt` is present and now > expiresAt, treat as unavailable; disable purchase.
- **Rationale**: Future-proof; non-breaking if field absent.
- **Alternatives**: Ignore expiry until full lifecycle spec (accepted as defer for advanced flows).

### Performance Target
- **Decision**: p95 < 800ms dev baseline for purchase, audit logging inline.
- **Rationale**: Keeps UX responsive; low DB operations.
- **Alternatives**: Async audit write (rejected: premature optimization).

### Testing Approach
- **Decision**: Use integration test invoking two parallel purchase requests; assert one success + one conflict; verify audit log entries count = 2.
- **Rationale**: Directly validates race safety.
- **Alternatives**: Unit-only tests (rejected: insufficient concurrency validation).

## Resolved Clarifications
No outstanding clarifications; defaults applied.

## Open (Deferred) Considerations
- Expiry lifecycle broader rules (handled later with BIDDING/WRITTEN_QUOTE specs).
- Credit/billing logic deep audit (outside current scope; assumed existing service handles charges).

End of Research.
