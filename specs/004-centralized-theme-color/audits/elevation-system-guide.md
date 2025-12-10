# Elevation System Guide

**Purpose**: Complete reference for implementing consistent visual hierarchy using shadow tokens in the SolarMatch application.

**Audience**: Designers, Developers, QA Engineers

**Last Updated**: 2025-10-28

---

## Overview

The elevation system uses **5 levels of shadows** to create visual depth and hierarchy. Each level represents how "close" an element appears to the user, with higher levels sitting above lower levels.

**Key Principle**: Shadow elevation should always match z-index stacking order.

---

## The 5-Level System

### Level 0: No Shadow (Flat Elements)

**Token**: None (no shadow applied)

**Visual**: Flat, sits on page surface

**Z-Index**: `z-0` (default)

**Use Cases**:
- Page backgrounds
- Inline text
- Text links
- Flat UI components
- Icons within components

**Example**:
```tsx
<div className="bg-surface">
  <p className="text-body">Flat content on page surface</p>
</div>
```

---

### Level 1: Button Shadow

**Token**: `shadow-button`

**Values**:
- **Light Mode**: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
- **Dark Mode**: `0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.8)`

**Visual**: Subtle elevation, barely lifted off surface

**Z-Index**: `z-1` (or `z-10` for clarity)

**Use Cases**:
- Primary buttons
- Secondary buttons
- Action buttons
- Chips/badges (when clickable)
- Small interactive elements

**Hover Behavior**: Increase to `shadow-card` on hover

**Example**:
```tsx
<button className="bg-primary text-white px-6 py-3 rounded-lg shadow-button hover:shadow-card transition-shadow">
  Get Free Quote
</button>
```

**Measurement**: ~2-4px shadow spread

---

### Level 2: Card Shadow

**Token**: `shadow-card`

**Values**:
- **Light Mode**: `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`
- **Dark Mode**: `0 3px 6px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.9)`

**Visual**: Clear elevation, visibly separated from surface

**Z-Index**: `z-10`

**Use Cases**:
- Content cards
- Panels
- Sections with content grouping
- Dashboard widgets
- Lead/quote cards
- Profile cards

**Hover Behavior**: Optional increase to `shadow-dropdown` for interactive cards

**Example**:
```tsx
<div className="bg-surface rounded-lg shadow-card p-6 hover:shadow-dropdown transition-shadow cursor-pointer">
  <h4 className="font-heading-4">Solar Quote</h4>
  <p className="text-body">System size: 8.5 kW</p>
</div>
```

**Measurement**: ~4-8px shadow spread

---

### Level 3: Dropdown Shadow

**Token**: `shadow-dropdown`

**Values**:
- **Light Mode**: `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)`
- **Dark Mode**: `0 10px 20px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.95)`

**Visual**: Significant elevation, clearly floating above content

**Z-Index**: `z-50`

**Use Cases**:
- Dropdown menus
- Select options
- Popovers
- Tooltips (complex)
- Context menus
- Autocomplete suggestions

**Positioning**: Always position above parent element (use `absolute` or `fixed`)

**Example**:
```tsx
<div className="relative">
  <button className="bg-primary text-white px-4 py-2 rounded">
    Select Installer
  </button>
  <div className="absolute top-full left-0 mt-2 bg-surface rounded-lg shadow-dropdown border border-border min-w-[200px] z-50">
    <div className="p-2">
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        SunPower Solutions
      </button>
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        Tesla Solar
      </button>
    </div>
  </div>
</div>
```

**Measurement**: ~10-20px shadow spread

---

### Level 4: Modal Shadow

**Token**: `shadow-modal`

**Values**:
- **Light Mode**: `0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)`
- **Dark Mode**: `0 14px 28px rgba(0,0,0,0.8), 0 10px 10px rgba(0,0,0,1)`

**Visual**: Maximum elevation, highest priority element

**Z-Index**: `z-100` (or higher if multiple modal layers)

**Use Cases**:
- Modal dialogs
- Confirmation dialogs
- Full-screen overlays
- Lightboxes
- Image previews

**Backdrop**: Always include semi-transparent backdrop (`bg-black/50`)

**Example**:
```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/50 z-100" />

{/* Modal */}
<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-surface rounded-lg shadow-modal border border-border p-6 max-w-md z-100">
  <h4 className="font-heading-4 mb-4">Confirm Action</h4>
  <p className="text-body mb-6">Are you sure you want to delete this lead?</p>
  <div className="flex gap-3">
    <button className="flex-1 bg-error text-white px-4 py-2 rounded shadow-button">
      Yes, Delete
    </button>
    <button className="flex-1 border-2 border-border px-4 py-2 rounded">
      Cancel
    </button>
  </div>
</div>
```

