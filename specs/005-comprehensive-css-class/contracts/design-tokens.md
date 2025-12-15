# Design Token Contract

**Feature**: 005-comprehensive-css-class  
**Dependencies**: Feature 004 (Design Token System)

---

## Overview

This contract defines how Feature 004 design tokens are mapped to Feature 005 shadcn/ui CSS variables and enforces naming conventions.

---

## Token Mapping

### Color Tokens (Feature 004 → shadcn CSS Variables)

| Feature 004 Token | Tailwind Class | shadcn CSS Variable | HSL Value (Light) | HSL Value (Dark) |
|------------------|----------------|---------------------|-------------------|------------------|
| Primary (Teal-600) | `bg-primary` | `--primary` | `174 100% 29%` | `174 100% 35%` |
| Primary Foreground | `text-primary-foreground` | `--primary-foreground` | `0 0% 100%` | `222.2 47.4% 11.2%` |
| Background | `bg-background` | `--background` | `0 0% 100%` | `222.2 84% 4.9%` |
| Foreground | `text-foreground` | `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` |
| Card | `bg-card` | `--card` | `0 0% 100%` | `222.2 84% 4.9%` |
| Card Foreground | `text-card-foreground` | `--card-foreground` | `222.2 84% 4.9%` | `210 40% 98%` |
| Secondary | `bg-secondary` | `--secondary` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| Secondary Foreground | `text-secondary-foreground` | `--secondary-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` |
| Muted | `bg-muted` | `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| Muted Foreground | `text-muted-foreground` | `--muted-foreground` | `215.4 16.3% 46.9%` | `215 20.2% 65.1%` |
| Accent | `bg-accent` | `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` |
| Accent Foreground | `text-accent-foreground` | `--accent-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` |
| Destructive | `bg-destructive` | `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| Destructive Foreground | `text-destructive-foreground` | `--destructive-foreground` | `0 0% 100%` | `210 40% 98%` |
| Border | `border-border` | `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` |
| Input | `border-input` | `--input` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` |
| Ring (Focus) | `ring-ring` | `--ring` | `174 100% 29%` | `174 100% 35%` |

### Typography Tokens (FR-026 to FR-031)

| Semantic Token | HTML Tag | Tailwind Classes | Font Size (Mobile) | Font Size (Desktop) | Font Weight | Line Height |
|---------------|----------|------------------|-------------------|---------------------|-------------|-------------|
| `text-heading-1` | `<h1>` | `text-4xl lg:text-5xl font-bold leading-tight tracking-tight` | 24px | 36px | 700 | 1.25 |
| `text-heading-2` | `<h2>` | `text-3xl lg:text-4xl font-bold leading-tight tracking-tight` | 20px | 30px | 700 | 1.25 |
| `text-heading-3` | `<h3>` | `text-2xl lg:text-3xl font-semibold leading-snug tracking-normal` | 18px | 24px | 600 | 1.35 |
| `text-heading-4` | `<h4>` | `text-xl lg:text-2xl font-semibold leading-snug tracking-normal` | 16px | 20px | 600 | 1.35 |
| `text-body-large` | `<p>` | `text-base lg:text-lg font-normal leading-relaxed` | 16px | 18px | 400 | 1.5 |
| `text-body` | `<p>` | `text-sm lg:text-base font-normal leading-relaxed` | 14px | 16px | 400 | 1.5 |
| `text-body-small` | `<p>`, `<span>` | `text-xs lg:text-sm font-normal leading-normal` | 12px | 14px | 400 | 1.5 |
| `text-caption` | `<span>`, `<small>` | `text-xs font-normal leading-none text-muted-foreground` | 12px | 12px | 400 | 1 |
| `text-label` | `<label>` | `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70` | 14px | 14px | 500 | 1 |
| `text-button` | `<button>` | `text-sm font-medium leading-none` | 14px | 14px | 500 | 1 |

### Spacing Tokens (FR-032 to FR-034)

shadcn/ui uses Tailwind's default spacing scale (4px base unit):

| Semantic Token | Tailwind Class | Pixels | Usage |
|---------------|----------------|--------|-------|
| `space-1` | `p-1`, `m-1`, `gap-1` | 4px | Tight spacing (badge padding) |
| `space-2` | `p-2`, `m-2`, `gap-2` | 8px | Compact spacing (icon margins) |
| `space-3` | `p-3`, `m-3`, `gap-3` | 12px | Standard spacing (button padding) |
| `space-4` | `p-4`, `m-4`, `gap-4` | 16px | Comfortable spacing (card padding) |
| `space-6` | `p-6`, `m-6`, `gap-6` | 24px | Generous spacing (section padding) |
| `space-8` | `p-8`, `m-8`, `gap-8` | 32px | Large spacing (page sections) |
| `space-12` | `p-12`, `m-12`, `gap-12` | 48px | XL spacing (page headers) |

### Shadow Tokens (FR-035 to FR-036)

| Semantic Token | Tailwind Class | CSS Value | Usage |
|---------------|----------------|-----------|-------|
| `shadow-sm` | `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation (input fields) |
| `shadow` | `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Default elevation (cards) |
| `shadow-md` | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Medium elevation (dropdowns) |
| `shadow-lg` | `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | High elevation (modals) |
| `shadow-xl` | `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Maximum elevation (popups) |

### Border Radius Tokens (FR-036)

| Semantic Token | Tailwind Class | Pixels | Usage |
|---------------|----------------|--------|-------|
| `rounded-sm` | `rounded-sm` | 2px | Subtle rounding (badges) |
| `rounded` | `rounded` | 4px | Default rounding (buttons) |
| `rounded-md` | `rounded-md` | 6px | Medium rounding (inputs) |
| `rounded-lg` | `rounded-lg` | 8px | Large rounding (cards) |
| `rounded-xl` | `rounded-xl` | 12px | XL rounding (modals) |
| `rounded-full` | `rounded-full` | 9999px | Full rounding (avatars, pills) |

### Icon Size Tokens (FR-037)

| Semantic Token | Tailwind Classes | Pixels | Usage |
|---------------|-----------------|--------|-------|
| `icon-xs` | `h-3 w-3` | 12px | Badge icons |
| `icon-sm` | `h-4 w-4` | 16px | Button icons |
| `icon-md` | `h-5 w-5` | 20px | Card icons |
| `icon-lg` | `h-6 w-6` | 24px | Header icons |
| `icon-xl` | `h-8 w-8` | 32px | Hero icons |

### Animation Duration Tokens (FR-038)

| Semantic Token | Tailwind Class | Milliseconds | Usage |
|---------------|----------------|--------------|-------|
| `duration-fast` | `duration-150` | 150ms | Quick feedback (hover, focus) |
| `duration-normal` | `duration-200` | 200ms | Standard transitions (buttons, cards) |
| `duration-slow` | `duration-300` | 300ms | Complex animations (modals, accordions) |

### Transition Type Tokens (FR-038)

| Semantic Token | Tailwind Class | Properties | Usage |
|---------------|----------------|------------|-------|
| `transition-colors` | `transition-colors` | color, background-color, border-color | Color changes (hover states) |
| `transition-shadow` | `transition-shadow` | box-shadow | Shadow changes (elevation) |
| `transition-transform` | `transition-transform` | transform | Position/scale changes (modals) |
| `transition-opacity` | `transition-opacity` | opacity | Fade in/out effects |

---

## Tailwind Config Extension

### Custom Typography Tokens

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      // Typography tokens (FR-026 to FR-031)
      fontSize: {
        'heading-1': ['clamp(1.5rem, 5vw, 2.25rem)', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-2': ['clamp(1.25rem, 4vw, 1.875rem)', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-3': ['clamp(1.125rem, 3vw, 1.5rem)', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '0' }],
        'heading-4': ['clamp(1rem, 2.5vw, 1.25rem)', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '0' }],
        'body-large': ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'body': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'body-small': ['clamp(0.75rem, 1.25vw, 0.875rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1', fontWeight: '400', letterSpacing: '0' }],
        'label': ['0.875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0' }],
        'button': ['0.875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0' }],
      },
      
      // Icon size tokens (FR-037)
      width: {
        'icon-xs': '0.75rem',  // 12px
        'icon-sm': '1rem',     // 16px
        'icon-md': '1.25rem',  // 20px
        'icon-lg': '1.5rem',   // 24px
        'icon-xl': '2rem',     // 32px
      },
      height: {
        'icon-xs': '0.75rem',
        'icon-sm': '1rem',
        'icon-md': '1.25rem',
        'icon-lg': '1.5rem',
        'icon-xl': '2rem',
      },
      
      // Animation duration tokens (FR-038)
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
};
```

