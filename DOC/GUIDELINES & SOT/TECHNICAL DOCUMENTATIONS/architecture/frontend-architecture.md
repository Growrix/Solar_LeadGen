# Frontend Architecture

## What It Is
Structure and patterns governing UI composition, routing, state, styling, and accessibility in Next.js App Router.

## Why It Matters
Promotes consistency, minimizes bundle size, improves maintainability, and enforces accessibility and theme compliance.

## Folder Structure
```
app/
  (marketing)/
  dashboard/
    layout.tsx
    page.tsx
  settings/
components/
  ui/ (tokens-based primitives)
  forms/
  charts/
```

## Component Types
| Type | Traits | Example |
|------|--------|---------|
| Layout | Structural, server components | `app/dashboard/layout.tsx` |
| Page | Entry route, minimal logic | `app/settings/page.tsx` |
| UI Primitive | Reusable semantic tokens | `components/ui/Button.tsx` |
| Composite | Assembles primitives + minimal business glue | `components/forms/ProfileForm.tsx` |

## Styling Rules
- Tokens first: semantic classes (`bg-surface`, `text-accent`).
- No hardcoded hex codes.
- Variant logic isolated (e.g., `buttonVariants(type)` function returns class set).

## State Management
- Prefer server actions & React server components.
- Local state via `useState` / `useReducer` only for ephemeral UI.
- Avoid global state libraries unless ADR approved.

## Code Example (Token-based Button)
```tsx
export function Button({ variant = "primary", ...props }) {
  const base = "inline-flex items-center font-medium focus:outline-none focus-visible:ring";
  const variants: Record<string,string> = {
    primary: "bg-brand text-onBrand hover:bg-brand-emphasis",
    ghost: "bg-transparent text-accent hover:bg-surface-alt"
  };
  return <button className={`${base} ${variants[variant]}`} {...props} />;
}
```

## Accessibility Practices
- Use native elements first (button vs div).
- Associate labels with inputs (`htmlFor`).
- Manage focus order; trap where necessary in modals.

## Performance
- Avoid large client-only libraries; lazy load non-critical charts.
- Leverage `next/image` for media assets.

## Pitfalls / Anti-Patterns
- Colocating business logic with UI markup
- Overusing client components causing hydration overhead
- Inline style overrides for theme values

## AI Guidance
Ask: "Need token-compliant form component reusing Button and Input; diff only; paths: X,Y. Include a11y checks." Provide current token names.
