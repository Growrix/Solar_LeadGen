# Phase 0: Research & Best Practices

**Feature**: Centralized Design Token System  
**Date**: January 28, 2025  
**Status**: Complete

---

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context and provides best practices for a centralized design token system using CSS Variables (shadcn-compatible) with Tailwind CSS and TypeScript in a Next.js application.

---

## Research Tasks

0. CSS Variable Token Strategy (Shadcn-Compatible)

Decision: Maintain our TypeScript semantic tokens as the source of truth while exposing a shadcn-compatible CSS variable layer in `src/app/globals.css`. Variables use HSL triplets and names: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--destructive-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--radius`.

Tailwind maps variables via `theme.extend.colors` to utilities like `bg-primary`, `text-foreground`, and `ring-ring`. This allows shadcn/ui components to theme correctly while our existing token files remain intact.

### 1. Visual Regression Testing Tool Selection

**Task**: Which visual regression tool is preferred for this project? (Chromatic, Percy, or Loki)

**Research**:

| Tool | Pros | Cons | Best For |
|------|------|------|----------|
| **Chromatic** | - GitHub/Storybook integration<br>- Cloud-hosted (no infra)<br>- Free tier (5k snapshots/month)<br>- UI review workflow<br>- Parallel testing | - Requires Storybook<br>- Paid for larger teams | Teams using Storybook + GitHub |
| **Percy** | - Multiple framework support<br>- Browser support (Chrome, Firefox, Safari)<br>- CI/CD integration<br>- Free tier (5k snapshots/month) | - Separate service (not Storybook-only)<br>- More setup required | Multi-platform testing |
| **Loki** | - Free (open source)<br>- Docker-based (local control)<br>- Storybook integration<br>- No cloud dependency | - Self-hosted (infra burden)<br>- Manual baseline management<br>- Slower parallel testing | Budget-conscious teams |

**Decision**: **Chromatic**

**Rationale**:
1. **Already using Storybook**: Chromatic is the official Storybook visual testing tool (seamless integration)
2. **GitHub workflow**: This project uses GitHub (Chromatic has native GitHub PR checks)
3. **Free tier sufficient**: 5,000 snapshots/month covers ~40 pages × 3 themes × 3 breakpoints = ~360 snapshots per test run (under limit)
4. **Cloud-hosted**: No infrastructure to maintain (vs Loki's Docker containers)
5. **Team collaboration**: Built-in UI review workflow for stakeholder approval (matches Phase 1 approval gate)

**Alternatives Considered**:
- **Percy**: Better for multi-browser testing, but this project only needs Chrome (Tailwind CSS handles cross-browser)
- **Loki**: Free but requires Docker infra + manual baseline management (too much overhead for this refactoring project)

**Implementation**:
```bash
npm install --save-dev chromatic
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```

**Configuration**: Add to `.storybook/main.ts`:
```typescript
export default {
  addons: ['@storybook/addon-a11y', 'chromatic'],
};
```

---

### 2. Design Token File Structure Best Practices

**Task**: How should design tokens be organized in TypeScript for maximum maintainability and type safety?

**Research**:

**Industry Standards** (from design system leaders: Shopify Polaris, Material Design, Tailwind CSS):

1. **Separate Primitive vs Semantic Tokens**:
   - **Primitive**: Raw values (e.g., `teal-600: #0d9488`)
   - **Semantic**: Meaningful names (e.g., `primary: teal-600`)
   - **Why**: Rebrand by changing semantic mappings, not primitives

2. **Theme Variants at Token Level**:
   - Store light/dark variants together (not separate files)
   - **Example**: `{ light: '#0d9488', dark: '#14b8a6' }`
   - **Why**: Single source of truth, no sync issues

3. **TypeScript Interfaces for Type Safety**:
   - Define token schemas as interfaces
   - Export typed objects (not plain objects)
   - **Why**: Catch typos at compile time, IntelliSense support

4. **Responsive Token Naming**:
   - Explicit breakpoint suffixes (`mobile`, `tablet`, `desktop`)
   - **Why**: Clear intent, no magic numbers

**Decision**: **Two-Tier Token System (Primitive + Semantic) + CSS Variables Surface**

