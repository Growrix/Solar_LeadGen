# Border Radius Patterns Guide

**Feature**: 004 - Centralized Design Token System  
**Phase**: 8 (User Story 9 - Border Radius Standardization)  
**Last Updated**: October 28, 2025

---

## Overview

This guide documents the border radius system for the SolarMatch application. Consistent corner rounding creates visual hierarchy, improves brand identity, and ensures usability across all UI elements.

**Key Principles:**
- **Consistency**: Similar components share the same radius
- **Hierarchy**: Larger containers use larger radius values
- **Nesting**: Parent radius ≥ Child radius (no inversions)
- **Accessibility**: Radius values don't compromise clickability
- **Performance**: Border-radius has minimal performance impact

---

## Border Radius Scale

### Complete Token Reference

| Token | Value | Tailwind Class | Use Cases |
|-------|-------|----------------|-----------|
| **None** | 0px | *(default)* | Rectangular containers, dividers, full-width elements |
| **Small** | 4px | `rounded` | Badges, chips, tags, status indicators, small pills |
| **Medium** | 8px | `rounded-lg` | Buttons, inputs, form elements, interactive components |
| **Large** | 12px | `rounded-xl` | Cards, content panels, dropdowns, medium modals |
| **Extra Large** | 16px | `rounded-2xl` | Large containers, hero sections, prominent modals |
| **Full** | 9999px | `rounded-full` | Pill buttons, circular avatars, search bars |

### Visual Scale Comparison

```
Sharp (0px)     ┌──────────┐
                │          │  No rounding
                └──────────┘

Small (4px)     ┌─────────┐
                │         │   Subtle corners
                └─────────┘

Medium (8px)    ╭─────────╮
                │         │   Standard interactive elements
                ╰─────────╯

Large (12px)    ╭────────╮
                │        │    Cards and panels
                ╰────────╯

Extra Large     ╭───────╮
(16px)          │       │     Large containers
                ╰───────╯

Full (9999px)   ╭──────╮
                │      │      Pills and circles
                ╰──────╯
```

---

## Component-Specific Patterns

### 1. Buttons

**Standard Radius**: `rounded-lg` (8px)

```tsx
// ✓ Correct: All buttons use rounded-lg
<button className="bg-primary text-white px-6 py-3 rounded-lg">
  Primary Button
</button>

<button className="border-2 border-primary text-primary px-6 py-3 rounded-lg">
  Outlined Button
</button>

// ✗ Incorrect: Mixing different radius values
<button className="bg-primary text-white px-6 py-3 rounded-xl">
  Don't mix radius values
</button>
```

**Size Variations** (all maintain same radius):
- **Small**: `px-4 py-2 rounded-lg text-body-small`
- **Medium**: `px-6 py-3 rounded-lg text-body` (default)
- **Large**: `px-8 py-4 rounded-lg text-body-large`

**Exception - Pill Buttons**:
```tsx
// Pill-shaped buttons use rounded-full
<button className="bg-primary text-white px-6 py-2 rounded-full">
  Pill Button
</button>
```

### 2. Form Inputs

**Standard Radius**: `rounded-lg` (8px) - matches buttons

```tsx
// ✓ Correct: All inputs use rounded-lg
<input
  type="text"
  className="w-full px-4 py-3 rounded-lg border border-border bg-surface"
/>

<select className="w-full px-4 py-3 rounded-lg border border-border bg-surface">
  <option>Select option</option>
</select>

<textarea
  rows={4}
  className="w-full px-4 py-3 rounded-lg border border-border bg-surface"
/>
```

**Search Bars (Exception)**:
```tsx
// Search inputs often use rounded-full for distinctive appearance
<input
  type="search"
  className="px-6 py-3 rounded-full border border-border bg-surface"
  placeholder="Search..."
/>
```

### 3. Cards & Panels

**Standard Radius**: `rounded-xl` (12px)

