# Structured Data

## What It Is
Schema.org / JSON-LD annotations enabling enriched search results (rich snippets, knowledge panels).

## Why It Matters
Boosts SERP visibility, click-through rates, and clarifies content meaning to crawlers.

## Supported Types (Potential)
- `Product` (if plans presented as purchasable entities)
- `FAQPage` (help center or pricing FAQs)
- `BreadcrumbList` (hierarchical navigation)
- `Organization` (company profile)

## Implementation Example
```tsx
export function StructuredFAQ({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

## Best Practices
- Only add structured data reflecting visible content.
- Validate using Rich Results test.
- Avoid duplicative or irrelevant types.

## Pitfalls / Anti-Patterns
- Stuffing unrelated schema types.
- Omitting required properties (invalid markup).
- Dynamically injecting data unrelated to current page.

## AI Guidance
Ask: "Add FAQ structured data to pricing page; produce diff including component and usage." Provide existing pricing page code.
