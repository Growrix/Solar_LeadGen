# Theme Testing Checklist

**Purpose**: Ensure components work correctly across Light, Dark, and System themes without custom theme logic.

**Audience**: Developers, QA Engineers

**Last Updated**: 2025-01-28

---

## Overview

This checklist validates that components using the centralized design token system correctly adapt to all theme modes. Every component should pass all checks before merging to main.

---

## Pre-Testing Setup

### 1. Storybook Environment

- [ ] Storybook running: `npm run storybook`
- [ ] Open component story in browser
- [ ] Locate theme switcher in Storybook toolbar (moon/sun icon)

### 2. Browser DevTools

- [ ] Open Chrome DevTools (F12)
- [ ] Go to Elements tab
- [ ] Inspect `<html>` element for `.dark` class changes

### 3. OS Theme Setting

- [ ] **Windows**: Settings → Personalization → Colors → Choose your mode
- [ ] **macOS**: System Preferences → General → Appearance
- [ ] **Linux**: Varies by distribution (usually in System Settings)

---

## Component Testing Matrix

### Test 1: Light Mode

**Steps**:
1. Set theme to "Light" in Storybook toolbar
2. Verify `<html>` does NOT have `.dark` class
3. Check component appearance

**Pass Criteria**:
- [ ] Background colors are light (e.g., white, light gray, light teal)
- [ ] Text colors are dark (e.g., black, dark gray)
- [ ] Borders are visible but subtle
- [ ] Hover states work (buttons darken on hover)
- [ ] Focus states work (inputs show blue ring)
- [ ] All text readable (contrast ratio ≥ 4.5:1)

**Screenshot**: Take screenshot named `[component]-light.png`

---

### Test 2: Dark Mode

**Steps**:
1. Set theme to "Dark" in Storybook toolbar
2. Verify `<html>` HAS `.dark` class
3. Check component appearance

**Pass Criteria**:
- [ ] Background colors are dark (e.g., black, dark gray, dark teal)
- [ ] Text colors are light (e.g., white, light gray)
- [ ] Borders are visible but subtle
- [ ] Hover states work (buttons lighten on hover)
- [ ] Focus states work (inputs show blue ring)
- [ ] All text readable (contrast ratio ≥ 4.5:1)
- [ ] No "flash of unstyled content" (FOUC)

**Screenshot**: Take screenshot named `[component]-dark.png`

---

### Test 3: System Mode (Auto)

**Steps**:
1. Set theme to "System" in Storybook toolbar
2. Change OS theme to Light
3. Verify component matches Light mode
4. Change OS theme to Dark
5. Verify component matches Dark mode

**Pass Criteria**:
- [ ] Component automatically switches when OS theme changes
- [ ] No page refresh required
- [ ] Transition is smooth (no flicker)
- [ ] All Light mode criteria pass (when OS = Light)
- [ ] All Dark mode criteria pass (when OS = Dark)

---

### Test 4: Semantic Token Validation

**Objective**: Verify component uses semantic tokens correctly.

**Steps**:
1. Open component source code
2. Search for hardcoded Tailwind color classes

**Pass Criteria**:
- [ ] No hardcoded colors: `bg-teal-600`, `text-gray-900`, `border-red-500`
- [ ] Uses semantic tokens: `bg-primary`, `text-foreground`, `border-error`
- [ ] Uses semantic state tokens: `bg-success-light`, `text-error-dark`, `border-warning`
- [ ] No conditional theme logic: No `theme === 'dark'` checks
- [ ] No `useTheme()` hook (unless managing theme switcher)

**Code Review Checklist**:
```tsx
// ❌ FAIL: Hardcoded colors
<div className="bg-teal-600 text-white">

// ❌ FAIL: Conditional theme logic
const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

// ✅ PASS: Semantic tokens
<div className="bg-primary text-white">

// ✅ PASS: Semantic state tokens
<div className="bg-success-light text-success-dark border-success">
```

---

### Test 5: Interactive States

**Objective**: Verify hover, focus, active, and disabled states work in all themes.

**Elements to Test**:
- Buttons
- Links
- Form inputs
- Dropdown menus
- Modals
- Tooltips

#### Buttons

**Light Mode**:
- [ ] Default: Light background, visible border
- [ ] Hover: Background darkens slightly
- [ ] Active (clicking): Background darkens more
- [ ] Disabled: Muted appearance (gray)

**Dark Mode**:
- [ ] Default: Dark background, visible border
- [ ] Hover: Background lightens slightly
- [ ] Active (clicking): Background lightens more
- [ ] Disabled: Muted appearance (dark gray)

#### Form Inputs