```tsx
// ✓ Correct: Cards use rounded-xl
<div className="bg-surface border border-border rounded-xl p-6 shadow-card">
  <h4 className="font-heading-4 mb-2">Card Title</h4>
  <p className="text-body-small text-foreground-secondary">Card content</p>
</div>
```

**Nesting Pattern**:
```tsx
// ✓ Correct: Card (12px) → Button (8px) - proper hierarchy
<div className="bg-surface rounded-xl p-6 shadow-card">
  <h4 className="font-heading-4 mb-4">Quote Summary</h4>
  <div className="bg-primary-light rounded-lg p-4 mb-4">
    <p>System Size: 8.5 kW</p>
  </div>
  <button className="bg-primary text-white px-6 py-3 rounded-lg w-full">
    Accept Quote
  </button>
</div>

// ✗ Incorrect: Card (8px) → Button (16px) - inverted hierarchy
<div className="bg-surface rounded-lg p-6">
  <button className="bg-primary text-white px-6 py-3 rounded-2xl">
    Don't invert hierarchy
  </button>
</div>
```

### 4. Badges & Tags

**Standard Radius**: `rounded` (4px)

```tsx
// ✓ Correct: Small badges use minimal radius
<span className="bg-success text-white px-3 py-1 rounded text-body-small">
  Success
</span>

<span className="bg-warning text-white px-3 py-1 rounded text-body-small">
  Warning
</span>

// Exception: Status pills use rounded-full
<span className="bg-success text-white px-4 py-2 rounded-full text-body-small">
  Active Status
</span>
```

### 5. Modals & Dialogs

**Standard Radius**: `rounded-2xl` (16px)

```tsx
// ✓ Correct: Large modals use rounded-2xl
<div className="bg-surface border border-border rounded-2xl p-8 shadow-modal">
  <h3 className="font-heading-3 mb-6">Modal Title</h3>
  <p className="text-body text-foreground-secondary mb-6">
    Modal content here...
  </p>
  <div className="flex gap-3">
    <button className="flex-1 bg-primary text-white px-6 py-3 rounded-lg">
      Confirm
    </button>
    <button className="flex-1 border-2 border-border px-6 py-3 rounded-lg">
      Cancel
    </button>
  </div>
</div>
```

**Small Modals/Dropdowns**: Use `rounded-xl` (12px) instead

### 6. Dropdowns & Menus

**Standard Radius**: `rounded-xl` (12px)

```tsx
// ✓ Correct: Dropdown menu with rounded-xl
<div className="absolute z-50 bg-surface border border-border rounded-xl shadow-dropdown">
  <button className="w-full px-4 py-2 text-left hover:bg-surface-hover">
    Option 1
  </button>
  <button className="w-full px-4 py-2 text-left hover:bg-surface-hover">
    Option 2
  </button>
</div>
```

---

## Nesting Hierarchy Rules

### Rule: Parent Radius ≥ Child Radius

**Correct Nesting Examples:**

```tsx
// Example 1: Modal (16px) → Card (12px) → Button (8px)
<div className="rounded-2xl p-8 shadow-modal">  {/* 16px */}
  <div className="rounded-xl p-6 bg-surface-hover">  {/* 12px */}
    <button className="rounded-lg px-6 py-3">  {/* 8px */}
      Action
    </button>
  </div>
</div>

// Example 2: Card (12px) → Badge (4px)
<div className="rounded-xl p-6 shadow-card">  {/* 12px */}
  <span className="rounded px-3 py-1 bg-success text-white">  {/* 4px */}
    New
  </span>
</div>
```

**Incorrect Nesting Examples:**

```tsx
// ✗ Inverted hierarchy: Card (8px) contains Modal (16px)
<div className="rounded-lg p-6">  {/* 8px - WRONG */}
  <div className="rounded-2xl p-4">  {/* 16px - larger than parent! */}
    Content
  </div>
</div>

// ✗ Button radius (16px) larger than Card (12px)
<div className="rounded-xl p-6 shadow-card">  {/* 12px */}
  <button className="rounded-2xl px-6 py-3">  {/* 16px - WRONG */}
    Button too rounded
  </button>
</div>
```

