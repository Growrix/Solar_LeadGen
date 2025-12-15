# Spacing Patterns Guide

**Feature**: 004 - Centralized Design Token System  
**User Story**: US7 - Developer Creates Component with Consistent Spacing  
**Audience**: Developers, Designers  
**Date**: January 28, 2025

---

## Overview

This document provides practical spacing patterns for common UI layouts in the SolarMatch application. All patterns use the 8-point grid system and semantic spacing tokens for consistency.

**Key Principles**:
- ✅ All spacing is multiples of 8px (or 4px for half increments)
- ✅ Use semantic tokens for container-level spacing
- ✅ Use fixed Tailwind classes for internal content spacing
- ✅ Spacing adapts automatically: Mobile (smaller) → Desktop (larger)

---

## 1. Card Layouts

### Basic Card Pattern

```tsx
<div className="p-card-padding bg-background shadow-card rounded-lg border border-border">
  <h3 className="font-heading-3 mb-heading-margin">Card Title</h3>
  <p className="text-body text-foreground-secondary mb-form-gap">
    Card description or content goes here.
  </p>
  <div className="space-y-form-gap">
    {/* Card content items with consistent gap */}
  </div>
</div>
```

**Spacing Used**:
- `p-card-padding`: 16px mobile → 24px desktop (outer padding)
- `mb-heading-margin`: 16px mobile → 24px desktop (below title)
- `mb-form-gap`: 12px mobile → 16px desktop (below description)
- `space-y-form-gap`: 12px mobile → 16px desktop (between items)

### Card Grid Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-form-gap">
  {cards.map((card) => (
    <div key={card.id} className="p-card-padding bg-background shadow-card rounded-lg">
      <h4 className="font-heading-4 mb-2">{card.title}</h4>
      <p className="text-body">{card.description}</p>
    </div>
  ))}
</div>
```

**Spacing Used**:
- `gap-form-gap`: 12px mobile → 16px desktop (grid gap between cards)
- `p-card-padding`: Consistent padding inside each card
- `mb-2`: Fixed 8px below card titles (internal spacing)

### Nested Card Pattern

```tsx
<div className="p-card-padding bg-background shadow-card rounded-lg">
  <h3 className="font-heading-3 mb-heading-margin">Outer Card</h3>
  
  <div className="space-y-form-gap">
    {/* Inner cards with less padding */}
    <div className="p-4 bg-background-secondary rounded border border-border">
      <p className="text-body-small">Nested content</p>
    </div>
    <div className="p-4 bg-background-secondary rounded border border-border">
      <p className="text-body-small">Nested content</p>
    </div>
  </div>
</div>
```

**Spacing Used**:
- Outer card: `p-card-padding` (24px desktop)
- Inner cards: `p-4` (16px fixed) - smaller to create hierarchy
- Between nested items: `space-y-form-gap`

---

## 2. Form Layouts

### Simple Form Pattern

```tsx
<form className="space-y-form-gap">
  <div>
    <label htmlFor="name" className="text-label block mb-2">Name</label>
    <input
      type="text"
      id="name"
      className="w-full px-4 py-3 border border-border rounded-lg"
    />
  </div>
  
  <div>
    <label htmlFor="email" className="text-label block mb-2">Email</label>
    <input
      type="email"
      id="email"
      className="w-full px-4 py-3 border border-border rounded-lg"
    />
  </div>
  
  <button className="w-full px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
    Submit
  </button>
