# SEO Overview

## What It Is
Foundation of search engine optimization and performance alignment for discoverability and ranking.

## Why It Matters
Improves organic acquisition, enhances user experience, and aligns technical quality (Core Web Vitals) with marketing goals.

## Pillars
| Pillar | Focus | Examples |
|--------|-------|----------|
| Technical | Crawlability, indexation | Sitemaps, robots.txt, canonical tags |
| Content | Relevance & structure | Headings hierarchy, descriptive meta |
| Performance | CWV metrics | LCP, CLS, INP |
| Accessibility | Usable for all | Alt text, semantic landmarks |
| Structured Data | Enhanced SERP features | JSON-LD schema |

## Best Practices
- Unique title + meta description per route.
- Canonical URLs for duplicate-prone pages.
- Avoid blocking critical resources in `robots.txt`.
- Lazy-load non-critical images below the fold.
- Leverage Next.js dynamic metadata API.

## Code Example (Route Metadata)
```ts
export const metadata = { title: 'Dashboard', description: 'Overview of your account performance' };
```

## Pitfalls / Anti-Patterns
- Reusing generic titles across pages.
- Client-only rendering of critical above-the-fold content.
- Large CLS shifts due to late image sizing.

## AI Guidance
Ask: "Optimize metadata and headings for page X; supply diff with improved semantic structure and performance hints." Provide current file.
