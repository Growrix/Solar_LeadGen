# Logging

## What It Is
Structured event recording supporting troubleshooting, auditing, and analytics.

## Why It Matters
Provides observability, enables rapid root cause analysis, and supports compliance reviews.

## Log Schema
```json
{
  "timestamp": "ISO8601",
  "level": "info|warn|error",
  "event": "string",
  "correlationId": "string",
  "userId": "string|null",
  "component": "string",
  "durationMs": 42,
  "details": {}
}
```

## Best Practices
- Use consistent event names (verb-noun).
- Attach correlationId early (middleware).
- Avoid logging sensitive data (PII, secrets).
- Log at action boundaries & error catch blocks.

## Redaction
Implement redaction for fields flagged sensitive before output.

## Pitfalls / Anti-Patterns
- Free-form logs lacking structure.
- Excessive debug noise inflating storage costs.
- Logging stack traces to user-facing channels.

## AI Guidance
Ask: "Add structured logging to action X; diff including correlation ID propagation." Provide current action code.