**Measurement**: ~14-28px shadow spread

---

### Special: Focus Shadow

**Token**: `shadow-focus`

**Value**: `0 0 0 3px rgba(20, 184, 166, 0.3)` (teal ring, theme-aware)

**Visual**: Blue/teal ring around element

**Z-Index**: N/A (overlay effect, not stacking)

**Use Cases**:
- Keyboard focus on buttons
- Input focus states
- Link focus states
- Any interactive element focus (accessibility requirement)

**Accessibility**: **Required** for WCAG 2.1 Level AA compliance

**Example**:
```tsx
<input 
  type="text"
  className="px-4 py-3 rounded-lg border border-border bg-surface
             focus:border-primary focus:shadow-focus focus:outline-none"
  placeholder="Enter email"
/>
```

**Combination**: Can combine with `shadow-button` or `shadow-card`

---

## Z-Index Scale

Elevation levels directly correlate with z-index values:

| Level | Shadow Token | Z-Index | Element Type |
|-------|--------------|---------|--------------|
| 0 | None | `z-0` | Page surface, inline text |
| 1 | `shadow-button` | `z-10` | Buttons, chips, badges |
| 2 | `shadow-card` | `z-20` | Cards, panels, sections |
| 3 | `shadow-dropdown` | `z-50` | Dropdowns, menus, popovers |
| 4 | `shadow-modal` | `z-100` | Modals, dialogs, overlays |
| Focus | `shadow-focus` | N/A | Focus ring (any element) |

**Rule**: Higher shadow = Higher z-index (no exceptions)

---

## Theme Adaptation

Shadows automatically adapt to Light/Dark themes:

### Light Theme Shadows
- **Characteristics**: Subtle, soft, low opacity (0.12-0.25)
- **Purpose**: Create depth without overwhelming light backgrounds
- **Color**: Black with low alpha (`rgba(0,0,0,0.X)`)

### Dark Theme Shadows
- **Characteristics**: Deep, strong, high opacity (0.5-1.0)
- **Purpose**: Create contrast against dark backgrounds
- **Color**: Black with high alpha (`rgba(0,0,0,0.X)`)

**Implementation**: Tailwind CSS applies theme-specific shadows automatically via `.dark` class.

---

## Animation & Transitions

### Smooth Shadow Transitions

Always animate shadow changes for smooth elevation shifts:

```tsx
// ✅ CORRECT: Smooth transition
<button className="shadow-button hover:shadow-card transition-shadow">
  Hover Me
</button>

// ❌ INCORRECT: Jarring shadow change
<button className="shadow-button hover:shadow-card">
  Hover Me
</button>
```

### Transition Durations

| Transition Type | Duration | Easing | Use Case |
|-----------------|----------|--------|----------|
| Button hover | 150ms | ease | Quick feedback |
| Card hover | 200ms | ease | Smooth elevation |
| Modal open | 300ms | ease-out | Gentle appearance |
| Dropdown open | 200ms | ease-out | Responsive feel |

**Tailwind Classes**:
- `transition-shadow` (default 150ms)
- `transition-all duration-200` (200ms)
- `transition-all duration-300` (300ms)

---

## Best Practices

### ✅ DO

1. **Match shadow to z-index**: Higher shadow = Higher z-index
2. **Use semantic tokens**: `shadow-button`, `shadow-card`, not `shadow-md`
3. **Animate transitions**: Always use `transition-shadow` for hover effects
4. **Maintain hierarchy**: Button < Card < Dropdown < Modal
5. **Add borders**: Combine shadows with borders for clearer definition
6. **Test both themes**: Verify shadows visible in Light AND Dark modes
7. **Use focus shadow**: Always include `shadow-focus` for keyboard navigation

### ❌ DON'T

1. **Don't invert hierarchy**: Never place card (z-10) above modal (z-100)
2. **Don't mix custom shadows**: Use tokens only, not `shadow-lg` or custom values
3. **Don't skip transitions**: Instant shadow changes feel jarring
4. **Don't over-elevate**: Not everything needs a shadow (text, icons, inline elements don't)
5. **Don't forget accessibility**: Missing focus shadows fail WCAG 2.1 AA
6. **Don't rely on shadows alone**: Use borders + shadows for better clarity
7. **Don't use shadows on transparent backgrounds**: Shadows invisible without opaque background

