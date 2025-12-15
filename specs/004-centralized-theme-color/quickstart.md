# Quick Start Guide: Using the Centralized Design Token System

**Audience**: Developers working on the SolarMatch application  
**Prerequisites**: Basic understanding of Tailwind CSS and TypeScript  
**Estimated Time**: 15 minutes to read, 30 minutes to practice

---

## Overview

This guide teaches you how to use the centralized design token system to build and style components consistently across the SolarMatch application.

**What are Design Tokens?**  
Design tokens are named variables for design values (colors, spacing, typography) stored in a central location. Instead of hardcoding `bg-teal-600` everywhere, you use `bg-primary`, which can be changed globally.

**Benefits**:
- ✅ **Instant rebranding**: Change primary color in 1 file, updates 200+ components
- ✅ **Consistent theming**: Automatic light/dark mode support
- ✅ **Type safety**: TypeScript catches typos at compile time
- ✅ **Responsive by default**: Semantic tokens adapt to mobile/tablet/desktop

---

## 1. Using Color Tokens

### Semantic Color Classes (Use These)

```tsx
// ✅ CORRECT - Use semantic tokens
<button className="bg-primary hover:bg-primary-hover text-white">
  Primary Button
</button>

<div className="bg-success text-white">
  Success Message
</div>

<p className="text-muted">
  Muted text (secondary information)
</p>
```

### Available Color Tokens

| Token | Purpose | Tailwind Class | Example |
|-------|---------|----------------|---------|
| `primary` | Main brand color | `bg-primary`, `text-primary` | Primary buttons, links |
| `primary-hover` | Primary hover state | `hover:bg-primary-hover` | Button hover |
| `secondary` | Secondary brand color | `bg-secondary` | Secondary buttons |
| `success` | Success state | `bg-success`, `text-success` | Success messages, badges |
| `warning` | Warning state | `bg-warning`, `text-warning` | Warning messages |
| `error` | Error state | `bg-error`, `text-error` | Error messages, validation |
| `info` | Info state | `bg-info` | Info messages |
| `background` | Page background | `bg-background` | Main page background |
| `background-alt` | Alternate background | `bg-background-alt` | Sections, panels |
| `surface` | Surface background | `bg-surface` | Cards, modals |
| `foreground` | Primary text color | `text-foreground` | Body text |
| `muted` | Secondary text color | `text-muted` | Captions, labels |
| `border` | Border color | `border-border` | Input borders, dividers |
| `border-focus` | Focus border | `focus:border-border-focus` | Input focus state |

### Dark Mode Support

```tsx
// Automatic dark mode (uses .DEFAULT value)
<div className="bg-primary text-white">
  Primary background (same in light/dark)
</div>

// Manual dark mode (specify dark variant)
<div className="bg-background dark:bg-gray-900 text-foreground dark:text-gray-50">
  Background adapts to theme
</div>
```

### ❌ Avoid Hardcoded Colors

```tsx
// ❌ WRONG - Hardcoded color
<button className="bg-teal-600 hover:bg-teal-700">Button</button>

// ❌ WRONG - Hex code
<div style={{ backgroundColor: '#0d9488' }}>Content</div>

// ✅ CORRECT - Semantic token
<button className="bg-primary hover:bg-primary-hover">Button</button>
```

---

## 4. Using Spacing Tokens

### Semantic Spacing Classes (Use These)

```tsx
// ✅ CORRECT - Use semantic spacing tokens
<div className="p-card-padding bg-background shadow-card rounded-lg">
  <h3 className="font-heading-3 mb-heading-margin">Card Title</h3>
  <div className="space-y-form-gap">
    <input className="px-4 py-3 border border-border rounded-lg" />
    <input className="px-4 py-3 border border-border rounded-lg" />
  </div>
  <button className="px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg mt-section-margin">
    Submit
  </button>
</div>

// ❌ WRONG - Hardcoded spacing
<div className="p-6 bg-white shadow rounded-lg">
  <h3 className="text-xl mb-4">Card Title</h3>
  <div className="space-y-4">
    <input className="px-4 py-3 border rounded-lg" />
    <input className="px-4 py-3 border rounded-lg" />
  </div>
  <button className="px-6 py-3 bg-teal-600 text-white rounded-lg mt-8">
    Submit
  </button>
</div>
```

