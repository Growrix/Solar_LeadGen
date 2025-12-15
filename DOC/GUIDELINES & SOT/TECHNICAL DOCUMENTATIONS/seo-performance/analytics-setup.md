# Analytics Setup

## What It Is
Framework for collecting actionable product usage metrics while respecting privacy and performance constraints.

## Why It Matters
Enables data-informed decisions, experiment tracking, and early detection of funnel issues.

## Principles
- Minimal collection: only metrics tied to decisions.
- Performance conscious: asynchronous loading.
- Privacy respect: anonymize where feasible.

## Event Taxonomy
| Event | Trigger | Properties |
|-------|--------|------------|
| user_signup | Successful account creation | plan, referrer |
| subscription_upgrade | Upgrade flow completion | oldPlan, newPlan |
| feature_flag_used | Feature toggle evaluation | flagKey, result |

## Implementation Pattern
```ts
function track(event: string, props: Record<string,unknown>){
  queueMicrotask(() => sendBeacon('/analytics', JSON.stringify({ event, props })));
}
```

## Pitfalls / Anti-Patterns
- Synchronous blocking analytics scripts.
- Unstructured event names (`clicked_button`).
- Logging PII in analytics payloads.

## AI Guidance
Ask: "Design event schema for new onboarding step; produce diff adding tracking calls without performance regression." Provide component path.