### Custom Utility Classes

Add via Tailwind plugin:

```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.icon-xs': { width: '0.75rem', height: '0.75rem' },
        '.icon-sm': { width: '1rem', height: '1rem' },
        '.icon-md': { width: '1.25rem', height: '1.25rem' },
        '.icon-lg': { width: '1.5rem', height: '1.5rem' },
        '.icon-xl': { width: '2rem', height: '2rem' },
      });
    }),
  ],
};
```

---

## Naming Convention Enforcement

### ESLint Rule Configuration

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['tailwindcss'],
  rules: {
    'tailwindcss/no-custom-classname': [
      'error',
      {
        whitelist: [
          // Typography tokens
          'text-heading-1', 'text-heading-2', 'text-heading-3', 'text-heading-4',
          'text-body-large', 'text-body', 'text-body-small', 'text-caption', 'text-label', 'text-button',
          
          // Icon size tokens
          'icon-xs', 'icon-sm', 'icon-md', 'icon-lg', 'icon-xl',
          
          // Animation tokens
          'duration-fast', 'duration-normal', 'duration-slow',
        ],
      },
    ],
    'tailwindcss/enforces-negative-arbitrary-values': 'warn',
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',
  },
};
```

### Pre-Commit Hook Validation

```javascript
// scripts/validate-classnames.ts
import { readFileSync } from 'fs';
import { glob } from 'glob';