### Available Spacing Tokens

| Token | Mobile | Desktop | Purpose | Tailwind Class |
|-------|--------|---------|---------|----------------|
| `card-padding` | 16px | 24px | Padding inside cards | `p-card-padding` |
| `modal-padding` | 20px | 32px | Padding inside modals | `p-modal-padding` |
| `form-gap` | 12px | 16px | Gap between form fields | `space-y-form-gap`, `gap-form-gap` |
| `section-margin` | 24px | 48px | Margin between page sections | `mt-section-margin`, `mb-section-margin` |
| `heading-margin` | 16px | 24px | Margin below headings | `mb-heading-margin` |
| `button-padding-x` | 16px | 24px | Horizontal button padding | `px-button-padding-x` |
| `button-padding-y` | 8px | 12px | Vertical button padding | `py-button-padding-y` |

### 8-Point Grid System

All spacing values are multiples of 8px (or 4px for half increments) for visual consistency:

```tsx
// Base unit = 8px
// 1× = 8px, 2× = 16px, 3× = 24px, 4× = 32px, 6× = 48px, 8× = 64px

// ✅ Examples of proper spacing
<div className="p-4">       {/* 16px - 2× base unit */}
<div className="p-6">       {/* 24px - 3× base unit */}
<div className="p-8">       {/* 32px - 4× base unit */}
<div className="space-y-4"> {/* 16px gap - 2× base unit */}
<div className="mt-8">      {/* 32px - 4× base unit */}
```

### Responsive Spacing Hook

For programmatic spacing calculations:

```tsx
import { useResponsiveSpacing } from '@/hooks/useResponsiveSpacing';

function MyComponent() {
  const { breakpoint, getSpacing, isMobile, isDesktop } = useResponsiveSpacing();
  
  // Get mobile/desktop variant
  const padding = getSpacing({ mobile: '16px', desktop: '24px' });
  
  // Use in inline styles
  return (
    <div style={{ padding }}>
      Current breakpoint: {breakpoint}
      {isMobile && <p>Mobile layout</p>}
      {isDesktop && <p>Desktop layout</p>}
    </div>
  );
}
```

### Spacing Best Practices

1. **Use semantic tokens for outer spacing**:
   ```tsx
   // ✅ Card container uses semantic token
   <div className="p-card-padding bg-background shadow-card">
     {/* Inner content uses fixed Tailwind classes */}
     <div className="p-4 bg-muted rounded">
       Content
     </div>
   </div>
   ```

2. **Consistent form spacing**:
   ```tsx
   // ✅ Forms use form-gap for consistent field spacing
   <form className="space-y-form-gap">
     <div>
       <label className="text-label block mb-2">Name</label>
       <input className="w-full px-4 py-3 border border-border rounded-lg" />
     </div>
     <div>
       <label className="text-label block mb-2">Email</label>
       <input className="w-full px-4 py-3 border border-border rounded-lg" />
     </div>
   </form>
   ```

3. **Section spacing**:
   ```tsx
   // ✅ Use section-margin between major page sections
   <div className="space-y-section-margin">
     <section>
       <h2 className="font-heading-2 mb-heading-margin">Section 1</h2>
       <p>Content...</p>
     </section>
     <section>
       <h2 className="font-heading-2 mb-heading-margin">Section 2</h2>
       <p>Content...</p>
     </section>
   </div>
   ```

4. **Grid layouts**:
   ```tsx
   // ✅ Use form-gap for consistent grid spacing
   <div className="grid grid-cols-1 md:grid-cols-3 gap-form-gap">
     <div className="p-card-padding bg-background shadow-card">Card 1</div>
     <div className="p-card-padding bg-background shadow-card">Card 2</div>
     <div className="p-card-padding bg-background shadow-card">Card 3</div>
   </div>
   ```

### Common Spacing Patterns

**Card Layout**:
```tsx
<div className="p-card-padding bg-background shadow-card rounded-lg">
  <h3 className="font-heading-3 mb-heading-margin">Title</h3>
  <p className="text-body text-foreground-secondary mb-form-gap">Description</p>
  <div className="space-y-form-gap">
    {/* Card content */}
  </div>
</div>
```