**Light Mode**:
- [ ] Default: White background, light gray border
- [ ] Focus: Blue border, blue ring shadow
- [ ] Error: Red border, light red background
- [ ] Disabled: Gray background, gray text

**Dark Mode**:
- [ ] Default: Dark gray background, darker border
- [ ] Focus: Blue border, blue ring shadow
- [ ] Error: Red border, dark red background
- [ ] Disabled: Darker gray background, gray text

#### Links

**Light Mode**:
- [ ] Default: Teal text, underline
- [ ] Hover: Darker teal
- [ ] Active (clicking): Even darker teal
- [ ] Visited: Purple tint (if applicable)

**Dark Mode**:
- [ ] Default: Light teal text, underline
- [ ] Hover: Lighter teal
- [ ] Active (clicking): Even lighter teal
- [ ] Visited: Light purple tint (if applicable)

---

### Test 6: Responsive Theme Adaptation

**Objective**: Verify theme works across device sizes.

**Steps**:
1. Open Storybook story
2. Use Storybook viewport toolbar (mobile, tablet, desktop)
3. Test Light and Dark modes at each size

**Pass Criteria**:
- [ ] Mobile (320px-767px): Theme adapts correctly
- [ ] Tablet (768px-1023px): Theme adapts correctly
- [ ] Desktop (1024px+): Theme adapts correctly
- [ ] No layout breaks in any theme at any size
- [ ] Text remains readable at all sizes in both themes

---

### Test 7: Accessibility (WCAG AA)

**Objective**: Verify color contrast meets accessibility standards.

**Tools**:
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

**Steps**:
1. Open component in Storybook
2. Run Lighthouse audit (Accessibility category)
3. Check for contrast issues

**Pass Criteria**:
- [ ] **Light Mode**: All text contrast ≥ 4.5:1 (normal text) or ≥ 3:1 (large text 18px+)
- [ ] **Dark Mode**: All text contrast ≥ 4.5:1 (normal text) or ≥ 3:1 (large text 18px+)
- [ ] No Lighthouse accessibility errors
- [ ] Focus indicators visible in both themes
- [ ] Color not sole indicator (use icons + color for status)

**Common Failures**:
- Gray text on gray background (low contrast)
- Light yellow on white (insufficient contrast in Light mode)
- Dark blue on black (insufficient contrast in Dark mode)

---

### Test 8: Real-World Scenarios

**Objective**: Test component in actual application context.

#### Scenario 1: Theme Toggle During Interaction

**Steps**:
1. Open component (e.g., form with validation errors)
2. Fill in some fields
3. Toggle theme while form is partially filled
4. Continue filling form

**Pass Criteria**:
- [ ] Form state preserved after theme change
- [ ] Error messages remain visible
- [ ] Input values not lost
- [ ] Focus not lost

#### Scenario 2: Modal with Theme Switch

**Steps**:
1. Open modal in Light mode
2. Toggle to Dark mode while modal open
3. Close and reopen modal

**Pass Criteria**:
- [ ] Modal background adapts immediately
- [ ] Modal content adapts immediately
- [ ] Overlay (backdrop) adapts immediately
- [ ] Close button remains visible and clickable

#### Scenario 3: Dashboard with Multiple Components

**Steps**:
1. Open dashboard page with cards, charts, alerts, forms
2. Toggle between Light, Dark, System modes
3. Verify all components adapt simultaneously

**Pass Criteria**:
- [ ] All components update together (no stagger)
- [ ] No components "stuck" in old theme
- [ ] Charts redraw with new theme colors
- [ ] Alerts use correct background/text colors

---

## Testing Status Components

### Alert Component

**Test all variants in both themes**:

- [ ] Success Alert:
  - Light: Green-100 background, green-900 text, green border
  - Dark: Green-900 background, green-100 text, green border

- [ ] Warning Alert:
  - Light: Amber-100 background, amber-900 text, amber border
  - Dark: Amber-900 background, amber-100 text, amber border

- [ ] Error Alert:
  - Light: Red-100 background, red-900 text, red border
  - Dark: Red-900 background, red-100 text, red border

- [ ] Info Alert:
  - Light: Blue-100 background, blue-900 text, blue border
  - Dark: Blue-900 background, blue-100 text, blue border

### Badge Component

**Test all styles in both themes**:

- [ ] Solid Badge:
  - Light: Colored background, white text
  - Dark: Colored background, white text

- [ ] Light Badge:
  - Light: Light colored background, dark colored text
  - Dark: Dark colored background, light colored text

- [ ] Outlined Badge:
  - Light: White background, colored border, colored text
  - Dark: Dark background, colored border, colored text

---

## Common Issues & Fixes

### Issue 1: Colors Don't Change in Dark Mode