const FORBIDDEN_PATTERNS = [
  // Hardcoded colors
  /bg-(red|blue|green|teal|slate|gray|zinc|neutral|stone|orange|amber|yellow|lime|emerald|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{3}/,
  /text-(red|blue|green|teal|slate|gray|zinc|neutral|stone|orange|amber|yellow|lime|emerald|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{3}/,
  /border-(red|blue|green|teal|slate|gray|zinc|neutral|stone|orange|amber|yellow|lime|emerald|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{3}/,
  
  // Raw typography utilities
  /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
  /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/,
  /leading-(none|tight|snug|normal|relaxed|loose)\b/,
  
  // transition-all (FR-038)
  /transition-all/,
];

const ALLOWED_PATTERNS = [
  // shadcn CSS variable classes
  /bg-(primary|secondary|destructive|muted|accent|card|background)/,
  /text-(foreground|muted-foreground|primary-foreground|secondary-foreground|destructive-foreground|card-foreground)/,
  /border-(border|input|ring)/,
  
  // Semantic typography tokens
  /text-(heading-[1-4]|body-large|body|body-small|caption|label|button)/,
  
  // Icon size tokens
  /icon-(xs|sm|md|lg|xl)/,
  
  // Animation tokens
  /duration-(fast|normal|slow)/,
  /transition-(colors|shadow|transform|opacity)/,
];

async function validateClassNames() {
  const files = await glob('src/**/*.{tsx,jsx}');
  let violations = [];
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const classNameMatches = content.matchAll(/className="([^"]*)"/g);
    
    for (const match of classNameMatches) {
      const classes = match[1].split(/\s+/);
      
      for (const cls of classes) {
        // Check if forbidden
        if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(cls))) {
          // Check if it's not in allowed patterns
          if (!ALLOWED_PATTERNS.some(pattern => pattern.test(cls))) {
            violations.push({
              file,
              line: content.substring(0, match.index).split('\n').length,
              class: cls,
              reason: getForbiddenReason(cls),
            });
          }
        }
      }
    }
  }
  
  if (violations.length > 0) {
    console.error('❌ className violations found:\n');
    violations.forEach(v => {
      console.error(`${v.file}:${v.line}`);
      console.error(`  ❌ ${v.class} (${v.reason})`);
      console.error(`  ✅ Suggested fix: ${getSuggestedFix(v.class)}\n`);
    });
    process.exit(1);
  }
  
  console.log('✅ All className usage is valid!');
}

function getForbiddenReason(cls: string): string {
  if (/bg-(red|blue|green|teal)-\d{3}/.test(cls)) return 'Hardcoded color (use bg-primary, bg-secondary, etc.)';
  if (/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(cls)) return 'Raw typography utility (use text-heading-*, text-body, etc.)';
  if (/transition-all/.test(cls)) return 'Use transition-colors, transition-shadow, etc. instead';
  return 'Industry standard violation';
}