**Multi-Section Form**:
```tsx
<form className="space-y-section-margin">
  {/* Section 1 */}
  <div>
    <h3 className="font-heading-3 mb-heading-margin">Contact Info</h3>
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
</form>
```

**Button Group**:
```tsx
<div className="flex gap-form-gap">
  <button className="px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg">
    Primary
  </button>
  <button className="px-button-padding-x py-button-padding-y border border-border rounded-lg">
    Secondary
  </button>
</div>
```

---

## 5. Complete Component Example

Here's a complete example using color, typography, and spacing tokens:

```tsx
export function SolarQuoteCard() {
  return (
    <div className="p-card-padding bg-background shadow-card rounded-lg border border-border">
      {/* Header */}
      <div className="mb-section-margin">
        <h2 className="font-heading-2 mb-heading-margin">Your Solar Quote</h2>
        <p className="text-body text-foreground-secondary">
          Personalized solar installation estimate based on your property
        </p>
      </div>

      {/* Specifications */}
      <div className="space-y-form-gap mb-section-margin">
        <div className="grid grid-cols-2 gap-form-gap">
          <div className="p-4 bg-background-secondary rounded border border-border">
            <p className="text-caption text-foreground-secondary mb-2">System Size</p>
            <p className="text-body-large font-semibold">8.5 kW</p>
          </div>
          <div className="p-4 bg-background-secondary rounded border border-border">
            <p className="text-caption text-foreground-secondary mb-2">Panel Count</p>
            <p className="text-body-large font-semibold">24 panels</p>
          </div>
        </div>
        
        <div className="space-y-form-gap">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-body text-foreground-secondary">System Cost</span>
            <span className="text-body font-medium">$25,500</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-body text-foreground-secondary">Federal Tax Credit (30%)</span>
            <span className="text-body font-medium text-success">-$7,650</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-large font-semibold">Net Cost</span>
            <span className="text-body-large font-semibold text-primary">$17,850</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-form-gap pt-section-margin border-t border-border">
        <button className="flex-1 px-button-padding-x py-button-padding-y bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Accept Quote
        </button>
        <button className="px-button-padding-x py-button-padding-y border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          Request Changes
        </button>
      </div>
    </div>
  );
}
```

This component demonstrates:
- ✅ Semantic spacing tokens (`p-card-padding`, `space-y-form-gap`, `mb-section-margin`)
- ✅ Semantic color tokens (`bg-primary`, `text-success`, `border-border`)
- ✅ Typography tokens (`font-heading-2`, `text-body-large`, `text-caption`)
- ✅ 8-point grid consistency (all spacing is multiples of 4px or 8px)
- ✅ Responsive behavior (spacing adapts mobile→desktop automatically)

---

## 6. Testing Your Changes

### 1. Visual Check in Storybook

```bash
npm run storybook
```

Navigate to your component's story and verify:
- Spacing looks consistent across all cards/forms
- Light/Dark themes both work correctly
- Mobile (320px), Tablet (768px), Desktop (1024px) all look good

### 2. TypeScript Check

```bash
npx tsc --noEmit
```

Should compile with 0 errors. TypeScript will catch:
- Misspelled token class names
- Missing imports
- Type mismatches

### 3. Build Check

```bash
npm run build
```

Ensures Tailwind generates all custom spacing classes correctly.

---

## 7. Common Mistakes to Avoid

### ❌ Hardcoding Spacing Values

```tsx
// ❌ WRONG
<div className="p-6">  {/* Hardcoded 24px */}
<div className="mt-8"> {/* Hardcoded 32px */}
<div className="space-y-4"> {/* Hardcoded 16px */}
```

```tsx
// ✅ CORRECT
<div className="p-card-padding">  {/* Semantic token */}
<div className="mt-section-margin"> {/* Semantic token */}
<div className="space-y-form-gap"> {/* Semantic token */}
```

### ❌ Non-8-Point-Grid Values

```tsx
// ❌ WRONG - Not multiples of 8px
<div className="p-5">   {/* 20px - not on 8-point grid */}
<div className="mb-7">  {/* 28px - not on 8-point grid */}
```

```tsx
// ✅ CORRECT - Multiples of 4px or 8px
<div className="p-4">   {/* 16px - 2× base unit */}
<div className="p-6">   {/* 24px - 3× base unit */}
<div className="mb-8">  {/* 32px - 4× base unit */}
```

