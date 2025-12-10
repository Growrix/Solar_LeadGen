# Theme QA Checklist

Manual quality assurance checklist for testing theme consistency across the SolarMatch application.

**Version**: 1.0  
**Last Updated**: 2025-01-28  
**Purpose**: Ensure consistent visual appearance and accessibility across Light, Dark, and System themes

---

## How to Use This Checklist

1. **Test Per Theme**: Complete this entire checklist for EACH theme (Light, Dark, System)
2. **Test Per Page**: For each page/component, work through all sections
3. **Document Issues**: Note any failures with screenshots and browser details
4. **Retest After Fixes**: Re-run checklist after design token changes

---

## Pre-Testing Setup

- [ ] **Browser**: Specify browser and version (e.g., Chrome 120, Firefox 121, Safari 17)
- [ ] **Theme**: Which theme are you testing? ☐ Light  ☐ Dark  ☐ System
- [ ] **Viewport**: Specify screen size (e.g., 1920x1080, 1366x768, iPhone 14)
- [ ] **Zoom Level**: Test at 100% zoom (also test 150% and 200% for accessibility)
- [ ] **Date/Time**: _____________________
- [ ] **Tester Name**: _____________________

---

## Section 1: Color Consistency

### Brand Colors
- [ ] **Primary color** renders correctly (teal-600 in default theme)
- [ ] **Secondary color** renders correctly (amber-500 in default theme)
- [ ] Primary and secondary colors are distinct and recognizable
- [ ] Colors match design specifications exactly

### Status Colors
- [ ] **Success** (green) renders correctly
- [ ] **Warning** (yellow/amber) renders correctly
- [ ] **Error** (red) renders correctly
- [ ] **Info** (blue) renders correctly
- [ ] All status colors are visually distinct from each other

### Background & Foreground Colors
- [ ] **Background** (page background) renders correctly
- [ ] **Surface** (card/panel backgrounds) renders correctly
- [ ] **Foreground** (primary text color) renders correctly
- [ ] **Foreground Secondary** (secondary text color) renders correctly
- [ ] **Muted** (disabled/placeholder text) renders correctly
- [ ] Background and foreground colors have clear hierarchy

### Border & Divider Colors
- [ ] **Border** color is visible but subtle
- [ ] Borders are consistent thickness across all components
- [ ] Dividers clearly separate sections without being distracting

---

## Section 2: Contrast & Readability

### Text Contrast (WCAG AA Standards)
- [ ] Normal text (< 18px) has ≥ 4.5:1 contrast ratio
- [ ] Large text (≥ 18px or bold ≥ 14px) has ≥ 3:1 contrast ratio
- [ ] Placeholder text is distinguishable but less prominent than regular text
- [ ] Links are distinguishable from body text (color + underline recommended)

### UI Component Contrast
- [ ] Button text on colored backgrounds has ≥ 4.5:1 contrast
- [ ] Button borders have ≥ 3:1 contrast against background
- [ ] Form inputs have ≥ 3:1 contrast (border vs background)
- [ ] Icons have ≥ 3:1 contrast against their backgrounds
- [ ] Focus indicators have ≥ 3:1 contrast and are clearly visible

### Status Text Contrast
- [ ] Success text on success-light background has ≥ 4.5:1 contrast
- [ ] Warning text on warning-light background has ≥ 4.5:1 contrast
- [ ] Error text on error-light background has ≥ 4.5:1 contrast
- [ ] Info text on info-light background has ≥ 4.5:1 contrast

**Tool Recommendation**: Use Storybook's Accessibility addon or browser extensions like [Axe DevTools](https://www.deque.com/axe/devtools/) to verify contrast ratios.

---

## Section 3: Typography

### Font Rendering
- [ ] All headings (H1-H4) render at correct sizes
- [ ] Body text (body-large, body, body-small) renders at correct sizes
- [ ] Caption and label text render at correct sizes
- [ ] Font weights (normal, semibold, bold) are visually distinct
- [ ] Line heights provide comfortable reading (1.5 for body, 1.2 for headings)
- [ ] Letter spacing is appropriate (not too tight or loose)

### Font Hierarchy
- [ ] H1 is clearly the largest/most prominent
- [ ] H2, H3, H4 follow a clear descending hierarchy
- [ ] Body text is easily readable at default size
- [ ] Caption text is smaller but still legible
- [ ] Text sizes are consistent across similar components

### Responsive Typography
- [ ] Mobile (320px-767px): Font sizes scale down appropriately
- [ ] Tablet (768px-1023px): Font sizes are comfortable for mid-range screens
- [ ] Desktop (1024px+): Font sizes are optimized for large screens
- [ ] No text overflow or cutoff at any breakpoint

---

## Section 4: Spacing & Layout