function getSuggestedFix(cls: string): string {
  if (/bg-teal-\d{3}/.test(cls)) return 'bg-primary';
  if (/text-2xl/.test(cls)) return 'text-heading-2';
  if (/text-xl/.test(cls)) return 'text-heading-4';
  if (/text-lg/.test(cls)) return 'text-body-large';
  if (/text-base/.test(cls)) return 'text-body';
  if (/text-sm/.test(cls)) return 'text-body-small';
  if (/text-xs/.test(cls)) return 'text-caption';
  if (/h-5 w-5/.test(cls)) return 'icon-md';
  if (/transition-all/.test(cls)) return 'transition-colors';
  return '(see naming-convention.json)';
}

validateClassNames();
```

---

## Migration Cheat Sheet

Quick reference for developers during migration:

```markdown
# className Migration Cheat Sheet

## Colors
| ❌ Old | ✅ New |
|-------|-------|
| `bg-teal-600` | `bg-primary` |
| `bg-white dark:bg-slate-800` | `bg-card` |
| `text-slate-900 dark:text-white` | `text-foreground` |
| `text-slate-600 dark:text-slate-400` | `text-muted-foreground` |
| `border-slate-300` | `border-border` |

## Typography
| ❌ Old | ✅ New |
|-------|-------|
| `text-4xl font-bold` | `text-heading-1` |
| `text-3xl font-bold` | `text-heading-2` |
| `text-2xl font-semibold` | `text-heading-3` |
| `text-xl font-semibold` | `text-heading-4` |
| `text-lg` | `text-body-large` |
| `text-base` | `text-body` |
| `text-sm` | `text-body-small` |
| `text-xs text-slate-500` | `text-caption` |

## Icons
| ❌ Old | ✅ New |
|-------|-------|
| `h-3 w-3` | `icon-xs` |
| `h-4 w-4` | `icon-sm` |
| `h-5 w-5` | `icon-md` |
| `h-6 w-6` | `icon-lg` |
| `h-8 w-8` | `icon-xl` |

## Animations
| ❌ Old | ✅ New |
|-------|-------|
| `transition-all duration-300` | `transition-colors duration-200` |
| `transition-all duration-150` | `transition-shadow duration-fast` |
```

---

## Validation Rules

1. **Color Token Validation** (FR-040):
   - ❌ Fail: Any `bg-{color}-{shade}` where `{color}` is not a semantic token
   - ✅ Pass: Only `bg-primary`, `bg-secondary`, `bg-destructive`, `bg-muted`, `bg-accent`, `bg-card`, `bg-background`

2. **Typography Token Validation** (FR-026 to FR-031):
   - ❌ Fail: Any `text-{size}` where `{size}` is `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, etc.
   - ✅ Pass: Only `text-heading-*`, `text-body*`, `text-caption`, `text-label`, `text-button`

3. **Icon Size Validation** (FR-037):
   - ❌ Fail: Hardcoded `h-5 w-5` on icon components
   - ✅ Pass: Only `icon-xs`, `icon-sm`, `icon-md`, `icon-lg`, `icon-xl`

4. **Animation Validation** (FR-038):
   - ❌ Fail: Any `transition-all`
   - ✅ Pass: Only `transition-colors`, `transition-shadow`, `transition-transform`, `transition-opacity`

---

## Performance Considerations

### Tree-Shaking (SC-026)

- ✅ **shadcn/ui components are tree-shakable**: Only imported components are bundled
- ✅ **Tailwind JIT compiler**: Only classes used in codebase are generated
- ✅ **CSS variable approach**: Minimal CSS overhead (40 CSS variables vs. thousands of utility classes)

### Bundle Size Impact

```
Before (Feature 004 only):
- CSS: ~12KB (design tokens)
- JS: 0KB (no component library)

After (Feature 004 + Feature 005):
- CSS: ~15KB (+3KB for shadcn base styles)
- JS: ~25KB (shadcn components + Radix primitives, gzipped)
- Total: ~40KB (well under 50KB target)
```

---

**Contract Status**: ✅ Complete  
**Next**: Generate quickstart.md for developer onboarding