### ❌ Mixing Semantic and Explicit Spacing

```tsx
// ❌ INCONSISTENT
<div className="p-card-padding">  {/* Semantic */}
  <div className="mt-8">           {/* Explicit */}
    <div className="mb-6">         {/* Explicit */}
```

```tsx
// ✅ CONSISTENT
<div className="p-card-padding">       {/* Semantic for container */}
  <div className="mt-section-margin">  {/* Semantic for major sections */}
    <div className="mb-heading-margin"> {/* Semantic for headings */}
```

---

## 8. Troubleshooting

### Issue: Spacing not responsive

**Cause**: Using fixed Tailwind classes instead of semantic tokens.

**Fix**:
```tsx
// ❌ Fixed spacing
<div className="p-6">

// ✅ Responsive spacing
<div className="p-card-padding"> {/* 16px mobile → 24px desktop */}
```

### Issue: Class not recognized by Tailwind

### Semantic Typography Classes

```tsx
// HEADINGS
<h1 className="text-heading-1">Main Page Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<h3 className="text-heading-3">Subsection Title</h3>
<h4 className="text-heading-4">Card Title</h4>

// BODY TEXT
<p className="text-body">Regular paragraph text (14px mobile, 16px desktop)</p>
<p className="text-body-large">Emphasized paragraph (larger)</p>
<p className="text-body-small">De-emphasized paragraph (smaller)</p>

// CAPTIONS & LABELS
<small className="text-caption text-muted">Small caption or timestamp</small>
<label className="text-label">Form label (medium weight)</label>

// BUTTONS
<button className="text-button">Button text (semibold, wide letter-spacing)</button>
```

### Available Typography Tokens

| Token | Size (Mobile → Desktop) | Weight | Use Case |
|-------|-------------------------|--------|----------|
| `text-heading-1` | 24px → 36px | Bold | Page titles |
| `text-heading-2` | 20px → 30px | Bold | Section titles |
| `text-heading-3` | 18px → 24px | Semibold | Subsection titles |
| `text-heading-4` | 16px → 20px | Semibold | Card titles |
| `text-body` | 14px → 16px | Normal | Paragraph text |
| `text-body-large` | 16px → 18px | Normal | Emphasized text |
| `text-body-small` | 14px | Normal | De-emphasized text |
| `text-caption` | 12px | Normal | Captions, timestamps |
| `text-label` | 14px | Medium | Form labels |
| `text-button` | 14px → 16px | Semibold | Button text |

### Typography Best Practices

```tsx
// ✅ CORRECT - Semantic + color token
<h1 className="text-heading-1 text-foreground">Title</h1>

// ✅ CORRECT - Responsive typography (auto-scales)
<p className="text-body text-muted">
  This text is 14px on mobile, 16px on desktop
</p>

// ❌ WRONG - Hardcoded size
<h1 className="text-2xl font-bold">Title</h1>
```

---

## 3. Using Spacing Tokens

### Semantic Responsive Spacing (Auto-Responsive)

```tsx
// CARD PADDING (12px mobile → 24px desktop)
<div className="p-card-padding rounded-card shadow-card">
  Card content with responsive padding
</div>

// FORM GAP (12px mobile → 20px desktop)
<form className="space-y-form-gap">
  <input />
  <input />
  <input />
</form>

// SECTION MARGIN (24px mobile → 48px desktop)
<section className="mt-section-margin">
  Section with responsive top margin
</section>

// BUTTON PADDING (responsive X/Y)
<button className="px-button-padding-x py-button-padding-y rounded-button">
  Responsive button padding
</button>
```

### Explicit Responsive Spacing (Manual Breakpoints)

```tsx
// Mobile-specific
<div className="p-mobile-md">12px padding (mobile only)</div>

// Desktop-specific
<div className="p-desktop-lg">24px padding (desktop only)</div>

// Hybrid (mobile → desktop)
<div className="p-mobile-md lg:p-desktop-lg">
  12px mobile, 24px desktop
</div>
```

### Available Spacing Tokens