</form>
```

**Spacing Used**:
- `space-y-form-gap`: 12px mobile → 16px desktop (between fields)
- `mb-2`: 8px below labels (fixed internal spacing)
- Input padding: `px-4 py-3` (16px × 12px - standard input padding)
- Button padding: `px-button-padding-x py-button-padding-y` (24px × 12px desktop)

### Multi-Column Form Pattern

```tsx
<form className="space-y-form-gap">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-form-gap">
    <div>
      <label className="text-label block mb-2">First Name</label>
      <input className="w-full px-4 py-3 border border-border rounded-lg" />
    </div>
    <div>
      <label className="text-label block mb-2">Last Name</label>
      <input className="w-full px-4 py-3 border border-border rounded-lg" />
    </div>
  </div>
  
  <div>
    <label className="text-label block mb-2">Address</label>
    <input className="w-full px-4 py-3 border border-border rounded-lg" />
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-form-gap">
    <div>
      <label className="text-label block mb-2">City</label>
      <input className="w-full px-4 py-3 border border-border rounded-lg" />
    </div>
    <div>
      <label className="text-label block mb-2">State</label>
      <select className="w-full px-4 py-3 border border-border rounded-lg">
        <option>CA</option>
      </select>
    </div>
    <div>
      <label className="text-label block mb-2">ZIP</label>
      <input className="w-full px-4 py-3 border border-border rounded-lg" />
    </div>
  </div>
</form>
```

**Spacing Used**:
- `space-y-form-gap`: Vertical gap between form rows
- `gap-form-gap`: Horizontal gap between columns in grid
- `mb-2`: Consistent label spacing

### Multi-Section Form Pattern

```tsx
<form className="space-y-section-margin">
  {/* Section 1 */}
  <div>
    <h3 className="font-heading-3 mb-heading-margin">Contact Information</h3>
    <div className="space-y-form-gap">
      {/* Form fields */}
    </div>
  </div>
  
  {/* Section 2 */}
  <div className="pt-section-margin border-t border-border">
    <h3 className="font-heading-3 mb-heading-margin">Property Details</h3>
    <div className="space-y-form-gap">
      {/* Form fields */}
    </div>
  </div>
  
  {/* Submit Button */}
  <div className="pt-section-margin border-t border-border">
    <button className="w-full px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
      Submit Quote Request
    </button>
  </div>
</form>
```

**Spacing Used**:
- `space-y-section-margin`: 24px mobile → 48px desktop (between major sections)
- `pt-section-margin`: Top padding for bordered sections
- `mb-heading-margin`: Below section headings
- `space-y-form-gap`: Between fields within each section

### Form with Helper Text Pattern

```tsx
<div className="space-y-form-gap">
  <div>
    <label className="text-label block mb-2">Monthly Electric Bill</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body text-foreground-secondary">
        $
      </span>
      <input
        type="number"
        className="w-full pl-8 pr-4 py-3 border border-border rounded-lg"
        placeholder="150"
      />
    </div>
    <p className="text-body-small text-foreground-secondary mt-2">
      Your average monthly electricity bill helps us size your system
    </p>
  </div>
</div>
```

**Spacing Used**:
- `mb-2`: 8px below label
- `mt-2`: 8px above helper text (creates consistent 8px gap)
- Input padding: `pl-8 pr-4 py-3` (left padding accounts for $ icon)

---

## 3. Page Section Layouts

### Basic Page Structure

```tsx
<main className="container mx-auto px-4 py-8">
  <div className="space-y-section-margin">
    {/* Hero Section */}
    <section>
      <h1 className="font-heading-1 mb-heading-margin">Page Title</h1>
      <p className="text-body-large text-foreground-secondary">
        Page description or subtitle
      </p>
    </section>
    
    {/* Content Section */}
    <section>
      <h2 className="font-heading-2 mb-heading-margin">Section Title</h2>
      <div className="space-y-form-gap">
        {/* Section content */}
      </div>
    </section>
    
    {/* Additional Sections */}
    <section>
      <h2 className="font-heading-2 mb-heading-margin">Another Section</h2>
      <div className="space-y-form-gap">
        {/* Section content */}
      </div>
    </section>
  </div>