**File Structure**:
```
src/design-tokens/
├── primitives/              # Raw values (rarely changed)
│   ├── colors.ts           # Color palette (teal-600, gray-900, etc.)
│   ├── fontSizes.ts        # Font size scale (12px, 14px, 16px, etc.)
│   └── spacingScale.ts     # Spacing scale (4px, 8px, 12px, etc.)
├── semantic/                # Meaningful names (changed for rebrand)
│   ├── colors.ts           # primary, secondary, success, error
│   ├── typography.ts       # heading-1, body, caption
│   └── spacing.ts          # card-padding, form-gap, section-margin
├── types.ts                 # TypeScript interfaces
└── index.ts                 # Barrel export
```

**Rationale**:
- **Primitive tokens** = design system foundation (change once per year)
- **Semantic tokens** = business context (change for rebrand, A/B testing)
- **Separation** = rebrand by remapping semantics (e.g., `primary: blue-600` instead of `primary: teal-600`)

**Example** (`src/design-tokens/semantic/colors.ts`):
```typescript
import { primitives } from '../primitives/colors';

export const colors = {
  primary: {
    light: primitives.teal[600],
    dark: primitives.teal[400],
  },
  secondary: {
    light: primitives.amber[400],
    dark: primitives.amber[300],
  },
  background: {
    light: primitives.white,
    dark: primitives.gray[900],
  },
} as const;

export type ColorTokens = typeof colors;
```

Add a CSS Variable bridge in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ...other tokens... */
}
html[data-theme="dark"] {
  --background: 222.2 47.4% 11.2%;
  --foreground: 0 0% 100%;
}
```

### 3. Tailwind CSS Integration Strategy

**Task**: How to integrate design tokens with Tailwind CSS without breaking existing utility classes?

**Research**:

**Tailwind Extension Methods**:

1. **`theme.extend`** (Recommended):
   - Adds custom tokens WITHOUT removing default Tailwind classes
   - **Example**: `theme.extend.colors = { primary: '#0d9488' }`
   - **Result**: Both `bg-primary` and `bg-teal-600` work

2. **`theme`** (Replace):
   - Replaces default Tailwind values entirely
   - **Example**: `theme.colors = { primary: '#0d9488' }`
   - **Result**: ONLY `bg-primary` works, `bg-teal-600` breaks

**Decision**: **Use `theme.extend` for ALL tokens**, mapping CSS variables where available: `background: 'hsl(var(--background))'` etc. Keep semantic tokens from TS for backward compatibility during migration.

**Rationale**:
1. **Gradual migration**: Existing `bg-teal-600` classes keep working during refactoring
2. **Backward compatibility**: No breaking changes for unrefactored pages
3. **Rollback safety**: Can revert changes without breaking entire app
4. **Testing flexibility**: Can A/B test new tokens vs old hardcoded values

**Configuration** (`tailwind.config.js`):
```javascript
const { colors, typography, spacing } = require('./src/design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: colors,           // Adds bg-primary, keeps bg-teal-600
      fontSize: typography.sizes, // Adds text-heading-1, keeps text-2xl
      spacing: spacing,          // Adds p-card-padding, keeps p-6
    },
  },
};
```

**Alternative Rejected**: `theme` (replace) would break 450+ existing classes immediately (unacceptable for production app).

---

### 4. Recharts Color Integration

**Task**: How to integrate design tokens with Recharts data visualization library?

**Research**:

**Recharts Color Prop Pattern**:
- Recharts components accept `fill`, `stroke`, `color` props
- Props must be **CSS color values** (hex, rgb, hsl), NOT Tailwind classes
- **Problem**: Design tokens are Tailwind classes, not color values

**Solution Patterns**:

1. **Export Hex Values** (Simple):
   ```typescript
   export const chartColors = {
     primary: '#0d9488',
     success: '#10b981',
   };
   ```
   - **Pros**: Works directly with Recharts
   - **Cons**: Duplicates color definitions (tokens + hex values)

2. **Theme-Aware Hook** (Recommended):
   ```typescript
   export const useChartColors = () => {
     const { theme } = useTheme();
     return {
       primary: theme === 'dark' ? '#14b8a6' : '#0d9488',
       success: theme === 'dark' ? '#34d399' : '#10b981',
     };
   };
   ```
   - **Pros**: Single source of truth, theme-aware
   - **Cons**: Requires hook usage (client component)

**Decision**: **Theme-Aware Hook (`useChartColors`)**

**Rationale**:
1. **Single source of truth**: Color values come from design tokens (no duplication)
2. **Theme support**: Charts automatically adapt to light/dark mode
3. **Type safety**: Hook returns typed color object (IntelliSense support)
4. **Reusability**: All charts use same hook (consistent colors)

**Implementation** (`src/hooks/useChartColors.ts`):
```typescript
import { useTheme } from '@/components/ThemeProvider';
import { colors } from '@/design-tokens';

