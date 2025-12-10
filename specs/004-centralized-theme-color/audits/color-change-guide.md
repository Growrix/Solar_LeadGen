# Color Change Guide

**Feature**: Centralized Design Token System  
**User Story**: US1 - Designer Changes Primary Brand Color  
**Last Updated**: October 28, 2025

---

## 🎯 Purpose

This guide enables **designers** to change the primary brand color across the entire application by editing a **single token file**. No code changes, no component updates, no developer assistance required.

---

## ⏱️ Time to Rebrand

- **Old Process**: 4-6 hours of developer time, touching 40+ files
- **New Process**: **5 minutes** - edit 1 file, rebuild

---

## 📝 Step-by-Step: Change Primary Brand Color

### Step 1: Open Semantic Color Token File

**File**: `src/design-tokens/semantic/colors.ts`

```bash
# Navigate to the semantic color tokens
cd src/design-tokens/semantic
code colors.ts
```

### Step 2: Locate Primary Color Definition

Find the `primary` color object in the `semanticColors` export:

```typescript
export const semanticColors = {
  primary: {
    light: primitives.teal[600],      // Current: Teal 600
    DEFAULT: primitives.teal[500],    // Current: Teal 500
    dark: primitives.teal[400],       // Current: Teal 400
  },
  // ... other colors
} as const satisfies SemanticColors;
```

### Step 3: Change to New Brand Color

**Example: Change from Teal to Blue**

```typescript
export const semanticColors = {
  primary: {
    light: primitives.blue[600],      // New: Blue 600
    DEFAULT: primitives.blue[500],    // New: Blue 500
    dark: primitives.blue[400],       // New: Blue 400
  },
  // ... other colors
} as const satisfies SemanticColors;
```

**Available Primitive Colors**:
- `primitives.teal[100-900]` - Current brand color (teal)
- `primitives.blue[100-900]` - Blue palette
- `primitives.amber[100-900]` - Amber/orange palette
- `primitives.green[100-900]` - Green palette
- `primitives.gray[100-900]` - Grayscale

**Color Scale**:
- `50` - Lightest (backgrounds)
- `100-300` - Light variants
- `400-600` - **Core brand colors** (use 500 as DEFAULT)
- `700-900` - Dark variants

### Step 4: Rebuild Application

```bash
npm run build
```

**Expected Output**: Build completes in ~30 seconds with 0 errors.

### Step 5: Verify Changes

**Option A: Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

**Option B: Storybook**
```bash
npm run storybook
# Open http://localhost:6006
# Navigate to "Design Tokens" → "Colors" to see all color changes
```

### Step 6: Test All Themes

1. **Light Theme**: Verify primary color visible, readable
2. **Dark Theme**: Verify primary color adapts correctly
3. **System Theme**: Verify OS preference respected

**Where to Check**:
- Buttons (primary variant)
- Links
- Badges
- Chart colors
- Dashboard accents
- Form focus states

---

## 🧪 Visual Regression Testing (Optional but Recommended)

### Run Chromatic (Automated Visual Testing)

```bash
npm run chromatic
```

**What This Does**:
- Captures screenshots of ALL components in ALL themes
- Compares to previous baseline
- Highlights ONLY color changes (no layout/spacing changes)

**Expected Result**: Chromatic shows diffs for color changes only (no unintended visual regressions).

---

## ✅ Success Criteria

- [ ] Primary color changed in `src/design-tokens/semantic/colors.ts`
- [ ] Build completes with 0 errors (`npm run build`)
- [ ] All buttons reflect new primary color
- [ ] All links reflect new primary color
- [ ] Charts use new primary color
- [ ] Dashboard accents use new primary color
- [ ] Light theme: New color readable, meets WCAG AA contrast
- [ ] Dark theme: Dark variant applied automatically
- [ ] System theme: Respects OS preference
- [ ] Chromatic visual regression test passed (optional)

---

## 🚨 Troubleshooting

### Build Fails with TypeScript Error

**Error**: `Type 'X' is not assignable to type 'ThemeColor'`

**Fix**: Verify you're using a primitive color from `src/design-tokens/primitives/colors.ts`:

```typescript
// ❌ WRONG - Custom hex code
primary: {
  light: '#3b82f6',
  DEFAULT: '#2563eb',
  dark: '#1d4ed8',
}

// ✅ CORRECT - Primitive token
primary: {
  light: primitives.blue[600],
  DEFAULT: primitives.blue[500],
  dark: primitives.blue[400],
}
```

### Color Contrast Too Low (WCAG AA Failure)

**Problem**: New primary color not readable on white background.

**Fix**: Use darker shade for better contrast:

```typescript
primary: {
  light: primitives.blue[700],   // Darker for better contrast
  DEFAULT: primitives.blue[600], // Darker for better contrast
  dark: primitives.blue[400],    // Keep light for dark theme
}
```

**Test Contrast**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Aim for **4.5:1** ratio for body text.

### Dark Theme Looks Wrong

**Problem**: Dark theme primary color too dark/invisible.

**Fix**: Use LIGHTER shades for dark theme (counterintuitive but correct):

```typescript
primary: {
  light: primitives.blue[600],   // Dark shade for light theme
  DEFAULT: primitives.blue[500], // Medium shade
  dark: primitives.blue[300],    // LIGHT shade for dark theme (better visibility)
}
```

**Logic**: On dark backgrounds, you need lighter colors for visibility.

---

## 🎨 Common Rebranding Scenarios

### Scenario 1: Subtle Tweak (Same Color Family)

**Goal**: Slightly adjust teal to be more vibrant

```typescript
// Before
primary: {
  light: primitives.teal[600],
  DEFAULT: primitives.teal[500],
  dark: primitives.teal[400],
}

// After (one shade darker = more vibrant)
primary: {
  light: primitives.teal[700],
  DEFAULT: primitives.teal[600],
  dark: primitives.teal[500],
}
```

**Time**: 2 minutes

---

### Scenario 2: Complete Rebrand (Different Color)

**Goal**: Change from teal (tech) to amber (solar energy)

```typescript
// Before: Teal (tech feel)
primary: {
  light: primitives.teal[600],
  DEFAULT: primitives.teal[500],
  dark: primitives.teal[400],
}

// After: Amber (solar energy feel)
primary: {
  light: primitives.amber[600],
  DEFAULT: primitives.amber[500],
  dark: primitives.amber[400],
}
```

**Time**: 5 minutes

---

### Scenario 3: White-Label Client Brand

**Goal**: Create client-specific brand (e.g., "ABC Solar" uses navy blue)

**Step 1**: Create new theme file

```bash
# Create client theme
touch src/design-tokens/themes/abc-solar.ts
```

**Step 2**: Define client brand colors

```typescript
// src/design-tokens/themes/abc-solar.ts
import { primitives } from '../primitives/colors';
import type { SemanticColors } from '../types';

export const abcSolarTheme: SemanticColors = {
  primary: {
    light: primitives.blue[800],   // Navy blue
    DEFAULT: primitives.blue[700],
    dark: primitives.blue[500],
  },
  secondary: {
    light: primitives.amber[600],  // Client accent color
    DEFAULT: primitives.amber[500],
    dark: primitives.amber[400],
  },
  // ... rest of semantic colors (inherit defaults or customize)
};
```

**Step 3**: Switch theme at build time

```typescript
// tailwind.config.js
import { abcSolarTheme } from './src/design-tokens/themes/abc-solar';

export default {
  theme: {
    extend: {
      colors: abcSolarTheme, // Use client theme instead of default
    },
  },
};
```

**Time**: 10 minutes (first time), 2 minutes (subsequent clients)

---

## 📊 Impact Metrics

### Before Design Token System

- **Files Changed**: 40-50 files (components, pages, styles)
- **Developer Time**: 4-6 hours
- **Risk**: High (easy to miss hardcoded colors, visual inconsistencies)
- **QA Time**: 2-3 hours (manual testing)
- **Total Time**: **6-9 hours**

### After Design Token System

- **Files Changed**: 1 file (`semantic/colors.ts`)
- **Developer Time**: 5 minutes
- **Risk**: Low (all colors update automatically)
- **QA Time**: 15 minutes (Chromatic automated testing)
- **Total Time**: **20 minutes**

**Time Savings**: **97% faster** (6 hours → 5 minutes)

---

## 🔗 Related Documentation

- **Primitive Colors**: `src/design-tokens/primitives/colors.ts` (full color palette)
- **Semantic Colors**: `src/design-tokens/semantic/colors.ts` (business layer)
- **Type Definitions**: `src/design-tokens/types.ts` (TypeScript interfaces)
- **Storybook Color Showcase**: `stories/design-tokens/Colors.stories.tsx`
- **White-Label Guide**: `specs/004-centralized-theme-color/audits/white-label-guide.md`

---

## ✨ Best Practices

1. **Always Use Semantic Tokens**: Never hardcode hex codes in components
2. **Test All Themes**: Light, Dark, and System themes
3. **Check Contrast**: WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
4. **Run Chromatic**: Automated visual regression testing catches unintended changes
5. **Document Client Brands**: Create separate theme files for white-label clients

---

**Questions?** Contact the design system team or review `specs/004-centralized-theme-color/quickstart.md`