### Multi-Level Nesting

**Proper Cascade** (descending radius values):

```tsx
<div className="rounded-2xl p-8">          {/* Level 1: 16px (Modal) */}
  <div className="rounded-xl p-6">         {/* Level 2: 12px (Card) */}
    <div className="rounded-lg p-4">       {/* Level 3: 8px (Panel) */}
      <button className="rounded-lg">      {/* Level 4: 8px (Button) */}
        Action
      </button>
    </div>
  </div>
</div>
```

---

## Solar Industry Patterns

### Lead Card (Installer Dashboard)

```tsx
<div className="bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-dropdown transition-shadow">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h4 className="font-heading-4 mb-1">John Smith</h4>
      <p className="text-body-small text-muted">San Francisco, CA</p>
    </div>
    <span className="bg-info text-white px-3 py-1 rounded text-body-small">
      New Lead
    </span>
  </div>

  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="bg-surface-hover rounded-lg p-3">
      <p className="text-body-small text-muted mb-1">Monthly Bill</p>
      <p className="font-heading-4">$180</p>
    </div>
    <div className="bg-surface-hover rounded-lg p-3">
      <p className="text-body-small text-muted mb-1">Property Type</p>
      <p className="font-heading-4 text-body-small">Single Family</p>
    </div>
  </div>

  <button className="w-full bg-success text-white px-6 py-3 rounded-lg">
    View Lead Details
  </button>
</div>
```

**Radius Usage:**
- Card container: `rounded-xl` (12px) - establishes primary container
- Status badge: `rounded` (4px) - small accent element
- Info boxes: `rounded-lg` (8px) - nested secondary containers
- Action button: `rounded-lg` (8px) - interactive element

### Quote Card

```tsx
<div className="bg-surface border border-border rounded-xl p-6 shadow-card">
  <div className="flex justify-between items-start mb-6">
    <div>
      <h4 className="font-heading-4 mb-1">SunPower Solutions</h4>
      <p className="text-body-small text-muted">Premium installer</p>
    </div>
    <span className="bg-success text-white px-3 py-1 rounded text-body-small">
      Approved
    </span>
  </div>

  <div className="bg-primary-light rounded-lg p-4 mb-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-body-small text-primary-dark">System Size</p>
        <p className="font-heading-3 text-primary">8.5 kW</p>
      </div>
      <div>
        <p className="text-body-small text-primary-dark">Total Cost</p>
        <p className="font-heading-3 text-primary">$24,500</p>
      </div>
    </div>
  </div>

  <div className="flex gap-3">
    <button className="flex-1 bg-primary text-white px-6 py-3 rounded-lg">
      Accept Quote
    </button>
    <button className="flex-1 border-2 border-border px-6 py-3 rounded-lg">
      View Details
    </button>
  </div>
</div>
```

**Radius Usage:**
- Card container: `rounded-xl` (12px)
- Status badge: `rounded` (4px)
- Pricing panel: `rounded-lg` (8px)
- Action buttons: `rounded-lg` (8px)

### Quote Request Form

```tsx
<div className="bg-surface border border-border rounded-xl p-6 shadow-card">
  <h4 className="font-heading-4 mb-6">Get Your Free Quote</h4>
  <div className="space-y-4">
    <input
      type="text"
      placeholder="Property Address"
      className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:border-primary focus:shadow-focus"
    />
    <input
      type="number"
      placeholder="Monthly Electric Bill ($)"
      className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:border-primary focus:shadow-focus"
    />
    <select className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:border-primary focus:shadow-focus">
      <option>Property Type</option>
      <option>Single Family Home</option>
      <option>Multi-Family Home</option>
    </select>
    <button className="w-full bg-primary text-white px-6 py-3 rounded-lg shadow-button hover:shadow-card transition-shadow">
      Request Quote
    </button>
  </div>
</div>
```

