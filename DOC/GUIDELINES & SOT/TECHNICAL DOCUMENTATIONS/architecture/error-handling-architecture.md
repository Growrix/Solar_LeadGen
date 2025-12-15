# Error Handling Architecture

## What It Is
Unified strategy for detecting, categorizing, propagating, and observing errors across UI, server actions, services, integrations, and persistence.

## Why It Matters
Improves reliability, reduces debugging time, ensures consistent UX responses, and supports actionable monitoring.

## Error Categories
| Category | Source | Handling |
|----------|--------|----------|
| Validation | Input/schema failures | Return structured field errors |
| Domain | Business rule violation | Map to user-friendly code/message |
| AuthZ/AuthN | Permission/session failures | 401/403 envelope with code |
| Integration | External API issues | Retry (exponential) or circuit break |
| System | Unexpected exceptions | Log + sanitized generic error |

## Error Object Shape
```ts
type AppError = { code: string; message: string; details?: unknown; correlationId: string };
```

## Mapping Utility
```ts
export function mapError(e: unknown, correlationId: string): AppError {
  if (e instanceof DomainError) return { code: e.code, message: e.message, correlationId };
  return { code: "INTERNAL_ERROR", message: "Unexpected error", correlationId };
}
```

## Logging Strategy
- Log at boundary (action) with correlationId.
- Include stack only in secure log sink (not user-visible response).

## Retry Guidelines
- Idempotent Stripe operations: retry up to 3 times with jitter.
- DB transient errors: one retry if safe.

## UX Display
- Validation errors inline per field.
- Domain/error alerts using accessible `role="alert"` regions.

## Best Practices
- Never leak stack traces to clients.
- Preserve original error cause for debugging (`cause` property).
- Distinguish transient vs permanent errors.

## Pitfalls / Anti-Patterns
- Swallowing errors silently
- Overloading generic `Error` with ambiguous messages
- Inconsistent envelope formatting

## AI Guidance
Ask: "Introduce new error code for webhook signature mismatch; update mapping + tests diff." Provide current error mapping utility path.