</main>
```

**Spacing Used**:
- `px-4 py-8`: Page container padding (16px horizontal, 32px vertical)
- `space-y-section-margin`: 24px mobile → 48px desktop (between major sections)
- `mb-heading-margin`: Below all headings
- `space-y-form-gap`: Within section content

### Dashboard Grid Layout

```tsx
<div className="space-y-section-margin">
  {/* Stats Row */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-form-gap">
    {stats.map((stat) => (
      <div key={stat.id} className="p-card-padding bg-background shadow-card rounded-lg">
        <p className="text-caption text-foreground-secondary mb-2">{stat.label}</p>
        <p className="text-body-large font-semibold">{stat.value}</p>
      </div>
    ))}
  </div>
  
  {/* Charts Row */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-form-gap">
    <div className="p-card-padding bg-background shadow-card rounded-lg">
      <h3 className="font-heading-3 mb-heading-margin">Chart 1</h3>
      {/* Chart component */}
    </div>
    <div className="p-card-padding bg-background shadow-card rounded-lg">
      <h3 className="font-heading-3 mb-heading-margin">Chart 2</h3>
      {/* Chart component */}
    </div>
  </div>
  
  {/* Table Row */}
  <div className="p-card-padding bg-background shadow-card rounded-lg">
    <h3 className="font-heading-3 mb-heading-margin">Recent Activity</h3>
    {/* Table component */}
  </div>
</div>
```

**Spacing Used**:
- `space-y-section-margin`: Between dashboard rows
- `gap-form-gap`: Between grid items within each row
- `p-card-padding`: Consistent card padding
- `mb-heading-margin`: Below card titles

---

## 4. Modal Layouts

### Basic Modal Pattern

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-background rounded-lg shadow-modal max-w-md w-full p-modal-padding">
    <h2 className="font-heading-2 mb-heading-margin">Modal Title</h2>
    <p className="text-body text-foreground-secondary mb-form-gap">
      Modal description or content
    </p>
    
    <div className="space-y-form-gap mb-section-margin">
      {/* Modal content */}
    </div>
    
    <div className="flex gap-form-gap justify-end pt-section-margin border-t border-border">
      <button className="px-button-padding-x py-button-padding-y border border-border rounded-lg">
        Cancel
      </button>
      <button className="px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

**Spacing Used**:
- `p-modal-padding`: 20px mobile → 32px desktop (larger than card padding)
- `mb-heading-margin`: Below modal title
- `mb-form-gap`: Below description
- `mb-section-margin`: Below main content, before actions
- `pt-section-margin`: Top padding for action row (with border)
- `gap-form-gap`: Between action buttons

---

## 5. Button Group Patterns

### Horizontal Button Group

```tsx
<div className="flex gap-form-gap">
  <button className="px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
    Primary Action
  </button>
  <button className="px-button-padding-x py-button-padding-y border border-border rounded-lg">
    Secondary Action
  </button>
  <button className="px-button-padding-x py-button-padding-y text-error hover:bg-error-light rounded-lg">
    Destructive Action
  </button>
</div>
```

**Spacing Used**:
- `gap-form-gap`: 12px mobile → 16px desktop (between buttons)
- `px-button-padding-x py-button-padding-y`: Consistent button padding

### Vertical Button Stack

```tsx
<div className="space-y-form-gap">
  <button className="w-full px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
    Primary Action
  </button>
  <button className="w-full px-button-padding-x py-button-padding-y border border-border rounded-lg">
    Secondary Action
  </button>
</div>
```

**Spacing Used**:
- `space-y-form-gap`: Consistent vertical gap between stacked buttons

---

## 6. List Layouts

### Simple List Pattern

```tsx
<ul className="space-y-form-gap">
  {items.map((item) => (
    <li key={item.id} className="flex items-start gap-form-gap p-4 bg-background border border-border rounded-lg">
      <div className="flex-shrink-0">
        {/* Icon or image */}
      </div>
      <div>
        <h4 className="font-heading-4 mb-2">{item.title}</h4>
        <p className="text-body-small text-foreground-secondary">{item.description}</p>
      </div>
    </li>
  ))}
</ul>
```

**Spacing Used**:
- `space-y-form-gap`: Between list items
- `gap-form-gap`: Between icon and content
- `p-4`: Internal list item padding (16px fixed)
- `mb-2`: Below list item title

### Divided List Pattern

```tsx
<div className="divide-y divide-border">
  {items.map((item) => (
    <div key={item.id} className="py-form-gap first:pt-0 last:pb-0">
      <h4 className="font-heading-4 mb-2">{item.title}</h4>
      <p className="text-body-small text-foreground-secondary">{item.description}</p>
    </div>
  ))}
</div>
```

**Spacing Used**:
- `py-form-gap`: 12px mobile → 16px desktop (vertical padding for each item)
- `first:pt-0 last:pb-0`: Remove padding from first/last items (cleaner edges)
- `mb-2`: Below titles

---

## 7. Spacing Decision Matrix

Use this matrix to choose the right spacing token:

| Use Case | Token | Mobile | Desktop | Example |
|----------|-------|--------|---------|---------|
| **Card outer padding** | `p-card-padding` | 16px | 24px | `<div className="p-card-padding">` |
| **Modal outer padding** | `p-modal-padding` | 20px | 32px | `<div className="p-modal-padding">` |
| **Between form fields** | `space-y-form-gap` | 12px | 16px | `<form className="space-y-form-gap">` |
| **Between page sections** | `space-y-section-margin` | 24px | 48px | `<main className="space-y-section-margin">` |
| **Below headings** | `mb-heading-margin` | 16px | 24px | `<h2 className="mb-heading-margin">` |
| **Button horizontal padding** | `px-button-padding-x` | 16px | 24px | `<button className="px-button-padding-x">` |
| **Button vertical padding** | `py-button-padding-y` | 8px | 12px | `<button className="py-button-padding-y">` |
| **Grid gaps** | `gap-form-gap` | 12px | 16px | `<div className="grid gap-form-gap">` |

---

## 8. Common Anti-Patterns

### ❌ Avoid Hardcoded Values

```tsx
// ❌ WRONG - Hardcoded spacing
<div className="p-6 mb-8 space-y-4">

// ✅ CORRECT - Semantic tokens
<div className="p-card-padding mb-section-margin space-y-form-gap">
```

### ❌ Avoid Non-8-Point-Grid Values

```tsx
// ❌ WRONG - Not on 8-point grid
<div className="p-5 mt-7">  // 20px, 28px

// ✅ CORRECT - Multiples of 8px
<div className="p-4 mt-8">  // 16px, 32px
```

### ❌ Avoid Mixing Semantic and Explicit

```tsx
// ❌ INCONSISTENT
<div className="p-card-padding mt-8 space-y-4">

// ✅ CONSISTENT
<div className="p-card-padding mt-section-margin space-y-form-gap">
```

---

## 9. Testing Checklist

After implementing a spacing pattern:

- [ ] **Visual Check**: Spacing looks consistent across similar components
- [ ] **8-Point Grid**: All spacing values are multiples of 8px (or 4px)
- [ ] **Responsive Check**: Test at 320px (mobile), 768px (tablet), 1024px (desktop)
- [ ] **Theme Check**: Spacing works correctly in Light and Dark themes
- [ ] **Token Usage**: No hardcoded `p-6`, `mt-8` values in container-level spacing
- [ ] **Hierarchy**: Clear visual hierarchy through spacing (larger gaps = more separation)

---

## 10. Quick Reference

**8-Point Grid Multipliers**:
- `p-2` = 8px (1×)
- `p-4` = 16px (2×)
- `p-6` = 24px (3×)
- `p-8` = 32px (4×)
- `p-12` = 48px (6×)
- `p-16` = 64px (8×)

**Semantic Token Mapping**:
```
card-padding:      16px mobile → 24px desktop
modal-padding:     20px mobile → 32px desktop
form-gap:          12px mobile → 16px desktop
section-margin:    24px mobile → 48px desktop
heading-margin:    16px mobile → 24px desktop
button-padding-x:  16px mobile → 24px desktop
button-padding-y:  8px mobile → 12px desktop
```

---

**Last Updated**: January 28, 2025  
**Maintained By**: Development Team  
**Related Docs**: `quickstart.md`, `data-model.md`, `spec.md`