**Radius Usage:**
- Form container: `rounded-xl` (12px)
- All inputs: `rounded-lg` (8px) - matches button radius
- Submit button: `rounded-lg` (8px)

### Search Bar with Filters

```tsx
<div className="bg-surface border border-border rounded-xl p-6 shadow-card">
  <div className="flex gap-3 mb-4">
    <input
      type="search"
      placeholder="Search installers..."
      className="flex-1 px-6 py-3 rounded-full border border-border bg-surface focus:border-primary focus:shadow-focus"
    />
    <button className="bg-primary text-white px-6 py-3 rounded-lg">
      Search
    </button>
  </div>
  <div className="flex gap-3 flex-wrap">
    <span className="text-body-small text-muted">Filters:</span>
    <button className="bg-primary-light text-primary px-4 py-1 rounded-full text-body-small">
      Location: CA
    </button>
    <button className="bg-primary-light text-primary px-4 py-1 rounded-full text-body-small">
      Rating: 4+ stars
    </button>
  </div>
</div>
```

**Radius Usage:**
- Container: `rounded-xl` (12px)
- Search input: `rounded-full` (pill shape for distinction)
- Search button: `rounded-lg` (8px)
- Filter pills: `rounded-full` (pill shape)

---

## Best Practices

### DO ✓

1. **Maintain Consistency**
   - All buttons use `rounded-lg` (8px)
   - All cards use `rounded-xl` (12px)
   - All small badges use `rounded` (4px)

2. **Follow Hierarchy**
   - Larger containers = larger radius
   - Nested elements = equal or smaller radius
   - Modals (16px) > Cards (12px) > Buttons (8px) > Badges (4px)

3. **Match Related Elements**
   - Buttons and inputs both use `rounded-lg` for visual cohesion
   - Form elements within a card maintain same radius

4. **Consider Touch Targets**
   - Avoid extremely large radius on small buttons (reduces tappable area)
   - Minimum 44×44px touch target size (WCAG 2.1 AAA)

5. **Use Focus Rings**
   - Focus indicators should match element radius
   - Use `shadow-focus` which adapts to element shape

### DON'T ✗

1. **Don't Invert Hierarchy**
   ```tsx
   // ✗ WRONG: Card (8px) contains button (16px)
   <div className="rounded-lg">
     <button className="rounded-2xl">Button</button>
   </div>
   ```

2. **Don't Mix Arbitrary Values**
   ```tsx
   // ✗ WRONG: Custom radius values
   <button style={{ borderRadius: '10px' }}>Button</button>
   
   // ✓ CORRECT: Use design tokens
   <button className="rounded-lg">Button</button>
   ```

3. **Don't Skip Consistency**
   ```tsx
   // ✗ WRONG: Different buttons with different radius
   <button className="rounded-lg">Button 1</button>
   <button className="rounded-xl">Button 2</button>  {/* inconsistent! */}
   ```

4. **Don't Compromise Clickability**
   ```tsx
   // ✗ WRONG: Large radius on small button (hard to tap center)
   <button className="px-3 py-1 rounded-2xl text-body-small">
     Tiny button, huge radius
   </button>
   ```

5. **Don't Forget Overflow**
   ```tsx
   // ✗ WRONG: Image not contained by rounded parent
   <div className="rounded-xl">
     <img src="image.jpg" />  {/* no overflow handling */}
   </div>
   
   // ✓ CORRECT: Add overflow-hidden
   <div className="rounded-xl overflow-hidden">
     <img src="image.jpg" />
   </div>
   ```

---

## Accessibility Considerations

### 1. Touch Target Sizing

**WCAG 2.1 Level AAA**: Touch targets should be at least 44×44px.

```tsx
// ✓ Good: Large button with moderate radius
<button className="bg-primary text-white px-8 py-4 rounded-lg">
  Large Button (48px height)
</button>

// ✗ Poor: Small button with large radius (reduces effective tap area)
<button className="bg-primary text-white px-4 py-1 rounded-2xl text-body-small">
  Small Button (28px height, 16px radius)
</button>
```