**Symptoms**: Component looks identical in Light and Dark modes.

**Diagnosis**:
1. Check if `<html>` has `.dark` class in Dark mode (DevTools Elements tab)
2. Check if component uses semantic tokens or hardcoded colors

**Fix**:
- Replace hardcoded colors: `bg-white` → `bg-surface`
- Replace hardcoded text: `text-gray-900` → `text-foreground`
- Ensure `tailwind.config.js` has `darkMode: 'class'`

### Issue 2: Flash of Unstyled Content (FOUC)

**Symptoms**: Brief flash of Light theme before Dark theme loads.

**Diagnosis**:
1. Check if theme loaded from localStorage before first render
2. Check if `next-themes` ThemeProvider in `_app.tsx`

**Fix**:
- Ensure ThemeProvider wraps entire app
- Add `suppressHydrationWarning` to `<html>` tag
- Use `next-themes` script in `<head>`

### Issue 3: Low Contrast in One Theme

**Symptoms**: Text hard to read in Dark mode but fine in Light mode (or vice versa).

**Diagnosis**:
1. Run Lighthouse accessibility audit
2. Check contrast ratio with WebAIM tool

**Fix**:
- Adjust token values in `tailwind.config.js`
- Use `-light` and `-dark` variants: `text-success-dark` (dark in Light, light in Dark)
- Test with Lighthouse after each change

### Issue 4: Incorrect State Colors

**Symptoms**: Success alert red instead of green.

**Diagnosis**:
1. Check semantic token mapping in `tailwind.config.js`
2. Verify component uses correct token class

**Fix**:
- Map tokens correctly: `success: colors.green[600]`, not `colors.red[600]`
- Use correct class: `bg-success`, not `bg-error`

---

## Automated Testing

### Unit Tests (Optional)

```tsx
// Example: Testing theme adaptation with React Testing Library
import { render } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

describe('Alert Component', () => {
  it('renders with correct colors in light mode', () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <Alert variant="success">Success message</Alert>
      </ThemeProvider>
    );
    
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-success-light', 'text-success-dark');
  });

  it('renders with correct colors in dark mode', () => {
    document.documentElement.classList.add('dark');
    
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Alert variant="success">Success message</Alert>
      </ThemeProvider>
    );
    
    const alert = container.firstChild;
    expect(alert).toHaveClass('bg-success-light', 'text-success-dark');
    // Note: Tailwind applies different computed colors based on .dark class
  });
});
```

### Visual Regression Testing (Chromatic)

**Blocked**: Requires user Chromatic account setup.

**Setup Steps** (when ready):
1. Create Chromatic account: https://www.chromatic.com/
2. Add project token to `.env.local`
3. Run `npm run chromatic` to capture baselines
4. Review and approve baselines in Chromatic UI
5. Future PRs will auto-compare against baselines

---

## Sign-Off

**Component**: _________________________  
**Tested By**: _________________________  
**Date**: _________________________  

**Results**:
- [ ] All Light mode tests pass
- [ ] All Dark mode tests pass
- [ ] All System mode tests pass
- [ ] Semantic tokens validated
- [ ] Interactive states work
- [ ] Responsive at all sizes
- [ ] Accessibility (WCAG AA) pass
- [ ] Real-world scenarios pass

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Approved for Merge**: ☐ Yes  ☐ No (see notes)

---

## Quick Reference

### Semantic Token Cheat Sheet

```tsx
// Backgrounds
bg-surface          // Main surface (white → dark gray)
bg-surface-hover    // Hover state
bg-primary          // Primary brand color
bg-primary-light    // Light primary background

// Text
text-foreground          // Primary text (black → white)
text-foreground-secondary // Secondary text (gray-700 → gray-300)
text-muted              // Muted text (gray-500 → gray-400)
text-primary            // Primary colored text

// Status (Light variants)
bg-success-light    // Success background (green-100 → green-900)
text-success-dark   // Success text (green-900 → green-100)
bg-error-light      // Error background (red-100 → red-900)
text-error-dark     // Error text (red-900 → red-100)
bg-warning-light    // Warning background (amber-100 → amber-900)
text-warning-dark   // Warning text (amber-900 → amber-100)
bg-info-light       // Info background (blue-100 → blue-900)
text-info-dark      // Info text (blue-900 → blue-100)

// Borders
border-border       // Default border (gray-300 → gray-700)
border-success      // Success border
border-error        // Error border
border-warning      // Warning border
border-info         // Info border
```

### Testing Command Quick Access

```bash
# Start Storybook
npm run storybook

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint

# Visual regression (when Chromatic set up)
npm run chromatic
```

---

**End of Checklist**
