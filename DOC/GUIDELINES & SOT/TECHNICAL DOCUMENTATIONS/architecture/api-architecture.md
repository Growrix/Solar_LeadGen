# API Architecture

## What It Is
Patterns for exposing functionality via server actions or REST endpoints (if required), including validation, versioning, and error modeling.

## Why It Matters
Creates predictable contracts, reduces client duplication, and facilitates secure, evolvable integrations.

## Interaction Modes
| Mode | Use Case | Notes |
|------|----------|-------|
| Server Actions | Internal UI invocation | Strong typing, no public exposure |
| REST (Optional) | External integrations | Requires auth signing & rate limits |

## Request / Response Shape
```ts
// Standard response envelope
type ApiResponse<T> = { data?: T; error?: { code: string; message: string }; meta?: { correlationId: string } };
```

## Versioning
Prefix external endpoints: `/v1/…`; avoid breaking changes—introduce new version if contract shift is unavoidable.

## Validation
Use zod schemas per endpoint; reject early with 400 & structured error object.

## Error Codes
`VAL_ERROR`, `AUTH_REQUIRED`, `PERMISSION_DENIED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT`, `INTERNAL_ERROR`.

## Rate Limiting (Future)
Token bucket keyed by user/tenant; return `429` with retry-after header.

## Code Example (Envelope Usage)
```ts
export async function getProfile(req: Request): Promise<ApiResponse<Profile>> {
  try {
    const userId = requireAuth(req);
    const profile = await profileService.get(userId);
    return { data: profile, meta: { correlationId: getCorrelationId() } };
  } catch (e) {
    return mapError(e);
  }
}
```

## Best Practices
- Consistent envelope type.
- Correlation ID attached to every response.
- Explicit error mapping; never leak stack traces.

## Pitfalls / Anti-Patterns
- Ad hoc JSON shapes per endpoint
- Mixed success/error format
- Validation deep inside business logic instead of at boundary

## AI Guidance
Ask: "Need new external endpoint for exporting usage stats with envelope, versioned under v1; provide zod schema + error mapping diff." Include existing envelope type path.