export const useChartColors = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    primary: isDark ? colors.primary.dark : colors.primary.light,
    secondary: isDark ? colors.secondary.dark : colors.secondary.light,
    success: isDark ? colors.success.dark : colors.success.light,
    warning: isDark ? colors.warning.dark : colors.warning.light,
    error: isDark ? colors.error.dark : colors.error.light,
  };
};
```

**Usage Example**:
```tsx
const DashboardChart = () => {
  const chartColors = useChartColors();
  
  return (
    <BarChart data={data}>
      <Bar dataKey="value" fill={chartColors.primary} />
    </BarChart>
  );
};
```

---

### 5. Mobile-First Responsive Token Strategy

**Task**: How to structure responsive design tokens (mobile/tablet/desktop) for Tailwind CSS?

**Research**:

**Responsive Patterns in Tailwind**:

1. **Responsive Utility Classes**:
   - Pattern: `text-sm md:text-base lg:text-lg`
   - **Pros**: Native Tailwind, no custom config
   - **Cons**: Verbose, easy to forget breakpoint modifiers

2. **Custom Responsive Tokens**:
   - Pattern: Define separate mobile/tablet/desktop tokens in config
   - **Example**: `p-mobile-md`, `p-tablet-md`, `p-desktop-md`
   - **Pros**: Explicit breakpoint intent
   - **Cons**: More verbose class names

3. **Semantic Responsive Tokens** (Recommended):
   - Pattern: Semantic names that imply responsive behavior
   - **Example**: `p-card-padding` → `12px mobile, 16px tablet, 24px desktop`
   - **Pros**: Clean class names, responsive by default
   - **Cons**: Requires custom Tailwind plugin

**Decision**: **Hybrid Approach (Semantic + Explicit Responsive)**

**Rationale**:
1. **Semantic for common patterns**: `p-card-padding`, `space-y-form-gap` (responsive by default)
2. **Explicit for custom**: `p-mobile-md lg:p-desktop-lg` (when semantic doesn't fit)
3. **Best of both**: Clean names for 80% of cases, explicit control for edge cases

**Token Structure** (`src/design-tokens/semantic/spacing.ts`):
```typescript
export const spacing = {
  // Semantic responsive (auto-responsive via Tailwind plugin)
  'card-padding': {
    DEFAULT: '12px',    // Mobile (< 640px)
    md: '16px',         // Tablet (640px - 1024px)
    lg: '24px',         // Desktop (> 1024px)
  },
  'form-gap': {
    DEFAULT: '12px',
    md: '16px',
    lg: '20px',
  },
  
  // Explicit responsive (manual breakpoint modifiers)
  'mobile-xs': '4px',
  'mobile-sm': '8px',
  'mobile-md': '12px',
  'mobile-lg': '16px',
  'desktop-sm': '12px',
  'desktop-md': '16px',
  'desktop-lg': '24px',
  'desktop-xl': '32px',
};
```

**Tailwind Configuration** (with responsive plugin):
```javascript
const plugin = require('tailwindcss/plugin');

module.exports = {
  theme: {
    extend: {
      spacing: spacing,
    },
  },
  plugins: [
    plugin(function({ addUtilities, theme }) {
      const responsiveSpacing = theme('spacing');
      const newUtilities = {};

      Object.entries(responsiveSpacing).forEach(([key, value]) => {
        if (typeof value === 'object' && value.DEFAULT) {
          newUtilities[`.p-${key}`] = {
            padding: value.DEFAULT,
            '@screen md': { padding: value.md },
            '@screen lg': { padding: value.lg },
          };
        }
      });

      addUtilities(newUtilities, ['responsive']);
    }),
  ],
};
```

**Usage Examples**:
```tsx
// Semantic (responsive by default)
<Card className="p-card-padding space-y-form-gap" />