**Semantic (Auto-Responsive)**:
- `p-card-padding` / `m-card-padding` - Card padding/margin
- `p-modal-padding` / `m-modal-padding` - Modal padding/margin
- `space-y-form-gap` / `gap-form-gap` - Form gap
- `mt-section-margin` / `mb-section-margin` - Section margin
- `mb-heading-margin` - Heading bottom margin
- `px-button-padding-x` / `py-button-padding-y` - Button padding

**Explicit Mobile**:
- `p-mobile-xs` (4px), `p-mobile-sm` (8px), `p-mobile-md` (12px), `p-mobile-lg` (16px), `p-mobile-xl` (20px)

**Explicit Desktop**:
- `p-desktop-xs` (8px), `p-desktop-sm` (12px), `p-desktop-md` (16px), `p-desktop-lg` (24px), `p-desktop-xl` (32px), `p-desktop-2xl` (48px)

### Spacing Best Practices

```tsx
// ✅ CORRECT - Semantic responsive (preferred for common patterns)
<div className="p-card-padding space-y-form-gap">
  <input />
  <input />
</div>

// ✅ CORRECT - Explicit responsive (for custom spacing)
<div className="p-mobile-sm lg:p-desktop-md">
  Custom responsive padding
</div>

// ❌ WRONG - Hardcoded (not responsive)
<div className="p-6">Hardcoded 24px padding</div>
```

---

## 4. Using Shadow & Border Tokens

### Shadow (Elevation)

```tsx
// CARD ELEVATION
<div className="shadow-card rounded-card">
  Card with elevation
</div>

// MODAL ELEVATION
<div className="shadow-modal rounded-modal">
  Modal with higher elevation
</div>

// DROPDOWN ELEVATION
<div className="shadow-dropdown rounded-card">
  Dropdown with medium elevation
</div>

// BUTTON HOVER ELEVATION
<button className="shadow-button hover:shadow-card">
  Button with hover elevation
</button>

// FOCUS RING
<input className="focus:shadow-focus focus:outline-none" />
```

### Border Radius

```tsx
// CARD RADIUS
<div className="rounded-card">12px border radius</div>

// BUTTON RADIUS
<button className="rounded-button">8px border radius</button>

// INPUT RADIUS
<input className="rounded-input" />

// MODAL RADIUS
<div className="rounded-modal">16px border radius</div>

// BADGE RADIUS
<span className="rounded-badge">Perfect circle (9999px)</span>
```

---

## 5. Using Animation Tokens

### Transition Classes

```tsx
// COLOR TRANSITION
<button className="bg-primary hover:bg-primary-hover transition-colors">
  Smooth color transition
</button>

// OPACITY TRANSITION
<div className="opacity-0 hover:opacity-100 transition-opacity">
  Fade in on hover
</div>

// TRANSFORM TRANSITION
<div className="scale-100 hover:scale-105 transition-transform">
  Scale up on hover
</div>

// ALL PROPERTIES
<div className="transition-all hover:shadow-card">
  Transition everything
</div>
```

### Animation Classes

```tsx
// FADE IN
<div className="animate-fade-in">
  Fades in when rendered
</div>

// SLIDE IN UP
<div className="animate-slide-in-up">
  Slides up and fades in
</div>
```

---

## 6. Complete Component Examples

### Example 1: Primary Button

```tsx
const PrimaryButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="
        bg-primary hover:bg-primary-hover
        text-white text-button
        px-button-padding-x py-button-padding-y
        rounded-button shadow-button hover:shadow-card
        transition-all
        focus:shadow-focus focus:outline-none
      "
    >
      {children}
    </button>
  );
};
```

### Example 2: Card Component

```tsx
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="bg-surface p-card-padding rounded-card shadow-card space-y-form-gap">
      <h3 className="text-heading-3 text-foreground mb-heading-margin">
        {title}
      </h3>
      <div className="text-body text-muted">
        {children}
      </div>
    </div>
  );
};
```

### Example 3: Form with Status Message

