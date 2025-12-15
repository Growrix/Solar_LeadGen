# UI/UX Layout & Routing Standards
Purpose: Canonical standards for layouts, routing, components, theming, and validation across all apps (Homeowner, Installer, Admin). Aligned with the Design System SOT and multi-theme (Dark, Light, Purple).

---

## Core Principles
- Consistency: Structural vs elevated surfaces are clearly separated.
- Semantic-Only: No hardcoded colors, no inline styles, no dark: prefixes.
- Accessibility: WCAG 2.1 AA; keyboard-first; semantic HTML.
- Multi-Theme: All designs must pass Dark, Light, and Purple themes.
- App Router First: Clear boundaries between marketing and dashboard experiences.

---

## Layout Standards

### Dashboard Page Layout (Installer/Homeowner Pattern - SOT)
**Standard:** Dashboard pages under `(dashboard)` folder should follow this minimal pattern (lead feed page is the reference):

#### Pattern 1: Component-Based (Preferred for Complex Pages)
```tsx
// ✅ CORRECT: Delegate to component (best for reusable/complex UIs)
'use client';

import { useState, useEffect } from 'react';
import YourMainComponent from '@/components/YourMainComponent';

export default function DashboardPage() {
  // ... data fetching logic
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-error mb-4">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <YourMainComponent data={data} />
      <SupportingModals />
    </>
  );
}
```

#### Pattern 2: Direct Rendering (For Simpler Pages)
```tsx
// ✅ CORRECT: Render directly with internal spacing container
'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  // ... data fetching logic
  
  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-neu-outset p-6 animate-pulse">
            <div className="h-8 bg-muted/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted/20 rounded w-2/3"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-error/10 border border-error/20 rounded-xl p-6">
          <p className="text-body text-error">Error message</p>
          <button onClick={retry} className="mt-4 btn-primary">Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-heading-1 text-foreground mb-2">Page Title</h1>
          <p className="text-body text-muted">Page description</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border shadow-neu-outset">
            {/* stat card content */}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-surface rounded-lg p-6 border border-border shadow-neu-outset">
          {/* main content */}
        </div>
      </div>
    </>
  );
}
```

**Key Rules:**
- **NO** `min-h-screen` wrapper - inherited from `(dashboard)/layout.tsx`
- **NO** `bg-background text-foreground` wrapper - inherited from layout
- **NO** `p-4 sm:p-6 md:p-8` padding wrapper on the page - layout provides chrome spacing
- **YES** Use React fragments `<>...</>` for the page return wrapper
- **YES** Components manage their own internal spacing and structure
- **YES** Use `<div className="space-y-6">` as inner container if rendering multiple sections directly (Pattern 2)
- The `(dashboard)/layout.tsx` provides the structural background, padding, and chrome

**Why This Pattern:**
- Eliminates duplicate wrappers (layout already provides bg/padding)
- Keeps pages clean and focused on content
- Components are self-contained with their own spacing
- Consistent across all dashboard pages
- Inner `space-y-6` container provides section spacing when needed without duplicating layout styles

**Examples:**
- **leads/page.tsx** (SOT): Pattern 1 - `<> <InstallerLeadFeed /> </>`
- **purchased-leads/page.tsx**: Pattern 2 - `<> <div className="space-y-6">...</div> </>`
- **profile/page.tsx**: Pattern 2 - `<> <div className="space-y-6">...</div> </>`

### Admin Dashboard Page Layout (Different Pattern)
**Standard:** Admin pages may use a wrapper for additional control:

```tsx
// ✅ Admin pattern (when needed)
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-heading-1">Page Title</h1>
        <p className="text-muted">Description</p>
      </div>
      {/* content */}
    </div>
  );
}
```

**Note:** Use admin pattern only when admin layout doesn't provide these styles.

### Component Standards
- Structural Surfaces: Use `bg-background` for body, header, sidebar, and shell layouts.
- Elevated Surfaces: Use `bg-surface` for cards, panels, modals, inputs, menus.
- Borders & Text: Use `border-border`, `text-foreground`, `text-body`, `text-muted`.
- Shadows: Prefer `shadow-neu-outset`, `shadow-neu-outset-md`, `shadow-neu-inset`.
- Buttons: Use the shared `Button` component; do not re-style native `<button>`.
- Spacing: Use Tailwind spacing scale; avoid ad-hoc pixel values.
- Z-Layers: Use `z-modal` for modal stacks; avoid ad-hoc `z-[...]` unless tokenized.
- Backdrops: Use `bg-background/80` or `/90` with `backdrop-blur-sm|md` for overlays.

Background Decision Tree (from SOT):
- Structural (body, header, sidebar) → `bg-background`
- Elevated (cards, modals, inputs) → `bg-surface`
- Hover/Active → `hover:bg-surface-hover` or `hover:shadow-neu-outset-lg`

---

## Routing Standards (Next.js App Router)
- Route Groups: Use parentheses to separate marketing vs dashboard shells.
  - Example (Installers):
    - Marketing: `src/app/installer/page.tsx`, minimal `src/app/installer/layout.tsx`
    - Dashboard: `src/app/installer/(dashboard)/layout.tsx` with sidebar/header
    - Dashboard pages: under `src/app/installer/(dashboard)/**`
- Layout Boundaries:
  - Never include dashboard chrome in the marketing route layout.
  - All dashboard navigation lives in `(dashboard)/layout.tsx` only.
