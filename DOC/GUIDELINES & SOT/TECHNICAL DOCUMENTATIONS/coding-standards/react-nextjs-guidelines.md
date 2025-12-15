# React & Next.js Guidelines

## What It Is
Standards for authoring React components and using Next.js App Router features effectively.

## Why It Matters
Prevents performance pitfalls, reduces hydration overhead, and maintains architectural clarity.

## Best Practices
- Default to server components; add `"use client"` only when interactivity required.
- Co-locate component, test, and minimal styles; avoid sprawling imports.
- Use semantic HTML and accessible attributes (`aria-*` only when necessary).
- Keep components pure; side-effects in hooks only where unavoidable.
- Use `React.Suspense` and streaming for progressive data loading.
- Maintain stable keys (`id` or deterministic hash) for dynamic lists.
- Use `next/image` for responsive images; specify `alt` text.
- Avoid global context proliferation; prefer props or local state.

## Code Examples
```tsx
// Server component page
export default async function DashboardPage() {
  const data = await getDashboardData();
  return <Section data={data} />;
}

// Client component minimal interactivity
"use client";
export function ThemeToggle() { /* stateful logic */ }
```

## Pitfalls / Anti-Patterns
- Blanket `use client` at root layout.
- Inline fetch calls inside deeply nested components.
- Overuse of effect hooks for derived data (compute within render).
- Mutating props or global singletons.

## AI Guidance
Ask: "Refactor <Component> to server component, isolate client-only toggle subcomponent; return diff." Provide existing file path and responsibilities.