### Component Spacing
- [ ] Card padding is consistent across all cards
- [ ] Button padding is consistent across all buttons
- [ ] Form element spacing (gap between inputs) is consistent
- [ ] Modal padding is consistent across all modals
- [ ] Section margins provide clear separation

### Responsive Spacing
- [ ] Mobile: Spacing is tighter but still comfortable (12px-16px)
- [ ] Desktop: Spacing is more generous (24px-32px)
- [ ] Spacing scales smoothly between breakpoints
- [ ] No awkward gaps or crowded sections

### 8-Point Grid Adherence
- [ ] All spacing values are multiples of 8px (or 4px for tight spaces)
- [ ] No arbitrary spacing values (e.g., 13px, 19px)

---

## Section 5: Shadows & Elevation

### Shadow Hierarchy
- [ ] **Buttons** use shadow-button (subtle elevation)
- [ ] **Cards** use shadow-card (moderate elevation)
- [ ] **Dropdowns** use shadow-dropdown (higher than cards)
- [ ] **Modals** use shadow-modal (highest elevation)
- [ ] Shadows create a clear visual hierarchy (lower elements appear behind higher ones)

### Shadow Rendering
- [ ] Shadows are visible in Light theme (dark shadows on light background)
- [ ] Shadows are visible in Dark theme (lighter shadows on dark background)
- [ ] Shadows are not too harsh or distracting
- [ ] Shadows do not have performance issues (no flickering or lag)

---

## Section 6: Interactive Elements

### Buttons
- [ ] **Normal state**: Correct color, padding, rounded corners
- [ ] **Hover state**: Color changes or shadow increases (smooth transition)
- [ ] **Focus state**: Clear focus ring visible (keyboard navigation)
- [ ] **Active state**: Button appears "pressed" (scale down or darker color)
- [ ] **Disabled state**: Reduced opacity, not clickable
- [ ] All button variants (primary, secondary, success, error) work correctly

### Links
- [ ] Links are distinguishable from body text (color + underline)
- [ ] **Hover state**: Color change or underline appears
- [ ] **Focus state**: Clear focus ring visible
- [ ] **Visited state**: Optional - distinct color if needed

### Form Inputs
- [ ] **Normal state**: Clear border, readable text
- [ ] **Focus state**: Border color changes + focus ring appears
- [ ] **Error state**: Red border + error message with icon
- [ ] **Success state**: Green border + success message with icon
- [ ] **Disabled state**: Reduced opacity, not editable
- [ ] Placeholder text is visible but distinguishable from user input

### Checkboxes & Radio Buttons
- [ ] Checkboxes/radios are easily clickable (44x44px touch target)
- [ ] Checked state is clearly visible
- [ ] **Focus state**: Focus ring appears around checkbox/radio
- [ ] Labels are clickable (entire label triggers checkbox)

---

## Section 7: Animations & Transitions

### Transition Speed
- [ ] Hover transitions are fast (150ms - instant feedback)
- [ ] Button clicks are snappy (200ms)
- [ ] Modal open/close animations are smooth (300ms)
- [ ] No animations feel sluggish or too fast

### Animation Quality
- [ ] Animations use GPU-accelerated properties (transform, opacity)
- [ ] No jank or stuttering during animations
- [ ] Loading spinners rotate smoothly
- [ ] Pulse/bounce animations are subtle and not distracting

### Reduced Motion Support
- [ ] Test with OS-level "Reduce Motion" setting enabled
- [ ] Animations are disabled or reduced to minimal duration
- [ ] Page is still usable without animations

---

## Section 8: Theme Switching

### Theme Toggle Functionality
- [ ] **Light theme** button switches to light mode
- [ ] **Dark theme** button switches to dark mode
- [ ] **System theme** button respects OS preference
- [ ] Theme persists after page refresh (localStorage)
- [ ] Theme switch is instant (no flicker or flash)

