# 🔤 Font & Typography Critical Audit

**Created**: 2025-10-30  
**Status**: COMPLETE - All issues identified  
**Scope**: Dark theme typography (H1-H6, p, spans, font families, sizes, weights, line-heights)

---

## ✅ GOOD NEWS: Typography System Exists (Feature 004)

Feature 004 created a complete typography token system:
- ✅ `src/design-tokens/semantic/typography.ts` - Complete semantic scale
- ✅ `src/design-tokens/primitives/fontSizes.ts` - Raw values (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
- ✅ Tailwind extended with typography classes: `text-heading-1`, `text-body`, `text-caption`
- ✅ Responsive scaling: Mobile (14px body) → Desktop (16px body)

**However**: Typography token system EXISTS but ISN'T BEING USED. Components still use raw Tailwind classes.

---

## 🚨 CRITICAL TYPOGRAPHY ISSUES FOUND

### Issue 1: ⚠️ Typography Token System Not Applied

**Current State**:
```tsx
/* Components use RAW Tailwind classes instead of semantic tokens */
<h2 className="text-2xl font-bold text-foreground">    {/* ❌ Hardcoded */}
<p className="text-sm text-subtle">                    {/* ❌ Hardcoded */}
<span className="text-xs font-medium">                 {/* ❌ Hardcoded */}
```

**Should Be** (using typography tokens):
```tsx
<h2 className="text-heading-2 text-foreground">        {/* ✅ Token-based */}
<p className="text-body-small text-muted-foreground">  {/* ✅ Token-based */}
<span className="text-caption font-medium">            {/* ✅ Token-based */}
```

**Problem**:
- If we change base font size in tokens, nothing updates (components ignore tokens)
- Inconsistent heading sizes (same h2 with text-2xl, text-3xl, text-xl)
- No responsive scaling (mobile text too large)

---

### Issue 2: ⚠️ Inconsistent Heading Hierarchy

**Found in Codebase**:
```tsx
/* Same semantic element, different sizes */
<h2 className="text-2xl font-bold">    {/* 24px - Some pages */}
<h2 className="text-xl font-bold">     {/* 20px - Other pages */}
<h2 className="text-3xl font-bold">    {/* 30px - Hero sections */}

/* Semantic HTML doesn't match visual hierarchy */
<h1 className="text-2xl">              {/* h1 should be largest */}
<h2 className="text-4xl">              {/* h2 larger than h1?! */}
```

**Industry Standard** (WCAG 2.1 / Material Design):
- h1: 36-48px (largest, most important)
- h2: 24-30px (section headings)
- h3: 20-24px (subsection headings)
- h4: 18-20px (card titles)
- h5: 16-18px (small headings)
- h6: 14-16px (smallest headings)
- body: 14-16px (main text)
- caption: 12-14px (metadata, labels)

**Fix**: Use semantic typography tokens:
```tsx
<h1 className="text-heading-1">  {/* 24px mobile, 30px tablet, 36px desktop */}
<h2 className="text-heading-2">  {/* 20px mobile, 24px tablet, 30px desktop */}
<h3 className="text-heading-3">  {/* 18px mobile, 20px tablet, 24px desktop */}
<h4 className="text-heading-4">  {/* 16px mobile, 18px tablet, 20px desktop */}
<p className="text-body">        {/* 14px mobile, 16px desktop */}
```

---

### Issue 3: ⚠️ Font Weight Inconsistency

**Found in Codebase**:
```tsx
/* Same component type, different weights */
<button className="font-semibold">    {/* 600 */}
<button className="font-bold">        {/* 700 */}
<button className="font-medium">      {/* 500 */}

/* Headings with inconsistent weights */
<h2 className="font-bold">            {/* 700 */}
<h2 className="font-semibold">        {/* 600 */}
```

**Industry Standard**:
- Headings: bold (700) or semibold (600)
- Body text: normal (400)
- Buttons: semibold (600)
- Labels: medium (500)
- Captions: normal (400)

**Typography Tokens Already Define This**:
```ts
// src/design-tokens/semantic/typography.ts
heading: {
  1: { fontWeight: fontWeights.bold },      // 700
  2: { fontWeight: fontWeights.bold },      // 700
  3: { fontWeight: fontWeights.semibold },  // 600
  4: { fontWeight: fontWeights.semibold },  // 600
}
body: { fontWeight: fontWeights.normal },   // 400
button: { fontWeight: fontWeights.semibold }, // 600
```

**Fix**: Remove inline font-weight classes, use typography tokens:
```tsx
<h1 className="text-heading-1">  {/* font-bold automatic */}
<p className="text-body">        {/* font-normal automatic */}
<Button>                         {/* font-semibold automatic in shadcn Button */}
```

---

### Issue 4: ⚠️ Line Height Inconsistency

**Found in Codebase**:
```tsx
/* NO line-height specified = using Tailwind defaults */
<h1 className="text-4xl">                    {/* lineHeight: 1 (default) */}
<p className="text-base">                    {/* lineHeight: 1.5 (default) */}

/* Some components DO specify */
<p className="text-base leading-relaxed">    {/* lineHeight: 1.625 */}
```

**Problem**:
- Headings too cramped (lineHeight: 1.25 for tight display)
- Body text comfortable (lineHeight: 1.5)
- Long-form content needs MORE space (lineHeight: 1.75)

**Industry Standard** (Typography.js / Material Design):
- Display headings: 1.2 (tight, impactful)
- Body headings: 1.25 (slightly loose)
- Body text: 1.5 (comfortable reading)
- Long-form: 1.75 (articles, blogs)

**Typography Tokens Already Define This**:
```ts
// src/design-tokens/semantic/typography.ts
heading: {
  1: { lineHeight: lineHeights.tight },   // 1.25
  2: { lineHeight: lineHeights.tight },   // 1.25
}
body: { lineHeight: lineHeights.normal }, // 1.5
'body-large': { lineHeight: lineHeights.relaxed }, // 1.625
```

**Fix**: Typography tokens include line-height, no manual classes needed:
```tsx
<h1 className="text-heading-1">  {/* lineHeight: 1.25 automatic */}
<p className="text-body">        {/* lineHeight: 1.5 automatic */}
```

---

### Issue 5: ⚠️ Letter Spacing (Tracking) Missing

**Found in Codebase**:
```tsx
/* NO letter-spacing specified anywhere */
<h1 className="text-4xl font-bold">
<button className="text-sm font-semibold">
```

**Problem**:
- ALL-CAPS text too cramped (needs tracking-wide)
- Large headings feel tight (needs tracking-tight: -0.025em)
- Buttons need slight tracking for readability

**Industry Standard**:
- Large headings (h1, h2): `-0.025em` (tighter for impact)
- Body text: `0em` (normal)
- ALL-CAPS labels: `0.05em` (wider for readability)
- Buttons: `0.025em` (slightly wider)

**Typography Tokens Already Define This**:
```ts
// src/design-tokens/semantic/typography.ts
heading: {
  1: { letterSpacing: letterSpacing.tight },    // -0.025em
  2: { letterSpacing: letterSpacing.tight },    // -0.025em
}
button: { letterSpacing: letterSpacing.wide },  // 0.025em
caption: { letterSpacing: letterSpacing.wide }, // 0.025em (for small ALL-CAPS labels)
```

**Fix**: Typography tokens include letter-spacing automatically:
```tsx
<h1 className="text-heading-1">  {/* letterSpacing: -0.025em automatic */}
<Button>                         {/* letterSpacing: 0.025em automatic in shadcn */}
```

---

### Issue 6: ⚠️ Font Family Not Enforced

**Current State**:
```tsx
/* Font applied globally in layout.tsx */
// src/app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
<body className={inter.className}>
```

**Problem**:
- Email templates use `font-family: Arial, sans-serif` (inconsistent)
- No monospace font for code snippets
- No fallback stack if Inter fails to load

**Typography Tokens Define Full Stack**:
```ts
// src/design-tokens/semantic/typography.ts
fontFamily: {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"Fira Code", "Courier New", Consolas, Monaco, monospace',
}
```

**Tailwind Config Extends This**:
```js
// tailwind.config.js
fontFamily: {
  sans: typography.fontFamily.sans.split(', '),
  mono: typography.fontFamily.mono.split(', '),
}
```

**Fix**:
1. Remove `inter.className` from layout (use Tailwind's font-sans instead)
2. Use `font-mono` for code snippets
3. Email templates: Use `font-family: Inter, system-ui, sans-serif;`

---

### Issue 7: ⚠️ Dark Theme Text Colors Inconsistent

**Found in Codebase**:
```tsx
/* Mix of dark mode strategies */
<h2 className="text-slate-900 dark:text-white">           {/* ❌ Hardcoded */}
<p className="text-slate-700 dark:text-slate-300">        {/* ❌ Hardcoded */}
<span className="text-foreground">                        {/* ✅ Good (CSS var) */}
```

**Problem**:
- Some components use `dark:text-white` (pure white too harsh in dark mode)
- Others use `dark:text-slate-300` (gray, inconsistent shade)
- Should use CSS variables: `text-foreground`, `text-muted-foreground`

**Dark Theme CSS Variables** (already defined in globals.css):
```css
.dark {
  --text-primary: #F5F5F5;      /* Light gray, not pure white */
  --text-secondary: #A0A0A0;    /* Muted gray for less important text */
  
  /* RGB format for Tailwind */
  --color-foreground: 245 245 245;      /* #F5F5F5 */
  --color-subtle: 160 160 160;          /* #A0A0A0 */
}
```

**Fix**: Remove ALL `dark:text-X` classes, use CSS variables:
```tsx
<h1 className="text-foreground">              {/* Uses --color-foreground (auto dark mode) */}
<p className="text-muted-foreground">         {/* Uses --color-subtle (auto dark mode) */}
```

---

## 📋 Typography Standards to Enforce

### HTML Semantic Elements (WCAG 2.1 Requirement)

**Rule**: Semantic HTML MUST match visual hierarchy

```tsx
/* ✅ CORRECT */
<h1 className="text-heading-1">Page Title</h1>
<h2 className="text-heading-2">Section Heading</h2>
<h3 className="text-heading-3">Subsection</h3>
<p className="text-body">Body text</p>

/* ❌ WRONG - Visual hierarchy doesn't match semantic HTML */
<h1 className="text-heading-3">Tiny h1</h1>    {/* h1 should be largest */}
<div className="text-heading-1">Fake heading</div>  {/* Should be <h1> */}
```

### Responsive Typography Scale

**Rule**: ALL text MUST scale responsively (mobile → desktop)

```tsx
/* ✅ CORRECT - Typography tokens handle responsive automatically */
<h1 className="text-heading-1">  {/* 24px mobile, 30px tablet, 36px desktop */}

/* ❌ WRONG - Fixed size across all devices */
<h1 className="text-4xl">        {/* 36px everywhere (too large on mobile) */}
```

### Font Weight Scale

**Rule**: Consistent font weights per element type

| Element Type | Font Weight | Token |
|-------------|-------------|-------|
| h1, h2 | 700 (bold) | `font-bold` (automatic in typography token) |
| h3, h4 | 600 (semibold) | `font-semibold` (automatic) |
| h5, h6 | 600 (semibold) | `font-semibold` (automatic) |
| Body text | 400 (normal) | `font-normal` (automatic) |
| Buttons | 600 (semibold) | `font-semibold` (shadcn Button default) |
| Labels | 500 (medium) | `font-medium` (automatic in label token) |
| Captions | 400 (normal) | `font-normal` (automatic) |

### Line Height Scale

**Rule**: Optimal line-height for readability

| Element Type | Line Height | Token |
|-------------|-------------|-------|
| Display headings (h1, h2) | 1.25 (tight) | `lineHeight: lineHeights.tight` (automatic) |
| Body headings (h3-h6) | 1.375 (snug) | `lineHeight: lineHeights.snug` (automatic) |
| Body text | 1.5 (normal) | `lineHeight: lineHeights.normal` (automatic) |
| Long-form content | 1.625 (relaxed) | `lineHeight: lineHeights.relaxed` (automatic) |

### Letter Spacing Scale

**Rule**: Tracking adjustments for optical balance

| Element Type | Letter Spacing | Token |
|-------------|---------------|-------|
| Large headings (h1, h2) | -0.025em (tight) | `letterSpacing: letterSpacing.tight` (automatic) |
| Body text | 0em (normal) | `letterSpacing: letterSpacing.normal` (automatic) |
| Buttons | 0.025em (wide) | `letterSpacing: letterSpacing.wide` (automatic) |
| ALL-CAPS labels | 0.05em (wider) | `letterSpacing: letterSpacing.wide` (automatic) |

---

## ✅ What User Story 8 Must Add

Update **User Story 8** to include:

### Enhanced Acceptance Scenarios (Typography Migration)

9. **Given** component uses raw Tailwind font size (`text-2xl`, `text-sm`), **When** migrated, **Then** uses typography token: `text-heading-2`, `text-body-small`
10. **Given** heading has inline font-weight (`font-bold`), **When** migrated to typography token, **Then** font-weight removed (handled by token)
11. **Given** text has inline line-height (`leading-relaxed`), **When** migrated to typography token, **Then** line-height removed (handled by token)
12. **Given** component uses `dark:text-white`, **When** migrated, **Then** uses CSS variable: `text-foreground` (auto dark mode)
13. **Given** semantic HTML (h1, h2, p) doesn't match visual size, **When** audit runs, **Then** flagged as "Semantic Mismatch - Fix HTML Structure"
14. **Given** code snippet exists, **When** migrated, **Then** uses `font-mono` class with appropriate token
15. **Given** ALL-CAPS text exists, **When** migrated, **Then** uses `text-caption` with `uppercase` utility (includes letter-spacing)

### New Functional Requirements (Typography)

**FR-041**: Typography MUST use semantic scale tokens from feature 004 design system:
- `text-heading-1` through `text-heading-4` for headings
- `text-body`, `text-body-large`, `text-body-small` for body text
- `text-caption` for small labels/metadata
- `text-label` for form labels
- `text-button` for button text (if not using shadcn Button)

**FR-042**: Semantic HTML elements MUST match visual hierarchy (WCAG 2.1 SC 1.3.1):
- h1 must use `text-heading-1` (largest)
- h2 must use `text-heading-2`
- h3 must use `text-heading-3`
- h4 must use `text-heading-4`
- No `<div>` styled as heading without semantic HTML

**FR-043**: Font family MUST use design tokens:
- Remove `inter.className` from layout.tsx
- Default to `font-sans` (Inter with full fallback stack)
- Use `font-mono` for code snippets

**FR-044**: Text colors in dark theme MUST use CSS variables:
- Remove ALL `dark:text-white`, `dark:text-slate-X` classes
- Use `text-foreground` for primary text (auto dark mode)
- Use `text-muted-foreground` for secondary text (auto dark mode)

**FR-045**: Typography tokens MUST NOT be overridden with inline classes:
- NO `font-bold` with `text-heading-1` (weight defined in token)
- NO `leading-relaxed` with `text-body` (line-height defined in token)
- NO `tracking-tight` with `text-heading-1` (letter-spacing defined in token)

**FR-046**: Responsive typography MUST scale mobile → desktop:
- Body text: 14px mobile → 16px desktop
- Headings: Mobile (smaller) → Desktop (larger) per token definition
- Use typography tokens (responsive automatic), NOT manual breakpoint classes

---

## 📊 Current vs. Target State

### BEFORE (Current - Broken)
```tsx
<h1 className="text-4xl font-bold text-slate-900 dark:text-white">
  Page Title
</h1>
<h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
  Section Heading
</h2>
<p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
  Body text with manual line-height
</p>
<button className="text-sm font-semibold text-white bg-primary">
  Click Me
</button>
```

**Problems**:
- ❌ Hardcoded sizes (`text-4xl`, `text-2xl`, `text-base`, `text-sm`)
- ❌ Inline font weights (`font-bold`, `font-semibold`)
- ❌ Inline line-height (`leading-relaxed`)
- ❌ Manual dark mode colors (`dark:text-white`, `dark:text-slate-X`)
- ❌ No responsive scaling
- ❌ No letter-spacing

### AFTER (Target - Perfect)
```tsx
<h1 className="text-heading-1 text-foreground">
  Page Title
</h1>
<h2 className="text-heading-2 text-foreground">
  Section Heading
</h2>
<p className="text-body text-muted-foreground">
  Body text with optimal line-height
</p>
<Button>
  Click Me
</Button>
```

**Benefits**:
- ✅ Semantic tokens (`text-heading-1`, `text-body`)
- ✅ Font weights automatic (defined in token)
- ✅ Line-heights optimal (defined in token)
- ✅ Letter-spacing optimal (defined in token)
- ✅ Dark mode automatic (CSS variables)
- ✅ Responsive scaling automatic (mobile → desktop)
- ✅ shadcn Button handles button typography

---

## 🎯 Success Metrics (Typography)

Add to **Success Criteria**:

- **SC-021**: 100% of headings use typography scale tokens (`text-heading-1` through `text-heading-4`), zero raw Tailwind classes (`text-xl`, `text-2xl`, etc.)
- **SC-022**: 100% of body text uses `text-body`, `text-body-large`, or `text-body-small` tokens
- **SC-023**: Zero inline font-weight classes on elements using typography tokens (weights defined in tokens)
- **SC-024**: Zero inline line-height classes on elements using typography tokens (line-heights defined in tokens)
- **SC-025**: Zero `dark:text-white` or `dark:text-slate-X` classes, all text uses CSS variables (`text-foreground`, `text-muted-foreground`)
- **SC-026**: 100% semantic HTML matches visual hierarchy (h1 = largest, h2 = second largest, etc.) - WCAG 2.1 SC 1.3.1 compliant
- **SC-027**: Font family uses `font-sans` (Inter) with full fallback stack, code snippets use `font-mono`
- **SC-028**: Typography responsive scaling works: 14px mobile → 16px desktop (body), 24px mobile → 36px desktop (h1)

---

## ✅ Summary: Typography is 80% Done, 20% Broken

**Good News**:
- ✅ Typography token system EXISTS (feature 004)
- ✅ Semantic tokens defined (heading-1 through heading-4, body, caption, label, button)
- ✅ Responsive scaling built-in (mobile → desktop)
- ✅ Font weights, line-heights, letter-spacing defined in tokens
- ✅ Tailwind config extended with typography classes
- ✅ Dark theme CSS variables exist

**Bad News**:
- ❌ Components DON'T USE typography tokens (still use raw Tailwind classes)
- ❌ Inconsistent heading hierarchy (same h2 with 3 different sizes)
- ❌ Manual dark mode colors (`dark:text-white`) instead of CSS variables
- ❌ No letter-spacing applied (defined in tokens but components ignore)
- ❌ Font family not enforced (email templates use Arial)

**The Fix**:
User Story 8 (Typography Standardization) will:
1. Migrate ALL headings to `text-heading-X` tokens
2. Migrate ALL body text to `text-body` tokens
3. Remove inline font-weight/line-height classes
4. Replace `dark:text-X` with `text-foreground`/`text-muted-foreground`
5. Enforce semantic HTML hierarchy (WCAG 2.1)
6. Enforce `font-sans`/`font-mono` usage

**Impact**: ONE pass through codebase fixes ALL typography issues. No more pain later. 🚀