```tsx
const QuoteForm = () => {
  return (
    <form className="bg-surface p-card-padding rounded-card shadow-card space-y-form-gap">
      <h2 className="text-heading-2 text-foreground mb-heading-margin">
        Request a Quote
      </h2>
      
      <div>
        <label className="text-label text-foreground">Name</label>
        <input
          type="text"
          className="
            w-full p-mobile-md lg:p-desktop-sm
            border border-border focus:border-border-focus
            rounded-input focus:shadow-focus focus:outline-none
            text-body text-foreground
            transition-all
          "
        />
      </div>
      
      <div className="bg-success text-white p-mobile-md rounded-card">
        <p className="text-body">
          ✓ Quote request submitted successfully!
        </p>
      </div>
      
      <button
        type="submit"
        className="
          w-full bg-primary hover:bg-primary-hover
          text-white text-button
          py-button-padding-y rounded-button
          shadow-button hover:shadow-card
          transition-all
        "
      >
        Submit Request
      </button>
    </form>
  );
};
```

---

## 7. Chart Color Integration (Recharts)

### Using the `useChartColors` Hook

```tsx
import { useChartColors } from '@/hooks/useChartColors';
import { BarChart, Bar, LineChart, Line } from 'recharts';

const DashboardChart = () => {
  const chartColors = useChartColors(); // Theme-aware chart colors
  
  const data = [
    { month: 'Jan', leads: 45, quotes: 30 },
    { month: 'Feb', leads: 52, quotes: 38 },
    { month: 'Mar', leads: 61, quotes: 42 },
  ];
  
  return (
    <div className="bg-surface p-card-padding rounded-card shadow-card">
      <h3 className="text-heading-3 mb-heading-margin">Lead Activity</h3>
      <BarChart width={600} height={300} data={data}>
        <Bar dataKey="leads" fill={chartColors.primary} />
        <Bar dataKey="quotes" fill={chartColors.secondary} />
      </BarChart>
    </div>
  );
};
```

### Available Chart Colors

```typescript
const chartColors = useChartColors();

// chartColors.primary    - Primary brand color
// chartColors.secondary  - Secondary brand color
// chartColors.tertiary   - Tertiary color (blue)
// chartColors.success    - Success green
// chartColors.warning    - Warning yellow
// chartColors.error      - Error red
```

---

## 8. Migration Workflow (Refactoring Existing Code)

### Step-by-Step Refactoring

**Before** (Hardcoded):
```tsx
<div className="bg-teal-600 p-6 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>
  <p className="text-sm text-gray-100">Welcome back!</p>
  <button className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-md mt-4">
    View Leads
  </button>
</div>
```

**After** (Token-Based):
```tsx
<div className="bg-primary p-card-padding rounded-card shadow-card">
  <h2 className="text-heading-2 text-white mb-heading-margin">Dashboard</h2>
  <p className="text-body-small text-white">Welcome back!</p>
  <button className="bg-secondary hover:bg-secondary-hover text-white px-button-padding-x py-button-padding-y rounded-button mt-form-gap">
    View Leads
  </button>
</div>
```

### Migration Checklist (Per Component)

- [ ] Replace color classes: `bg-teal-600` → `bg-primary`
- [ ] Replace typography: `text-2xl font-bold` → `text-heading-2`
- [ ] Replace spacing: `p-6` → `p-card-padding`
- [ ] Replace shadows: `shadow-lg` → `shadow-card`
- [ ] Replace border radius: `rounded-lg` → `rounded-card`
- [ ] Test in Storybook (all themes, all breakpoints)
- [ ] Run Chromatic visual regression
- [ ] Manual QA checklist (themes, responsive, states)
- [ ] Commit with clear message

---

## 9. Common Patterns

### Pattern 1: Dashboard Card

```tsx
<div className="bg-surface p-card-padding rounded-card shadow-card space-y-form-gap">
  <h3 className="text-heading-3 text-foreground">Card Title</h3>
  <p className="text-body text-muted">Card description</p>
  <button className="bg-primary hover:bg-primary-hover text-white px-button-padding-x py-button-padding-y rounded-button">
    Action
  </button>
</div>
```

### Pattern 2: Status Badge

```tsx
// Success badge
<span className="inline-block bg-success text-white text-caption px-mobile-md py-mobile-xs rounded-badge">
  Active
</span>

// Warning badge
<span className="inline-block bg-warning text-white text-caption px-mobile-md py-mobile-xs rounded-badge">
  Pending
</span>

// Error badge
<span className="inline-block bg-error text-white text-caption px-mobile-md py-mobile-xs rounded-badge">
  Rejected
</span>
```