---

## Common Patterns

### Pattern 1: Interactive Card

```tsx
<div className="bg-surface rounded-lg shadow-card hover:shadow-dropdown transition-shadow cursor-pointer p-6">
  <h4 className="font-heading-4 mb-2">Quote Details</h4>
  <p className="text-body text-foreground-secondary">
    Click to view full quote
  </p>
</div>
```

**Behavior**: Card (Level 2) → Dropdown (Level 3) on hover

---

### Pattern 2: Button with States

```tsx
<button className="bg-primary text-white px-6 py-3 rounded-lg 
                   shadow-button hover:shadow-card active:shadow-sm
                   focus:shadow-focus focus:outline-none
                   transition-all">
  Submit
</button>
```

**Behavior**: 
- Default: Level 1 (button shadow)
- Hover: Level 2 (card shadow)
- Active (pressed): Reduced shadow (pressed down effect)
- Focus: Level 1 + focus ring

---

### Pattern 3: Dropdown Menu

```tsx
<div className="relative">
  <button className="bg-surface border border-border px-4 py-2 rounded shadow-button">
    Options ▼
  </button>
  
  <div className="absolute top-full left-0 mt-2 
                  bg-surface rounded-lg shadow-dropdown border border-border 
                  min-w-[200px] z-50">
    <div className="p-2">
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        Option 1
      </button>
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        Option 2
      </button>
    </div>
  </div>
</div>
```

**Behavior**: Dropdown (Level 3) sits above trigger button (Level 1)

---

### Pattern 4: Modal Dialog

```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/50 z-100" onClick={closeModal} />

{/* Modal */}
<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                bg-surface rounded-lg shadow-modal border border-border 
                p-6 max-w-md z-100">
  <h4 className="font-heading-4 mb-4">Confirm Deletion</h4>
  <p className="text-body text-foreground-secondary mb-6">
    This action cannot be undone. Are you sure?
  </p>
  <div className="flex gap-3">
    <button className="flex-1 bg-error text-white px-4 py-2 rounded shadow-button">
      Delete
    </button>
    <button className="flex-1 border-2 border-border px-4 py-2 rounded">
      Cancel
    </button>
  </div>
</div>
```

**Behavior**: Modal (Level 4) sits above all other content

---

## Testing Checklist

### Visual Testing

- [ ] **Light Theme**: All shadows visible and subtle
- [ ] **Dark Theme**: All shadows visible and deeper
- [ ] **Hierarchy**: Higher shadows have higher z-index
- [ ] **Transitions**: Shadow changes animate smoothly (150-300ms)
- [ ] **Hover States**: Interactive elements elevate on hover
- [ ] **Focus States**: All focusable elements show focus ring

### Accessibility Testing

- [ ] **Keyboard Navigation**: Tab through all interactive elements
- [ ] **Focus Visible**: `shadow-focus` appears on all focused elements
- [ ] **Contrast**: Shadows don't reduce text contrast below 4.5:1
- [ ] **No Shadow-Only Indicators**: Use icons/text + shadows (not shadows alone)

### Cross-Browser Testing

- [ ] **Chrome**: Shadows render correctly
- [ ] **Firefox**: Shadows render correctly
- [ ] **Safari**: Shadows render correctly (especially macOS/iOS)
- [ ] **Mobile Safari**: Shadows visible on touch devices

---

## Troubleshooting

### Issue: Shadows Not Visible in Dark Mode

**Symptoms**: Shadows appear faint or invisible in dark theme.

**Diagnosis**: Check if dark theme shadow values have sufficient opacity.

**Fix**: Verify `tailwind.config.js` has correct dark mode shadow values:
```js
shadows: {
  button: {
    light: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    dark: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.8)', // Higher opacity
  },
}
```

---

### Issue: Shadows Too Strong/Weak

**Symptoms**: Shadows feel too heavy or too light.

**Diagnosis**: Check shadow token values in `src/design-tokens/semantic/shadows.ts`.

**Fix**: Adjust opacity values:
- Too strong: Reduce opacity (0.25 → 0.18)
- Too weak: Increase opacity (0.12 → 0.18)

---

### Issue: Z-Index Conflicts

**Symptoms**: Dropdown appears behind card, or modal behind dropdown.