- URLs & Redirects:
  - Default Installer landing after auth: `/installer/leads` (not `/installer/dashboard`).
  - Update OAuth `callbackUrl` and internal links accordingly.
  - Middleware-based RBAC: role-gate dashboard routes and redirect out-of-scope roles to the correct landing page.
- Dynamic Routes: Place under the appropriate group (marketing vs dashboard) to inherit the correct chrome.
- Data Fetching: Favor server components for dashboard pages; only use client components where interactivity is required.

---

## Component Standards
- Naming: PascalCase for components; 1 file = 1 component when feasible.
- Structure: Keep components presentational by default; move business logic to hooks or server.
- Tokens Only:
  - Backgrounds: `bg-background`, `bg-surface`, `bg-accent` (accented surfaces only)
  - Borders: `border-border`, semantic variants via opacity (e.g., `border-success/30`)
  - Text: `text-foreground`, `text-body`, `text-muted`, `text-icon`
  - Status: `text-success`, `text-warning`, `text-error`, `text-info` (from SOT variables)
- Buttons/Links:
  - Use the shared `Button` and link helpers; do not add `as` to native tags.
  - Variants reside in the component; do not copy button class stacks.
- Modals:
  - Backdrop: `fixed inset-0 bg-background/80 backdrop-blur-sm z-modal`
  - Panel: `bg-surface border border-border shadow-neu-outset rounded-xl`
  - Sticky header/footer: use `border-b`/`border-t` with `border-border`
  - Focus management and ESC/overlay dismissal must be implemented.
- Forms:
  - Inputs: `bg-surface border border-border text-foreground focus:border-primary focus:ring-primary/20`
  - Validation: Visual feedback via status tokens; ARIA attributes for errors.

---

## Theming & Tokens
- Multi-Theme Compliance: All components must render correctly in Dark, Light, Purple.
- Prohibitions:
  - No `dark:` classes
  - No hardcoded `text-white`, `bg-black`, `rgba()`, or `#hex` values
  - No hardcoded blue/green/red/etc. scales
- Status Tokens: Ensure `--color-error`, `--color-success`, `--color-warning`, `--color-info` are used via semantic classes.
- Typography: Use semantic text classes (`text-body`, `text-muted`) instead of `text-sm|lg|xl` unless governed by tokens.

---

## Accessibility
- Semantics: Use appropriate landmarks (`header`, `nav`, `main`, `footer`).
- Keyboard: Tabbing order logical; modal focus trap; ESC closes when appropriate.
- Contrast: Validate AA for text and UI elements across all themes.
- ARIA: Announce modal open, form errors, loading states.

---

## Responsive Standards
- Breakpoints: Validate at 320, 375, 768, 1024, 1440 px.
- Layout:
  - Use responsive utilities for spacing and grids; avoid manual `sm:text-`, `md:text-`, etc., unless tokenized and necessary.
  - Sidebars collapse thoughtfully; bottom navs appear for mobile dashboards when specified.

---

## Validation & Verification
- GATE 0: Run the design system health check prior to migrations (see `specs/007-migration-and-build/plan.md`).
- Component Tree Mapping: Verify main file AND all child components.
- Required Hardcoded-Value Checks (run ALL; expect 0/0/0/0/0/0):

```powershell
# 1) Gray/slate/zinc hardcoded colors
Select-String -Path "src\components\**\*.tsx" -Pattern "text-gray-|text-slate-|text-zinc-|bg-gray-|bg-slate-|bg-zinc-|border-gray-|border-slate-"

# 2) ALL dark: prefixes
Select-String -Path "src\components\**\*.tsx" -Pattern "dark:text-|dark:bg-|dark:border-"

# 3) Hardcoded RGB/RGBA/HEX (excluding SVG)
Select-String -Path "src\components\**\*.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" }

# 4) Hardcoded white/black
Select-String -Path "src\components\**\*.tsx" -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b|border-white\b"

# 5) Hardcoded color names
Select-String -Path "src\components\**\*.tsx" -Pattern "bg-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|text-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]|border-(blue|green|red|yellow|purple|pink|orange|indigo|teal|cyan)-[0-9]"

# 6) Hardcoded typography
Select-String -Path "src\components\**\*.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold|font-medium"
```

- Migration Workflow: Follow the 13-step process in `specs/007-migration-and-build/plan.md`. Report 0/0/0/0/0/0 before marking complete.

---

## Examples

Marketing vs Dashboard (Installers):

```
src/app/installer/layout.tsx              # minimal shell, no sidebar/header
src/app/installer/page.tsx                # marketing homepage (no dashboard chrome)
src/app/installer/(dashboard)/layout.tsx  # dashboard chrome (sidebar/header/bottom nav)
src/app/installer/(dashboard)/leads/page.tsx
src/app/installer/(dashboard)/marketplace/page.tsx
```

Modal Shell:

```tsx
export function ExampleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center px-4 py-6">
      <div role="dialog" aria-modal="true" className="bg-surface border border-border rounded-xl shadow-neu-outset max-w-lg w-full">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4">
          <h2 className="text-foreground text-body">Title</h2>
        </div>
        <div className="px-6 py-5">Content</div>
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
```

---

## Enforcement
- Code Review: Reject PRs with hardcoded styles or layout boundary violations.
- CI: Add verification commands to a pre-merge job; fail on any non-zero results.
- Documentation: Keep this file and the SOT updated as tokens evolve.
