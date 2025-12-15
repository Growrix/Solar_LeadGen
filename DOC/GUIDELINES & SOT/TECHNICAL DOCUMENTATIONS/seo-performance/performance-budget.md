# Performance Budget

## What It Is
Quantitative limits on resource usage and timing metrics to enforce fast user experience.

## Why It Matters
Prevents uncontrolled bloat, protects Core Web Vitals, and maintains competitive UX.

## Budget Table
| Metric | Target | Enforcement |
|--------|--------|-------------|
| LCP (mobile) | ≤ 2000ms | Lighthouse CI |
| CLS | ≤ 0.10 | Lighthouse CI |
| INP | ≤ 200ms | Field metrics (future) |
| Bundle JS (initial) | ≤ 250KB gzip | Build diff check |
| Image weight (above fold) | ≤ 100KB | Review checklist |
| API P95 latency | ≤ 400ms | Observability alerts |

## Strategies
- Code splitting & server components.
- Remove unused polyfills/legacy libs.
- Use compression (gzip/brotli) on responses.
- Prefetch data and assets for high-probability navigation paths.

## Code Example (Dynamic Import)
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false });
```

## Pitfalls / Anti-Patterns
- Shipping large UI libraries for small usage.
- Multiple competing state libraries.
- Unoptimized images (missing width/height).

## AI Guidance
Ask: "Analyze performance budget impact of adding dependency X (size Y); propose alternatives." Provide dependency stats.
