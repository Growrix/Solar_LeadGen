# Next.js SEO Guidelines

## What It Is
Conventions for leveraging Next.js App Router features to produce SEO-friendly, performant pages.

## Why It Matters
Ensures search engines can efficiently index content while maintaining strong Core Web Vitals.

## Dynamic Metadata
- Use `generateMetadata` for parameterized routes.
```ts
export async function generateMetadata({ params }){
  const data = await getPost(params.slug);
  return { title: data.title, description: data.summary, alternates: { canonical: `/blog/${params.slug}` } };
}
```

## Routing & Structure
- Keep shallow hierarchical paths (`/blog/post-slug`).
- Provide breadcrumb structure within content if deep nesting.

## Images
- Use `next/image` with width/height specified to prevent layout shifts.
- Serve modern formats (WebP/AVIF) automatically.

## Internationalization (Future)
- Use locale segments (`/en/`, `/fr/`) when i18n introduced; ensure hreflang generation.

## Performance Integration
- Preload critical fonts using Next.js font optimization.
- Stateless server components for above-fold content.

## Pitfalls / Anti-Patterns
- Excessive dynamic client rendering delaying LCP.
- Missing canonical tags causing duplicate indexing.
- Overuse of query parameters for content differentiation.

## AI Guidance
Ask: "Refactor metadata in route X to use generateMetadata with canonical & open graph; provide diff." Provide current route component.