**Rule**: Avoid radius values > 50% of button height on small elements.

### 2. Focus State Clarity

Focus rings should match element radius:

```tsx
// ✓ Correct: Focus ring adapts to button radius
<button className="rounded-lg focus:shadow-focus focus:outline-none">
  Button with Focus Ring
</button>

// Input fields too
<input
  className="rounded-lg border border-border focus:border-primary focus:shadow-focus focus:outline-none"
/>
```

### 3. Visual Hierarchy

Use radius to reinforce hierarchy:

```tsx
// ✓ Clear hierarchy: Modal (16px) > Card (12px) > Button (8px)
<div className="rounded-2xl p-8 shadow-modal">  {/* Most prominent */}
  <div className="rounded-xl p-6 bg-surface">   {/* Secondary */}
    <button className="rounded-lg">             {/* Tertiary */}
      Action
    </button>
  </div>
</div>
```

### 4. Content Clipping

Ensure rounded corners don't obscure important content:

```tsx
// ✓ Correct: Adequate padding inside rounded container
<div className="rounded-xl p-6">
  <p>Content has breathing room</p>
</div>

// ✗ Poor: Content too close to rounded edges
<div className="rounded-xl p-1">
  <p>Content might clip at corners</p>
</div>
```

**Rule**: Padding should be at least 1.5× the radius value for comfortable reading.

---

## Testing Checklist

### Visual Testing

- [ ] **Consistency Check**: All similar components use same radius
  - All buttons: `rounded-lg` (8px)
  - All cards: `rounded-xl` (12px)
  - All badges: `rounded` (4px)

- [ ] **Hierarchy Check**: Nested elements follow proper radius cascade
  - Parent radius ≥ Child radius (no inversions)
  - Modal (16px) > Card (12px) > Button (8px) > Badge (4px)

- [ ] **Overflow Check**: Images/backgrounds respect rounded corners
  - Add `overflow-hidden` to rounded containers with images
  - Verify no content clipping at corners

- [ ] **Theme Testing**: Radius consistent across Light/Dark/System themes
  - Radius values don't change with theme
  - Focus rings visible in both themes

### Accessibility Testing

- [ ] **Touch Targets**: Interactive elements ≥ 44×44px (WCAG 2.1 AAA)
  - Buttons maintain adequate size with rounded corners
  - Radius doesn't reduce effective tappable area by >20%

- [ ] **Focus Visibility**: Focus rings visible on all interactive elements
  - Focus rings match element radius (use `shadow-focus`)
  - Keyboard navigation clearly shows focus state
  - Focus ring contrast meets WCAG AA (3:1 minimum)

- [ ] **Visual Hierarchy**: Radius reinforces content hierarchy
  - Larger containers have larger radius (clear parent-child relationships)
  - Interactive elements distinguishable from static content

### Cross-Browser Testing

- [ ] **Modern Browsers**: Radius renders correctly
  - Chrome/Edge (latest)
  - Firefox (latest)
  - Safari (latest)

- [ ] **Mobile Browsers**:
  - Safari iOS (latest)
  - Chrome Android (latest)

- [ ] **Edge Cases**:
  - High-DPI displays (retina)
  - Zoom levels (100%, 150%, 200%)
  - Reduced motion preferences (animations disabled)

---

## Migration Guide

### Refactoring Hardcoded Radius Values

**Step 1**: Identify hardcoded values

```bash
# Find inline styles with borderRadius
grep -r "borderRadius" src/

# Find hardcoded rounded-* classes (non-standard)
grep -r "rounded-[0-9]" src/
```

**Step 2**: Map to design tokens

| Old Value | New Token | Tailwind Class |
|-----------|-----------|----------------|
| `borderRadius: '4px'` | Small | `rounded` |
| `borderRadius: '8px'` | Medium | `rounded-lg` |
| `borderRadius: '12px'` | Large | `rounded-xl` |
| `borderRadius: '16px'` | Extra Large | `rounded-2xl` |
| `borderRadius: '50%'` or `'9999px'` | Full | `rounded-full` |