### Pattern 3: Form Input

```tsx
<div className="space-y-mobile-sm">
  <label className="text-label text-foreground">Email</label>
  <input
    type="email"
    className="
      w-full p-mobile-md lg:p-desktop-sm
      border border-border focus:border-border-focus
      rounded-input focus:shadow-focus focus:outline-none
      text-body text-foreground
      transition-all
    "
  />
  <p className="text-caption text-muted">We'll never share your email</p>
</div>
```

---

## 10. Troubleshooting

### Issue: "Class not found" error

**Cause**: Tailwind not recognizing custom token class.

**Fix**:
1. Verify token imported in `tailwind.config.js`
2. Restart dev server: `npm run dev`
3. Check class name spelling

### Issue: Dark mode not working

**Cause**: Missing `.dark` class or missing `dark:` prefix.

**Fix**:
1. Ensure ThemeProvider adds `.dark` class to `<html>`
2. Use explicit dark mode: `bg-primary dark:bg-teal-400`

### Issue: Spacing not responsive

**Cause**: Using explicit token instead of semantic.

**Fix**:
- Use semantic: `p-card-padding` (auto-responsive)
- Or explicit: `p-mobile-md lg:p-desktop-lg` (manual breakpoints)

---

## 11. Building Theme-Aware Components

### The Zero-Logic Approach

**Goal**: Components that work in Light, Dark, and System modes without any theme detection logic.

#### ❌ Old Way (Manual Theme Detection)

```tsx
import { useTheme } from 'next-themes';

function Alert() {
  const { theme } = useTheme();
  
  return (
    <div className={
      theme === 'dark' 
        ? 'bg-red-900 text-red-100' 
        : 'bg-red-100 text-red-900'
    }>
      Error message
    </div>
  );
}
```

**Problems**:
- Duplicate logic in every component
- Hydration errors (theme loads async)
- Maintenance nightmare (10+ components need updates)

#### ✅ New Way (Semantic Tokens)

```tsx
function Alert() {
  return (
    <div className="bg-error-light text-error-dark border border-error">
      Error message
    </div>
  );
}
```

**Benefits**:
- No theme hooks needed
- Works immediately (no async loading)
- Single source of truth in `tailwind.config.js`

### Theme-Aware Semantic Tokens

These tokens automatically adapt to Light/Dark/System modes:

| Token | Light Mode | Dark Mode | Use Case |
|-------|------------|-----------|----------|
| `bg-success-light` | `#dcfce7` (green-100) | `#14532d` (green-900) | Success alert background |
| `text-success-dark` | `#14532d` (green-900) | `#dcfce7` (green-100) | Success alert text |
| `bg-error-light` | `#fee2e2` (red-100) | `#7f1d1d` (red-900) | Error alert background |
| `text-error-dark` | `#7f1d1d` (red-900) | `#fee2e2` (red-100) | Error alert text |
| `bg-warning-light` | `#fef3c7` (amber-100) | `#78350f` (amber-900) | Warning alert background |
| `text-warning-dark` | `#78350f` (amber-900) | `#fef3c7` (amber-100) | Warning alert text |
| `bg-info-light` | `#dbeafe` (blue-100) | `#1e3a8a` (blue-900) | Info alert background |
| `text-info-dark` | `#1e3a8a` (blue-900) | `#dbeafe` (blue-100) | Info alert text |

### Pattern: Status Components

```tsx
// Success Badge
<span className="bg-success text-white px-3 py-1 rounded-lg">
  Approved
</span>

// Success Alert (light background)
<div className="bg-success-light text-success-dark border-l-4 border-success p-4">
  <h4 className="font-heading-4 mb-1">Success</h4>
  <p className="text-body-small">Your quote has been submitted.</p>
</div>

// Warning Badge (outlined)
<span className="border-2 border-warning text-warning px-3 py-1 rounded-lg">
  Pending
</span>

// Error Alert with icon
<div className="bg-error-light text-error-dark border border-error rounded p-4">
  <div className="flex items-start gap-3">
    <span className="text-error text-xl">✕</span>
    <div>
      <h4 className="font-heading-4 mb-1">Error</h4>
      <p className="text-body-small">Connection failed. Please retry.</p>
    </div>
  </div>
</div>
```

