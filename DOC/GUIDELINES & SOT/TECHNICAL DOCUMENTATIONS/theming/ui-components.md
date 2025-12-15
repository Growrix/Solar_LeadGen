# UI Components

## What It Is
Token-driven primitive and composite components forming the reusable presentation layer.

## Why It Matters
Prevents duplication, accelerates feature build-out, and enforces accessibility and theming consistency.

## Component Categories
| Category | Purpose | Examples |
|----------|---------|----------|
| Primitive | Minimal styling + semantics | `Button`, `Input`, `Badge` |
| Layout | Structure / spacing orchestration | `Stack`, `Grid`, `Card` |
| Feedback | Communicate status | `Alert`, `Toast`, `Spinner` |
| Data Display | Render structured info | `Table`, `TagList` |
| Form Composite | Input groups, validation | `ProfileForm`, `BillingForm` |

## Variant Design Rules
- Small finite set (primary, secondary, ghost, danger).
- Mode aware (light/dark adjustments baked in tokens).
- Document each variant’s semantic intent.

## Code Example (Variant Generator)
```ts
const buttonVariants = (variant: string) => {
  const base = 'inline-flex items-center font-medium focus-visible:ring';
  const map: Record<string,string> = {
    primary: 'bg-brand-500 text-onBrand hover:bg-brand-600',
    ghost: 'bg-transparent text-accent hover:bg-surface-alt',
    danger: 'bg-danger text-onDanger hover:bg-danger-emphasis'
  };
  return `${base} ${map[variant] || map.primary}`;
};
```

## Pitfalls / Anti-Patterns
- Building feature-specific variants in shared primitives.
- Inline styling for one-off states.
- Skipping a11y roles/labels.

## AI Guidance
Ask: "Add new 'outline' variant to Button; supply diff + updated tests; verify token usage." Provide existing variant map.