// Explicit (manual breakpoints)
<Modal className="p-mobile-md lg:p-desktop-lg" />
```

---

### 6. Storybook Theme Switching

- Import global CSS in `.storybook/preview.ts`.
- Provide a theme toolbar using a decorator (or `@storybook/addon-themes`).
- Verify Light (current) and keep Dark/Brand configs staged but not enabled by default (one-theme-first).

## Best Practices Summary

### 1. Design Token Organization
✅ **DO**:
- Use two-tier system (primitive + semantic)
- Store light/dark variants together
- Export typed objects with TypeScript interfaces
- Use `const` assertions for type inference

❌ **DON'T**:
- Mix primitive and semantic in same file
- Store themes in separate files (sync issues)
- Use plain objects (no type safety)

### 2. Tailwind Integration
✅ **DO**:
- Use `theme.extend` (not `theme` replace)
- Keep existing Tailwind classes working
- Test tokens in isolation before migration
- Document custom token naming conventions

❌ **DON'T**:
- Replace default Tailwind values (breaks existing code)
- Use cryptic token names (e.g., `c1`, `s2`)
- Create tokens for every single value (keep Tailwind defaults for standard values)

### 3. Component Migration
✅ **DO**:
- Migrate one component at a time
- Test in Storybook before real app
- Use visual regression testing (Chromatic)
- Complete QA checklist per component

❌ **DON'T**:
- Batch refactor multiple components
- Skip Storybook testing
- Trust manual testing alone (use automation)
- Commit without QA approval

### 4. Responsive Design
✅ **DO**:
- Design for mobile first (320px base)
- Use semantic responsive tokens for common patterns
- Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
- Maintain touch target size (44px+ on mobile)

❌ **DON'T**:
- Design desktop first (wrong direction)
- Use only explicit responsive classes (verbose)
- Skip mobile testing (biggest user segment)
- Use small touch targets on mobile (<44px)

### 5. Data Visualization
✅ **DO**:
- Use theme-aware hooks for chart colors
- Export hex values from design tokens
- Test charts in both light and dark themes
- Document chart color usage patterns

❌ **DON'T**:
- Hardcode chart colors
- Duplicate color definitions (tokens + charts)
- Forget dark mode chart testing

---

## Next Steps (Phase 1)

1. **Create Token Files** (4 hours):
   - `src/design-tokens/primitives/colors.ts`
   - `src/design-tokens/primitives/fontSizes.ts`
   - `src/design-tokens/primitives/spacingScale.ts`
   - `src/design-tokens/semantic/colors.ts`
   - `src/design-tokens/semantic/typography.ts`
   - `src/design-tokens/semantic/spacing.ts`
   - `src/design-tokens/types.ts`
   - `src/design-tokens/index.ts`

2. **Create Utility Hooks** (2 hours):
   - `src/hooks/useThemeColors.ts`
   - `src/hooks/useChartColors.ts`
   - `src/hooks/useResponsiveSpacing.ts`

3. **Configure Tailwind** (1 hour):
   - Update `tailwind.config.js` with token imports
   - Add responsive spacing plugin
   - Test build (ensure no errors)

4. **Setup Storybook** (2 hours):
   - Install Storybook: `npx storybook@latest init`
   - Install Chromatic: `npm install --save-dev chromatic`
   - Configure theme decorator (`.storybook/preview.ts`)
   - Create sample stories (Colors, Typography, Spacing)

5. **Validate Tokens** (3 hours):
   - Build sample page using ALL tokens
   - Test in Storybook (all themes, all breakpoints)
   - Run Chromatic baseline capture
   - Get stakeholder approval

**Total Phase 1 Time**: 12 hours (1.5 days)

**Approval Gate**: Stakeholder reviews token system + sample page in Storybook and approves before Phase 3 migration begins.

---

## Open Questions (None Remaining)

All "NEEDS CLARIFICATION" items from Technical Context have been resolved:
- ✅ Visual regression tool: **Chromatic** selected
- ✅ Token structure: **Two-tier (primitive + semantic)** decided
- ✅ Tailwind integration: **`theme.extend`** strategy confirmed
- ✅ Recharts integration: **Theme-aware hook** pattern established
- ✅ Responsive tokens: **Hybrid (semantic + explicit)** approach defined

**Status**: Ready to proceed to Phase 1 (data-model.md generation)