### Theme Consistency
- [ ] All components update when theme changes
- [ ] No components stuck in wrong theme
- [ ] No hardcoded colors visible (e.g., #hex values that don't change)
- [ ] Images/logos have appropriate variants for each theme (if needed)

---

## Section 9: Accessibility

### Keyboard Navigation
- [ ] All interactive elements are reachable with Tab key
- [ ] Tab order follows logical reading order (left-to-right, top-to-bottom)
- [ ] Enter key activates buttons and links
- [ ] Space key toggles checkboxes
- [ ] Arrow keys work in dropdowns/select menus
- [ ] No keyboard traps (can always Tab out of an element)

### Focus Indicators
- [ ] Focus rings are clearly visible on all elements
- [ ] Focus ring contrast is ≥ 3:1 against background
- [ ] Focus rings do not obscure content
- [ ] Focus rings are consistent size/style across all elements

### Screen Reader Support
- [ ] Icon-only buttons have `aria-label` attributes
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages have `aria-describedby` linking to input
- [ ] Status changes are announced (e.g., "Loading", "Error occurred")
- [ ] All images have `alt` text (or `alt=""` if decorative)

### Zoom & Text Scaling
- [ ] Page is usable at 150% zoom (no horizontal scroll on desktop)
- [ ] Page is usable at 200% zoom (layout reflows, no text cutoff)
- [ ] Text remains readable when browser font size is increased

---

## Section 10: Cross-Browser Compatibility

### Browser-Specific Issues
- [ ] **Chrome/Edge (Blink)**: All features work correctly
- [ ] **Firefox (Gecko)**: All features work correctly
- [ ] **Safari (WebKit)**: All features work correctly (check iOS Safari too)
- [ ] **Mobile browsers**: Responsive design works on iOS Safari and Chrome Android

### Known Browser Quirks
- [ ] CSS custom properties (design tokens) render correctly in all browsers
- [ ] Flexbox/Grid layouts render consistently
- [ ] Animations/transitions work smoothly in all browsers
- [ ] No browser-specific visual glitches (e.g., Safari rendering bugs)

---

## Section 11: Mobile Responsiveness

### Viewport Testing
- [ ] **320px (iPhone SE)**: Layout not broken, text readable, buttons tappable
- [ ] **375px (iPhone 12/13)**: Comfortable layout, no overflow
- [ ] **414px (iPhone Pro Max)**: Full layout, proper spacing
- [ ] **768px (iPad Portrait)**: Tablet-optimized layout
- [ ] **1024px (iPad Landscape)**: Desktop-like layout

### Touch Targets
- [ ] All buttons are at least 44x44px (WCAG AAA guideline)
- [ ] Links have enough spacing to avoid accidental taps
- [ ] Form inputs are easy to tap (no tiny hit areas)

### Mobile-Specific Features
- [ ] Hamburger menu (if applicable) opens/closes smoothly
- [ ] Dropdowns work correctly on touch devices
- [ ] No hover-only interactions (all features accessible via tap)
- [ ] Pinch-to-zoom is not disabled (unless intentionally)

---

## Section 12: Page-Specific Checks

### Homepage
- [ ] Hero section renders correctly in this theme
- [ ] CTA buttons are prominent and clickable
- [ ] Images/graphics display correctly
- [ ] No layout shifts or content jumping

### Dashboard Pages
- [ ] Charts/graphs use theme-appropriate colors
- [ ] Data tables are readable
- [ ] Stat cards have correct background/foreground colors
- [ ] Sidebar/navigation is theme-consistent

### Forms
- [ ] All form inputs render correctly
- [ ] Validation messages are visible and readable
- [ ] Submit button is prominent
- [ ] Multi-step forms show correct progress indicator

### Modals
- [ ] Modal backdrop is semi-transparent (dims background)
- [ ] Modal content is centered and readable
- [ ] Close button is visible and functional
- [ ] Modal can be dismissed with Esc key

---

## Issue Tracking

### Discovered Issues

**Issue #1:**
- **Component/Page**: _____________________
- **Description**: _____________________
- **Severity**: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- **Screenshot**: Attach or link screenshot
- **Browser/Device**: _____________________

**Issue #2:**
- **Component/Page**: _____________________
- **Description**: _____________________
- **Severity**: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- **Screenshot**: Attach or link screenshot
- **Browser/Device**: _____________________

**Issue #3:**
- **Component/Page**: _____________________
- **Description**: _____________________
- **Severity**: ☐ Critical  ☐ High  ☐ Medium  ☐ Low
- **Screenshot**: Attach or link screenshot
- **Browser/Device**: _____________________

*(Add more issues as needed)*

---

## Final Sign-Off

### Theme Tested: ☐ Light  ☐ Dark  ☐ System

- [ ] All sections completed
- [ ] All critical/high issues documented
- [ ] Theme is ready for production (if all checks pass)

**Tester Signature**: _____________________  
**Date**: _____________________  
**Approval Status**: ☐ Approved  ☐ Approved with Minor Issues  ☐ Rejected (Major Issues)

---

## Severity Guidelines

**Critical**: Page/component completely unusable (e.g., white text on white background)  
**High**: Major visual issue affecting multiple users (e.g., poor contrast, unreadable text)  
**Medium**: Noticeable issue but workaround available (e.g., inconsistent spacing)  
**Low**: Minor visual inconsistency (e.g., 1px border difference)

---

## Testing Tools

- **Storybook Accessibility Addon**: Built-in contrast checker
- **Axe DevTools**: Browser extension for WCAG compliance
- **WAVE**: Web accessibility evaluation tool
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Responsive Viewer**: Browser extension for multi-viewport testing

---

**Next Steps After Testing:**
1. Document all issues in GitHub Issues or project tracker
2. Prioritize fixes based on severity
3. Update design tokens in `src/design-tokens/semantic/colors.ts` (or other token files)
4. Re-run this checklist after fixes
5. Get stakeholder approval before production deployment