### Pattern: Interactive Elements

```tsx
// Primary Button (theme-aware)
<button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg">
  Get Quote
</button>

// Secondary Button (outlined)
<button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg">
  Learn More
</button>

// Card with theme-aware background
<div className="bg-surface border border-border rounded-lg p-card-padding">
  <h3 className="font-heading-3 text-foreground mb-2">Solar Savings</h3>
  <p className="text-body text-foreground-secondary">
    Estimated savings: $1,200/year
  </p>
</div>
```

### Pattern: Forms

```tsx
<form className="space-y-form-gap">
  {/* Text input with theme-aware states */}
  <div>
    <label className="block text-body-small font-medium text-foreground mb-2">
      Email Address
    </label>
    <input 
      type="email"
      className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-foreground
                 focus:border-primary focus:ring-2 focus:ring-primary-light
                 placeholder:text-muted"
      placeholder="you@example.com"
    />
  </div>

  {/* Input with error state */}
  <div>
    <label className="block text-body-small font-medium text-foreground mb-2">
      Phone Number
    </label>
    <input 
      type="tel"
      className="w-full px-4 py-3 rounded-lg border border-error bg-error-light text-error-dark
                 focus:border-error focus:ring-2 focus:ring-error"
      value="invalid"
    />
    <p className="text-body-small text-error mt-1">
      Please enter a valid phone number
    </p>
  </div>

  {/* Submit button */}
  <button className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium">
    Submit Quote Request
  </button>
</form>
```

### Complete Component Example

```tsx
// Solar quote card using ALL token types (color, typography, spacing)
export function QuoteCard({ quote }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-card-padding">
      {/* Header */}
      <div className="flex items-start justify-between mb-section-margin">
        <div>
          <h3 className="font-heading-3 text-foreground mb-1">{quote.installerName}</h3>
          <p className="text-body-small text-muted">{quote.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-body-small font-medium ${
          quote.status === 'approved' 
            ? 'bg-success text-white' 
            : quote.status === 'pending'
            ? 'bg-warning text-white'
            : 'bg-error text-white'
        }`}>
          {quote.status}
        </span>
      </div>

      {/* System details */}
      <div className="grid grid-cols-2 gap-form-gap mb-section-margin">
        <div>
          <p className="text-body-small text-muted mb-1">System Size</p>
          <p className="font-heading-4 text-foreground">{quote.systemSize} kW</p>
        </div>
        <div>
          <p className="text-body-small text-muted mb-1">Est. Annual Savings</p>
          <p className="font-heading-4 text-success">${quote.savings.toLocaleString()}</p>
        </div>
      </div>

      {/* Price */}
      <div className="bg-primary-light rounded-lg p-4 mb-form-gap">
        <p className="text-body-small text-primary-dark mb-1">Total Investment</p>
        <p className="font-heading-2 text-primary">${quote.price.toLocaleString()}</p>
        <p className="text-body-small text-primary-dark mt-1">
          After federal tax credit: ${(quote.price * 0.7).toLocaleString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-button-gap">
        <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium">
          Accept Quote
        </button>
        <button className="flex-1 border-2 border-border text-foreground hover:bg-surface-hover py-3 rounded-lg font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}
```

### Testing Theme Adaptation

1. **View in Storybook**: All component stories support theme switching
2. **Test all modes**: Light, Dark, System (based on OS preference)
3. **Check contrast**: Use Chrome DevTools Lighthouse for WCAG AA compliance
4. **Verify states**: Hover, focus, active, disabled

**Checklist**:
- [ ] No `useTheme()` hooks in component
- [ ] No conditional `theme === 'dark'` logic
- [ ] Uses semantic tokens only (`bg-primary`, `text-success-dark`)
- [ ] All states have theme-aware tokens (hover, focus, error)
- [ ] Tested in Light, Dark, and System modes
- [ ] Contrast ratio ≥ 4.5:1 for text (WCAG AA)

---

## 12. Next Steps

1. **Practice**: Refactor one component using this guide
2. **Review**: Check refactored component in Storybook
3. **Test**: Verify all themes, states, and breakpoints
4. **Ask**: If stuck, refer to `data-model.md` for full token schemas

**Happy Coding! 🚀**