**Step 3**: Replace inline styles

```tsx
// Before
<button style={{ borderRadius: '8px' }}>Button</button>

// After
<button className="rounded-lg">Button</button>
```

**Step 4**: Verify visual consistency

- Capture Chromatic baseline before changes
- Refactor components one at a time
- Compare Chromatic snapshots (should show minimal/zero diffs)
- QA all themes (Light/Dark/System)

---

## Quick Reference

### Component Radius Cheat Sheet

| Component Type | Tailwind Class | Pixel Value | Example |
|----------------|----------------|-------------|---------|
| **Buttons** | `rounded-lg` | 8px | Primary, Secondary, Ghost |
| **Inputs** | `rounded-lg` | 8px | Text, Email, Select, Textarea |
| **Cards** | `rounded-xl` | 12px | Quote Card, Lead Card, Content Panel |
| **Badges** | `rounded` | 4px | Status, Tags, Labels |
| **Pills** | `rounded-full` | 9999px | Pill Buttons, Search Bars, Filter Tags |
| **Modals** | `rounded-2xl` | 16px | Dialogs, Large Overlays |
| **Dropdowns** | `rounded-xl` | 12px | Menus, Popovers, Tooltips |

### Nesting Quick Reference

```
Modal (16px)
└── Card (12px)
    ├── Panel (8px)
    ├── Button (8px)
    └── Badge (4px)
```

**Rule**: Always descend or maintain, never ascend.

---

## Troubleshooting

### Issue 1: Rounded corners not visible

**Diagnosis**: Parent container may have `overflow: visible` (default)

**Solution**: Add `overflow-hidden` to rounded containers with backgrounds/images

```tsx
// Fix: Add overflow-hidden
<div className="rounded-xl overflow-hidden">
  <img src="image.jpg" className="w-full h-auto" />
</div>
```

### Issue 2: Focus ring cut off by rounded corners

**Diagnosis**: `overflow-hidden` clips focus ring

**Solution**: Use `shadow-focus` instead of border-based focus, or add padding

```tsx
// Fix: Use shadow-focus (renders outside element)
<button className="rounded-lg focus:shadow-focus focus:outline-none">
  Button
</button>
```

### Issue 3: Inconsistent radius across similar components

**Diagnosis**: Components not using design token classes

**Solution**: Audit and standardize all similar components

```bash
# Find all buttons in codebase
grep -r "<button" src/ | grep -v "rounded-lg"

# Refactor to use rounded-lg
```

### Issue 4: Nested elements have larger radius than parent

**Diagnosis**: Violation of nesting hierarchy rule

**Solution**: Reduce child radius to equal or smaller than parent

```tsx
// Before (WRONG)
<div className="rounded-lg p-6">  {/* 8px */}
  <button className="rounded-2xl">  {/* 16px - larger! */}
    Button
  </button>
</div>

// After (CORRECT)
<div className="rounded-xl p-6">  {/* 12px */}
  <button className="rounded-lg">  {/* 8px - smaller or equal */}
    Button
  </button>
</div>
```

---

## Resources

### Storybook Stories

- **Design Tokens/Border Radius**: Complete radius token showcase with visual examples
- **Components/Rounded Components**: Real-world component examples using radius tokens

### Related Documentation

- `specs/004-centralized-theme-color/quickstart.md` - Developer quickstart guide
- `specs/004-centralized-theme-color/audits/elevation-system-guide.md` - Shadow/elevation system (pairs with radius)
- `specs/004-centralized-theme-color/audits/spacing-patterns.md` - Spacing system guide

### External References

- [Tailwind CSS Border Radius](https://tailwindcss.com/docs/border-radius)
- [WCAG 2.1 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - Accessibility guidelines
- [Material Design Shape](https://material.io/design/shape) - Shape design principles

---

**Last Updated**: October 28, 2025  
**Maintained By**: SolarMatch Design System Team  
**Questions?**: See `quickstart.md` or consult design system documentation