**Diagnosis**: Z-index doesn't match elevation level.

**Fix**: Use correct z-index scale:
```tsx
// ❌ WRONG
<div className="shadow-modal z-10">Modal</div>

// ✅ CORRECT
<div className="shadow-modal z-100">Modal</div>
```

---

### Issue: Shadows Not Transitioning

**Symptoms**: Shadow changes instantly on hover (jarring).

**Diagnosis**: Missing `transition-shadow` class.

**Fix**:
```tsx
// ❌ WRONG
<button className="shadow-button hover:shadow-card">

// ✅ CORRECT
<button className="shadow-button hover:shadow-card transition-shadow">
```

---

## Solar Industry Examples

### Example 1: Quote Card with Actions

```tsx
<div className="bg-surface rounded-lg shadow-card hover:shadow-dropdown transition-shadow cursor-pointer p-6 max-w-md">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h4 className="font-heading-4">SunPower Solutions</h4>
      <p className="text-body-small text-muted">San Francisco, CA</p>
    </div>
    <span className="bg-success text-white px-3 py-1 rounded shadow-button">
      Approved
    </span>
  </div>
  
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div>
      <p className="text-body-small text-muted">System Size</p>
      <p className="font-heading-4">8.5 kW</p>
    </div>
    <div>
      <p className="text-body-small text-muted">Total Cost</p>
      <p className="font-heading-4 text-success">$24,500</p>
    </div>
  </div>
  
  <div className="flex gap-3">
    <button className="flex-1 bg-success text-white px-4 py-2 rounded shadow-button hover:shadow-card transition-shadow">
      Accept
    </button>
    <button className="flex-1 border-2 border-border px-4 py-2 rounded hover:shadow-button transition-shadow">
      Details
    </button>
  </div>
</div>
```

**Elevation Breakdown**:
- Quote Card: Level 2 (`shadow-card`) → Level 3 on hover
- Badge: Level 1 (`shadow-button`)
- Action Buttons: Level 1 (`shadow-button`) → Level 2 on hover

---

### Example 2: Lead Assignment Flow

```tsx
{/* Page Background: Level 0 */}
<div className="p-8">
  
  {/* Lead Card: Level 2 */}
  <div className="bg-surface rounded-lg shadow-card p-6 max-w-md mb-4">
    <h4 className="font-heading-4 mb-2">John Smith</h4>
    <p className="text-body-small text-muted">Monthly bill: $180</p>
    
    {/* Assign Button: Level 1 */}
    <button className="mt-4 bg-primary text-white px-6 py-3 rounded-lg shadow-button hover:shadow-card transition-shadow">
      Assign to Installer
    </button>
  </div>
  
  {/* Installer Selector Dropdown: Level 3 */}
  <div className="relative">
    <div className="absolute bg-surface rounded-lg shadow-dropdown border border-border min-w-[300px] z-50 p-2">
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        SunPower Solutions
      </button>
      <button className="w-full text-left px-3 py-2 rounded hover:bg-surface-hover">
        Tesla Solar
      </button>
    </div>
  </div>
  
  {/* Confirmation Modal: Level 4 */}
  <div className="fixed inset-0 bg-black/50 z-100">
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    bg-surface rounded-lg shadow-modal border border-border p-6 max-w-md z-100">
      <h4 className="font-heading-4 mb-4">Confirm Assignment</h4>
      <p className="text-body mb-6">Assign John Smith to SunPower Solutions?</p>
      <div className="flex gap-3">
        <button className="flex-1 bg-success text-white px-4 py-2 rounded shadow-button">
          Confirm
        </button>
        <button className="flex-1 border-2 border-border px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
```

**Complete Hierarchy**: Page (0) → Card (2) → Dropdown (3) → Modal (4) ✓

---

## Quick Reference

### Shadow Token Cheat Sheet

```tsx
// Level 1: Buttons, chips
shadow-button

// Level 2: Cards, panels
shadow-card

// Level 3: Dropdowns, menus
shadow-dropdown

// Level 4: Modals, dialogs
shadow-modal

// Special: Focus ring
shadow-focus

// Animation
transition-shadow
transition-all duration-200
transition-all duration-300
```

### Z-Index Cheat Sheet

```tsx
z-0    // Page surface (no shadow)
z-10   // Buttons (shadow-button)
z-20   // Cards (shadow-card)
z-50   // Dropdowns (shadow-dropdown)
z-100  // Modals (shadow-modal)
```

---

**End of Guide**
