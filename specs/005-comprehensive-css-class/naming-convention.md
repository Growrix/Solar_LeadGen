# CSS Class Naming Convention Guide
**Feature 005: Comprehensive CSS Class Audit and Standardization**

This document defines the standardized naming conventions for all CSS classes in the Solar Match application. It integrates Feature 004 design tokens with shadcn/ui CSS variables to ensure consistency, maintainability, and proper dark theme support.

---

## 📋 Table of Contents

1. [Color Conventions](#-color-conventions)
2. [Typography Conventions](#-typography-conventions)
3. [Spacing Conventions](#-spacing-conventions)
4. [Shadow Conventions](#-shadow-conventions)
5. [Border Conventions](#-border-conventions)
6. [Icon Sizing Conventions](#-icon-sizing-conventions)
7. [Animation Conventions](#-animation-conventions)
8. [Decision Tree](#-decision-tree-when-to-use-what)
9. [State Patterns](#-state-patterns)
10. [Responsive Patterns](#-responsive-patterns)
11. [Dark Theme Patterns](#-dark-theme-patterns)

---

## 🎨 Color Conventions (T039)

### Semantic Color Tokens

Use shadcn/ui CSS variable-based color tokens for all color applications. These tokens automatically handle dark theme switching.

#### Background Colors

| Token | Usage | CSS Variable | Light Value | Dark Value |
|-------|-------|-------------|-------------|-----------|
| `bg-background` | Main app background | `--background` | `hsl(0 0% 100%)` | `hsl(0 0% 6%)` |
| `bg-foreground` | Text on background | `--foreground` | `hsl(0 0% 6%)` | `hsl(0 0% 96%)` |
| `bg-primary` | Primary actions (teal) | `--primary` | `hsl(173 80% 40%)` | `hsl(173 80% 63%)` |
| `bg-primary-foreground` | Text on primary | `--primary-foreground` | `hsl(0 0% 100%)` | `hsl(0 0% 6%)` |
| `bg-secondary` | Secondary elements | `--secondary` | `hsl(0 0% 96%)` | `hsl(0 0% 15%)` |
| `bg-secondary-foreground` | Text on secondary | `--secondary-foreground` | `hsl(0 0% 6%)` | `hsl(0 0% 96%)` |
| `bg-destructive` | Error/delete actions | `--destructive` | `hsl(0 84% 60%)` | `hsl(0 63% 31%)` |
| `bg-destructive-foreground` | Text on destructive | `--destructive-foreground` | `hsl(0 0% 100%)` | `hsl(0 0% 96%)` |
| `bg-muted` | Disabled/muted elements | `--muted` | `hsl(0 0% 96%)` | `hsl(0 0% 15%)` |
| `bg-muted-foreground` | Muted text | `--muted-foreground` | `hsl(0 0% 45%)` | `hsl(0 0% 64%)` |
| `bg-accent` | Hover/focus highlights | `--accent` | `hsl(0 0% 96%)` | `hsl(0 0% 15%)` |
| `bg-accent-foreground` | Text on accent | `--accent-foreground` | `hsl(0 0% 6%)` | `hsl(0 0% 96%)` |
| `bg-card` | Card backgrounds | `--card` | `hsl(0 0% 100%)` | `hsl(0 0% 6%)` |
| `bg-card-foreground` | Text on cards | `--card-foreground` | `hsl(0 0% 6%)` | `hsl(0 0% 96%)` |
| `bg-popover` | Popover/dropdown backgrounds | `--popover` | `hsl(0 0% 100%)` | `hsl(0 0% 6%)` |
| `bg-popover-foreground` | Text in popovers | `--popover-foreground` | `hsl(0 0% 6%)` | `hsl(0 0% 96%)` |

#### Text Colors

| Token | Usage | Example |
|-------|-------|---------|
| `text-foreground` | Default text color | Body paragraphs, headings |
| `text-primary` | Primary brand color text | Links, brand elements |
| `text-destructive` | Error messages, warnings | Form validation errors |
| `text-muted-foreground` | Secondary text | Captions, metadata, timestamps |
| `text-accent-foreground` | Accented text | Highlighted content |

#### Border Colors

| Token | Usage | Example |
|-------|-------|---------|
| `border-border` | Default borders | Cards, inputs, dividers |
| `border-input` | Form input borders | Text fields, selects |
| `border-primary` | Primary brand borders | Active states, focus rings |
| `border-destructive` | Error state borders | Invalid form fields |

#### Custom Status Colors

For success/info states not included in shadcn defaults, add these to `globals.css`:

```css
@layer base {
  :root {
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    --info: 217 91% 60%;
    --info-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
  }
  
  .dark {
    --success: 142 71% 45%;
    --success-foreground: 0 0% 6%;
    --info: 217 91% 60%;
    --info-foreground: 0 0% 6%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 6%;
  }
}
```

Usage:
```tsx
<div className="bg-success text-success-foreground">Success message</div>
<p className="text-info">Info text</p>
<span className="text-warning">Warning text</span>
```

### Migration Examples

```tsx
// ❌ BEFORE (hardcoded colors):
<button className="bg-teal-600 text-white hover:bg-teal-700">
  Submit
</button>
<p className="text-gray-600">Secondary text</p>
<div className="border border-gray-300">Content</div>

// ✅ AFTER (semantic tokens):
<Button variant="default">Submit</Button>
<p className="text-muted-foreground">Secondary text</p>
<div className="border border-border">Content</div>
```

---

## ✍️ Typography Conventions (T040)

### Semantic Typography Tokens

Typography tokens combine font size, line height, and font weight into single semantic classes.

#### Heading Scale

| Token | Font Size | Line Height | Weight | Usage | HTML Tag |
|-------|-----------|-------------|--------|-------|----------|
| `text-heading-1` | 36px (2.25rem) | 40px (2.5rem) | 700 | Page titles | `<h1>` |
| `text-heading-2` | 30px (1.875rem) | 36px (2.25rem) | 600 | Section headings | `<h2>` |
| `text-heading-3` | 24px (1.5rem) | 32px (2rem) | 600 | Subsection headings | `<h3>` |
| `text-heading-4` | 20px (1.25rem) | 28px (1.75rem) | 500 | Card titles | `<h4>` |

#### Body Text Scale

| Token | Font Size | Line Height | Weight | Usage |
|-------|-----------|-------------|--------|-------|
| `text-body-large` | 18px (1.125rem) | 28px (1.75rem) | 400 | Intro paragraphs, emphasized content |
| `text-body` | 16px (1rem) | 24px (1.5rem) | 400 | Default body text |
| `text-body-small` | 14px (0.875rem) | 20px (1.25rem) | 400 | Compact text, labels, form fields |
| `text-caption` | 12px (0.75rem) | 16px (1rem) | 400 | Metadata, timestamps, helper text |

#### Specialty Text Tokens

| Token | Font Size | Line Height | Weight | Usage |
|-------|-----------|-------------|--------|-------|
| `text-label` | 14px (0.875rem) | 20px (1.25rem) | 500 | Form labels, category labels |
| `text-button` | 14px (0.875rem) | 20px (1.25rem) | 600 | Button text (already built into shadcn Button) |

### Tailwind Config Implementation

Add to `tailwind.config.js` under `theme.extend.fontSize`:

```javascript
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'heading-1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'heading-3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading-4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'body-large': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'button': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
      },
    },
  },
}
```

### Migration Examples

```tsx
// ❌ BEFORE (raw typography classes):
<h1 className="text-4xl font-bold">Welcome</h1>
<h2 className="text-3xl font-semibold">Features</h2>
<p className="text-sm text-gray-600">Description text</p>
<span className="text-xs text-gray-500">Updated 2 hours ago</span>
<label className="text-sm font-medium">Email Address</label>

// ✅ AFTER (semantic tokens):
<h1 className="text-heading-1">Welcome</h1>
<h2 className="text-heading-2">Features</h2>
<p className="text-body-small text-muted-foreground">Description text</p>
<span className="text-caption text-muted-foreground">Updated 2 hours ago</span>
<Label>Email Address</Label> {/* shadcn Label with built-in styling */}
```

### Semantic HTML Alignment

**Always use proper HTML tags with typography tokens:**

```tsx
// ❌ WRONG (div pretending to be heading):
<div className="text-heading-2">Section Title</div>

// ✅ CORRECT (proper semantic HTML):
<h2 className="text-heading-2">Section Title</h2>
```

**Exception**: Use `<div>` or `<span>` when heading-like styling is needed for non-heading content:
```tsx
<div className="text-heading-4">Card Summary (not a heading)</div>
```

---

## 📏 Spacing Conventions (T041)

### Standard Spacing Scale

Solar Match uses Tailwind's default spacing scale based on 0.25rem (4px) increments. Use these standardized values consistently.

#### Common Spacing Patterns

| Context | Spacing Token | Value | Usage |
|---------|--------------|-------|-------|
| Component padding (compact) | `p-4` | 16px | CardHeader, CardFooter |
| Component padding (standard) | `p-6` | 24px | CardContent, Modal body |
| Component padding (generous) | `p-8` | 32px | Page containers |
| Section spacing | `space-y-6` | 24px | Between major sections |
| Related items spacing | `space-y-4` | 16px | Form groups, list items |
| Tight items spacing | `space-y-2` | 8px | Label + input pairs |
| Grid gaps (main) | `gap-6` | 24px | Card grids, main layouts |
| Grid gaps (compact) | `gap-4` | 16px | Icon grids, compact layouts |
| Inline spacing | `gap-2` | 8px | Button groups, inline elements |

### Container Padding Standards

```tsx
// Page-level containers
<main className="container mx-auto px-4 py-8">
  {/* Use px-4 for mobile, py-8 for top/bottom */}
</main>

// Card containers
<Card>
  <CardHeader className="p-4"> {/* Compact header */}
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6"> {/* Standard content padding */}
    {/* Content */}
  </CardContent>
  <CardFooter className="p-4"> {/* Compact footer */}
    {/* Actions */}
  </CardFooter>
</Card>

// Modal containers
<DialogContent className="p-6"> {/* Standard modal padding */}
  {/* Modal content */}
</DialogContent>
```

### Responsive Spacing

Use responsive variants sparingly and only when necessary:

```tsx
// Responsive padding (mobile to desktop)
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases with screen size */}
</div>

// Responsive grid gaps
<div className="grid gap-4 md:gap-6">
  {/* Gap increases on larger screens */}
</div>
```

### Migration Examples

```tsx
// ❌ BEFORE (inconsistent spacing):
<div className="p-5">...</div>
<div className="space-y-3">...</div>
<div className="gap-5">...</div>

// ✅ AFTER (standardized spacing):
<div className="p-6">...</div>
<div className="space-y-4">...</div>
<div className="gap-6">...</div>
```

---

## 🌑 Shadow Conventions (T042)

### Elevation Scale

Shadows indicate elevation and hierarchy. Use consistently based on component type.

| Shadow Token | Usage | Elevation Level | Example Components |
|-------------|-------|-----------------|-------------------|
| `shadow-sm` | Subtle elevation | 1 | Input fields, borders, subtle cards |
| `shadow` | Default elevation | 2 | Standard cards, buttons |
| `shadow-md` | Raised elements | 3 | Hover states, active cards |
| `shadow-lg` | Floating elements | 4 | Dropdowns, popovers, tooltips |
| `shadow-xl` | Modal/overlay | 5 | Modals, dialogs, overlays |
| `shadow-2xl` | Maximum elevation | 6 | Rarely used, highest priority elements |

### Shadow Values (from Tailwind)

```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Component-Specific Shadow Guidelines

```tsx
// Cards (default state)
<Card className="shadow">
  {/* Standard card shadow */}
</Card>

// Cards (hover state)
<Card className="shadow hover:shadow-md transition-shadow">
  {/* Elevate on hover */}
</Card>

// Inputs
<Input className="shadow-sm">
  {/* Subtle shadow for depth */}
</Input>

// Dropdowns/Popovers
<Popover className="shadow-lg">
  {/* Floating element shadow */}
</Popover>

// Modals/Dialogs
<Dialog className="shadow-xl">
  {/* Maximum elevation for overlays */}
</Dialog>
```

### Migration Examples

```tsx
// ❌ BEFORE (inconsistent shadows):
<div className="shadow-2xl">Regular Card</div>
<div className="shadow-sm">Modal</div>

// ✅ AFTER (appropriate shadows):
<Card className="shadow">Regular Card</Card>
<Dialog className="shadow-xl">Modal</Dialog>
```

---

## 🔲 Border Conventions (T043)

### Border Radius Scale

Use semantic border radius tokens based on component type.

| Token | Value | Usage | Example Components |
|-------|-------|-------|-------------------|
| `rounded-sm` | 0.125rem (2px) | Subtle rounding | Badges, tags |
| `rounded` | 0.25rem (4px) | Default rounding | Inputs, buttons (shadcn default) |
| `rounded-md` | 0.375rem (6px) | Medium rounding | Cards, containers |
| `rounded-lg` | 0.5rem (8px) | Prominent rounding | Large cards, featured sections |
| `rounded-xl` | 0.75rem (12px) | Extra rounding | Hero sections, special cards |
| `rounded-2xl` | 1rem (16px) | Maximum rounding | Rarely used |
| `rounded-full` | 9999px | Circular | Avatars, icon buttons, pills |

### Border Width Standards

| Token | Value | Usage |
|-------|-------|-------|
| `border` | 1px | Default borders (cards, inputs) |
| `border-2` | 2px | Emphasized borders (focus states) |
| `border-0` | 0px | Remove borders |

### Component-Specific Border Guidelines

```tsx
// Cards
<Card className="rounded-lg border">
  {/* Large rounding for cards, default 1px border */}
</Card>

// Buttons (shadcn default: rounded-md)
<Button className="rounded-md">
  {/* Medium rounding for buttons */}
</Button>

// Inputs (shadcn default: rounded-md)
<Input className="rounded-md border">
  {/* Medium rounding for inputs */}
</Input>

// Avatars
<Avatar className="rounded-full">
  {/* Circular avatars */}
</Avatar>

// Badges
<Badge className="rounded-full">
  {/* Pill-shaped badges */}
</Badge>
```

### Migration Examples

```tsx
// ❌ BEFORE (inconsistent rounding):
<div className="rounded-xl border-2">Card</div>
<button className="rounded-sm">Button</button>

// ✅ AFTER (semantic rounding):
<Card className="rounded-lg border">Card</Card>
<Button className="rounded-md">Button</Button>
```

---

## 🖼️ Icon Sizing Conventions (T044)

### Icon Size Utilities

Custom icon utilities added in Phase 1 via Tailwind plugin.

| Token | Size | Usage Context |
|-------|------|---------------|
| `icon-xs` | 12px (0.75rem) | Inline text icons, badges |
| `icon-sm` | 16px (1rem) | Form inputs, small buttons |
| `icon-md` | 20px (1.25rem) | Default icon size, buttons |
| `icon-lg` | 24px (1.5rem) | Large buttons, headings |
| `icon-xl` | 32px (2rem) | Hero sections, feature icons |

### Implementation (already in tailwind.config.js)

```javascript
plugin(function({ addUtilities }) {
  addUtilities({
    '.icon-xs': { width: '0.75rem', height: '0.75rem' },
    '.icon-sm': { width: '1rem', height: '1rem' },
    '.icon-md': { width: '1.25rem', height: '1.25rem' },
    '.icon-lg': { width: '1.5rem', height: '1.5rem' },
    '.icon-xl': { width: '2rem', height: '2rem' },
  })
})
```

### Usage Patterns

**Prefer lucide-react size prop when possible:**
```tsx
import { Search } from 'lucide-react'

<Search size={20} className="text-muted-foreground" />
```

**Use icon-* utilities for wrapper elements:**
```tsx
<span className="icon-md">
  <Search className="text-muted-foreground" />
</span>
```

**Contextual icon sizing:**
```tsx
// In buttons
<Button>
  <Search className="icon-sm mr-2" />
  Search
</Button>

// In headings
<h2 className="text-heading-2 flex items-center gap-2">
  <Star className="icon-lg text-primary" />
  Featured Content
</h2>

// In form inputs (left icon)
<div className="relative">
  <Search className="icon-sm absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <Input className="pl-10" />
</div>
```

### Migration Examples

```tsx
// ❌ BEFORE (raw h-X w-X classes):
<Search className="h-5 w-5 text-gray-600" />
<Star className="h-4 w-4 text-teal-600" />
<ChevronDown className="h-6 w-6" />

// ✅ AFTER (icon utilities + semantic colors):
<Search className="icon-md text-muted-foreground" />
<Star className="icon-sm text-primary" />
<ChevronDown className="icon-lg" />

// ✅ BEST (lucide size prop):
<Search size={20} className="text-muted-foreground" />
<Star size={16} className="text-primary" />
<ChevronDown size={24} />
```

---

## ⚡ Animation Conventions (T045)

### Duration Tokens

Animation durations from Feature 004 design tokens.

| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 150ms | Quick interactions (hover, focus) |
| `duration-normal` | 200ms | Default transitions |
| `duration-slow` | 300ms | Complex animations, page transitions |

### Transition Types

**IMPORTANT**: Never use `transition-all` (performance issue).

| Token | Properties | Usage |
|-------|-----------|-------|
| `transition-colors` | color, background-color, border-color | Color changes, hover states |
| `transition-opacity` | opacity | Fade in/out |
| `transition-shadow` | box-shadow | Shadow elevation changes |
| `transition-transform` | transform | Movement, scaling |
| `transition` | background-color, border-color, color, fill, stroke, opacity, box-shadow, transform | Multiple properties (use sparingly) |

### Easing Functions

| Token | Easing | Usage |
|-------|--------|-------|
| `ease-linear` | linear | Constant speed (loading spinners) |
| `ease-in` | cubic-bezier(0.4, 0, 1, 1) | Accelerate (exit animations) |
| `ease-out` | cubic-bezier(0, 0, 0.2, 1) | Decelerate (enter animations) |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Smooth both (default choice) |

### Tailwind Config Implementation

Add to `tailwind.config.js` under `theme.extend.transitionDuration`:

```javascript
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
}
```

### Common Animation Patterns

```tsx
// Hover color change
<Button className="transition-colors duration-normal hover:bg-primary/90">
  Hover Me
</Button>

// Shadow elevation on hover
<Card className="transition-shadow duration-normal hover:shadow-md">
  Hover Card
</Card>

// Fade in/out
<div className="transition-opacity duration-normal opacity-0 hover:opacity-100">
  Fade In
</div>

// Scale on hover
<Button className="transition-transform duration-fast hover:scale-105">
  Scale Button
</Button>

// Combined (multiple properties)
<Card className="transition duration-normal hover:shadow-md hover:scale-[1.02]">
  Multi-transition Card
</Card>
```

### Migration Examples

```tsx
// ❌ BEFORE (transition-all performance issue):
<button className="transition-all duration-300 hover:bg-teal-700">
  Submit
</button>

// ✅ AFTER (specific transition):
<Button className="transition-colors duration-normal hover:bg-primary/90">
  Submit
</Button>

// ❌ BEFORE (no transition):
<div className="hover:shadow-lg">Card</div>

// ✅ AFTER (smooth transition):
<Card className="transition-shadow duration-normal hover:shadow-lg">
  Card
</Card>
```

---

## 🌳 Decision Tree: When to Use What (T046)

### Flowchart for Class Selection

```
START: Need to style an element
│
├─ Is it a common UI component? (button, input, card, etc.)
│  ├─ YES → Use shadcn/ui component
│  │        Example: <Button>, <Input>, <Card>
│  │
│  └─ NO → Continue to next decision
│
├─ Is it a color/background/border color?
│  ├─ YES → Use semantic color token
│  │        Examples: bg-primary, text-foreground, border-border
│  │
│  └─ NO → Continue to next decision
│
├─ Is it typography? (font size, weight, line height)
│  ├─ YES → Use typography token
│  │        Examples: text-heading-1, text-body, text-caption
│  │
│  └─ NO → Continue to next decision
│
├─ Is it an icon size?
│  ├─ YES → Use icon utility or lucide size prop
│  │        Examples: icon-md, <Icon size={20} />
│  │
│  └─ NO → Continue to next decision
│
├─ Is it spacing? (padding, margin, gap)
│  ├─ YES → Use Tailwind spacing utility
│  │        Examples: p-6, space-y-4, gap-6
│  │
│  └─ NO → Continue to next decision
│
├─ Is it a shadow/elevation?
│  ├─ YES → Use shadow utility based on elevation level
│  │        Examples: shadow (cards), shadow-lg (dropdowns), shadow-xl (modals)
│  │
│  └─ NO → Continue to next decision
│
├─ Is it a border radius?
│  ├─ YES → Use rounding utility based on component type
│  │        Examples: rounded-lg (cards), rounded-md (buttons), rounded-full (avatars)
│  │
│  └─ NO → Continue to next decision
│
├─ Is it an animation/transition?
│  ├─ YES → Use specific transition utility (NEVER transition-all)
│  │        Examples: transition-colors, transition-shadow, transition-transform
│  │
│  └─ NO → Use standard Tailwind utility
│           Examples: flex, grid, items-center, justify-between
│
END
```

### Quick Reference Table

| Need to Style... | Use This | Example |
|-----------------|----------|---------|
| Button | shadcn Button component | `<Button variant="default">` |
| Input/Form field | shadcn Input/Label | `<Input />` with `<Label>` |
| Card | shadcn Card components | `<Card><CardHeader>...</Card>` |
| Primary color | `bg-primary`, `text-primary` | Button backgrounds, brand text |
| Error color | `bg-destructive`, `text-destructive` | Error messages, delete buttons |
| Secondary text | `text-muted-foreground` | Captions, timestamps |
| Page title (h1) | `text-heading-1` | Main page heading |
| Body text | `text-body` or `text-body-small` | Paragraphs, descriptions |
| Metadata text | `text-caption` | Timestamps, helper text |
| Icon size | `icon-md` or `size={20}` | Icons in buttons, headings |
| Card padding | `p-6` (content), `p-4` (header/footer) | CardContent, CardHeader |
| Section spacing | `space-y-6` | Between major sections |
| Card shadow | `shadow` (default), `shadow-md` (hover) | Card elevation |
| Card rounding | `rounded-lg` | Card corners |
| Button hover | `transition-colors duration-normal` | Smooth color change |

---

## 🎨 State Patterns (T047)

### Interactive States

All interactive elements should have consistent hover, focus, active, and disabled states.

#### Hover States

```tsx
// Buttons (built into shadcn Button)
<Button variant="default">
  {/* Automatically has hover:bg-primary/90 */}
</Button>

// Cards
<Card className="transition-shadow duration-normal hover:shadow-md">
  {/* Elevate on hover */}
</Card>

// Links
<a className="text-primary hover:underline">
  {/* Underline on hover */}
</a>
```

#### Focus States

```tsx
// Inputs (built into shadcn Input)
<Input />
{/* Automatically has focus:ring-2 focus:ring-ring */}

// Custom focusable elements
<div 
  tabIndex={0}
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  {/* Custom focus ring */}
</div>
```

#### Active States

```tsx
// Buttons
<Button className="active:scale-95">
  {/* Subtle press effect */}
</Button>

// Toggle buttons
<Button 
  variant={isActive ? "default" : "outline"}
  className={cn(isActive && "ring-2 ring-primary")}
>
  {/* Visual feedback for active state */}
</Button>
```

#### Disabled States

```tsx
// Buttons (built into shadcn Button)
<Button disabled>
  {/* Automatically has opacity-50, cursor-not-allowed */}
</Button>

// Inputs
<Input disabled className="opacity-50 cursor-not-allowed" />

// Custom disabled state
<div className={cn(
  "transition-opacity",
  isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
)}>
  {/* Disabled styling */}
</div>
```

### Validation States (Forms)

```tsx
// Error state
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    className={cn(errors.email && "border-destructive focus:ring-destructive")}
  />
  {errors.email && (
    <p className="text-caption text-destructive">{errors.email}</p>
  )}
</div>

// Success state (add custom success color)
<Input className="border-success focus:ring-success" />
<p className="text-caption text-success">Email verified!</p>

// Warning state
<Input className="border-warning focus:ring-warning" />
<p className="text-caption text-warning">This field will be deprecated soon.</p>
```

### Loading States

```tsx
// Button loading state
<Button disabled>
  <Loader2 className="icon-sm mr-2 animate-spin" />
  Loading...
</Button>

// Skeleton loading
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-muted rounded"></div>
  <div className="h-4 bg-muted rounded w-3/4"></div>
</div>

// Spinner
<Loader2 className="icon-lg animate-spin text-primary" />
```

---

## 📱 Responsive Patterns (T048)

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens.

```tsx
// Base styles apply to mobile, then override for larger screens
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases with screen size */}
</div>
```

### Breakpoints

| Breakpoint | Min Width | Usage |
|-----------|-----------|-------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large screens |

### Responsive Typography

Use `clamp()` for fluid typography (already in Feature 004 tokens):

```css
/* Heading 1 (fluid from mobile to desktop) */
font-size: clamp(2rem, 5vw, 2.25rem);

/* Heading 2 (fluid) */
font-size: clamp(1.5rem, 4vw, 1.875rem);
```

Implementation in Tailwind:
```tsx
<h1 className="text-heading-1">
  {/* Automatically fluid on mobile */}
</h1>
```

### Responsive Grid Layouts

```tsx
// Single column mobile, 2 columns tablet, 3 columns desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Auto-fit responsive grid (no breakpoints needed)
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {/* Cards automatically wrap based on available space */}
</div>
```

### Responsive Visibility

```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Desktop sidebar
</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">
  Mobile menu
</div>
```

### Responsive Spacing

```tsx
// Responsive padding
<main className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
  {/* Padding increases with screen size */}
</main>

// Responsive gaps
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  {/* Stack on mobile, row on desktop */}
</div>
```

---

## 🌙 Dark Theme Patterns (T049)

### CSS Variable Approach

shadcn/ui uses CSS variables that automatically switch between light and dark values. No manual `.dark:` prefixes needed for most cases.

```css
/* globals.css - automatically handles theme switching */
:root {
  --background: 0 0% 100%;  /* Light mode */
  --foreground: 0 0% 6%;
}

.dark {
  --background: 0 0% 6%;    /* Dark mode */
  --foreground: 0 0% 96%;
}
```

### Using Theme Colors

```tsx
// ✅ CORRECT: Use semantic tokens (automatically theme-aware)
<div className="bg-background text-foreground">
  {/* Automatically switches between light/dark */}
</div>

<Card className="bg-card text-card-foreground border border-border">
  {/* Card colors adapt to theme */}
</Card>

// ❌ WRONG: Hardcoded colors (no dark mode support)
<div className="bg-white text-black">
  {/* Breaks in dark mode */}
</div>
```

### Manual Dark Mode Overrides (Rare Cases)

Only use `.dark:` prefix when you need to override the CSS variable behavior:

```tsx
// Force different styling in dark mode
<div className="bg-gray-100 dark:bg-gray-900">
  {/* Different colors for light/dark */}
</div>

// Adjust opacity in dark mode
<img className="opacity-100 dark:opacity-80" />
```

### Theme-Aware Components

```tsx
// Button (automatically theme-aware)
<Button variant="default">
  {/* Primary color adjusts to theme */}
</Button>

// Input (automatically theme-aware)
<Input />
{/* Border and background adapt to theme */}

// Card (automatically theme-aware)
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* Text color adapts */}
  </CardHeader>
  <CardContent>
    {/* Content colors adapt */}
  </CardContent>
</Card>
```

### Dark Mode Testing

During migration (Phase 1-10), the app is locked to dark theme only:

```tsx
// ThemeProvider.tsx (locked during migration)
const [theme, setTheme] = useState<Theme>('dark')
```

After migration is complete (Phase 11), re-enable theme switching:

```tsx
// ThemeProvider.tsx (after migration)
const [theme, setTheme] = useState<Theme>(
  () => (localStorage.getItem('theme') as Theme) || 'dark'
)
```

### Adding Custom Colors for Dark Theme

If adding custom colors (like success, info, warning), define both light and dark values:

```css
@layer base {
  :root {
    --success: 142 76% 36%;  /* Light mode green */
  }
  
  .dark {
    --success: 142 71% 45%;  /* Dark mode green (brighter) */
  }
}
```

Usage:
```tsx
<div className="bg-success text-success-foreground">
  {/* Automatically theme-aware */}
</div>
```

---

## ✅ Validation Rules (T050)

### Allowed Class Patterns

- ✅ Semantic color tokens: `bg-primary`, `text-foreground`, `border-border`
- ✅ Typography tokens: `text-heading-1`, `text-body`, `text-caption`
- ✅ Tailwind spacing utilities: `p-6`, `space-y-4`, `gap-6`
- ✅ Tailwind layout utilities: `flex`, `grid`, `items-center`, `justify-between`
- ✅ Shadow utilities: `shadow`, `shadow-md`, `shadow-lg`
- ✅ Rounding utilities: `rounded-lg`, `rounded-md`, `rounded-full`
- ✅ Icon utilities: `icon-sm`, `icon-md`, `icon-lg`
- ✅ Specific transitions: `transition-colors`, `transition-shadow`, `transition-transform`
- ✅ Duration utilities: `duration-fast`, `duration-normal`, `duration-slow`
- ✅ shadcn/ui components: `<Button>`, `<Input>`, `<Card>`, etc.

### Forbidden Class Patterns

- ❌ Hardcoded colors: `bg-teal-600`, `text-red-500`, `border-gray-300`
- ❌ Raw typography: `text-4xl font-bold`, `text-sm`, `font-semibold`
- ❌ Raw icon sizes: `h-5 w-5`, `h-4 w-4`, `h-6 w-6`
- ❌ `transition-all` (performance issue)
- ❌ Arbitrary values without tokens: `text-[#008080]`, `p-[23px]`
- ❌ Non-semantic HTML: `<div>` styled as `<h1>` without semantic justification

### Validation Script

Use `validate-classnames.ts` to check for violations:

```bash
# Validate a single file
npx tsx scripts/validate-classnames.ts src/components/MyComponent.tsx

# Pre-commit hook automatically validates staged files
git commit -m "Update component"
```

Script output:
```
❌ Found 3 forbidden class patterns in src/components/MyComponent.tsx:

Line 45: bg-teal-600
  Suggestion: Replace with bg-primary

Line 67: text-2xl font-semibold
  Suggestion: Replace with text-heading-3

Line 89: transition-all
  Suggestion: Replace with transition-colors or transition-shadow
```

---

## 📚 Constitution VI Alignment (T051)

This naming convention is fully aligned with Constitution Section VI: Design System & Tokens.

### Key Requirements Met

1. **Tokenized Utilities** ✅
   - All colors use CSS variables from Feature 004
   - Typography tokens defined with semantic names
   - Spacing, shadows, borders follow standardized scales

2. **Dark-First Approach** ✅
   - App locked to dark theme during migration
   - All semantic tokens have dark theme values
   - No light-mode-only hardcoded colors

3. **Atomic Migration** ✅
   - Component-by-component migration tracked in migration-status.json
   - Each component gets logic preservation checklist
   - Validation script prevents regressions

4. **No Hardcoded Values** ✅
   - Validation script blocks hardcoded colors
   - ESLint plugin enforces Tailwind best practices
   - Pre-commit hook catches violations before commit

### Constitution References

- **Section VI.A**: "Design tokens must be defined for colors, typography, spacing, shadows, and animations."
  - **Met**: All tokens defined in tailwind.config.js and globals.css

- **Section VI.B**: "Use CSS variables for theme switching (light/dark)."
  - **Met**: shadcn/ui CSS variables approach with :root and .dark

- **Section VI.C**: "Migrate incrementally, one component at a time."
  - **Met**: Migration status tracked per component, 61 components prioritized

- **Section VI.D**: "Validate with linting and pre-commit hooks."
  - **Met**: ESLint tailwindcss plugin, Husky pre-commit validation

---

## 🛠️ Industry Standards Alignment (T052)

### Tailwind CSS Best Practices

1. **Utility-First** ✅
   - Prefer Tailwind utilities over custom CSS
   - Use `@apply` sparingly (only in component library)
   - Compose utilities with `cn()` utility function

2. **Semantic Layer** ✅
   - Typography tokens abstract raw Tailwind classes
   - Color tokens use semantic names (primary, destructive)
   - Component variants (Button, Card) abstract styling

3. **Consistency** ✅
   - Standardized spacing scale (4, 8, 16, 24, 32px)
   - Consistent shadow elevation (shadow, shadow-md, shadow-lg)
   - Typography scale (heading-1 through heading-4, body variants)

### shadcn/ui Best Practices

1. **CSS Variables Approach** ✅
   - Colors defined as HSL CSS variables
   - Automatic theme switching with .dark class
   - Easy customization per project

2. **Component Composition** ✅
   - Compound components (Card + CardHeader + CardContent)
   - Variant-based styling (Button variants)
   - Accessible by default (ARIA attributes)

3. **Copy-Paste Philosophy** ✅
   - Components in src/components/ui/ (owned by project)
   - Customizable without package updates
   - No hidden abstractions

### BEM Methodology (Where Applicable)

While Tailwind utilities are preferred, custom component classes follow BEM:

```tsx
// Custom component with BEM structure
<div className="quote-card">
  <div className="quote-card__header">
    <h3 className="quote-card__title">Title</h3>
  </div>
  <div className="quote-card__content">
    Content
  </div>
</div>
```

However, **prefer shadcn/ui components over custom BEM**:

```tsx
// ✅ BETTER: Use shadcn Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Atomic Design Principles

Components follow atomic design hierarchy:

1. **Atoms**: Button, Input, Label, Badge (shadcn/ui)
2. **Molecules**: Form field (Label + Input + error message)
3. **Organisms**: Card with header/content/footer, Modal with form
4. **Templates**: Page layouts (dashboard, quote page)
5. **Pages**: Fully populated templates (homeowner dashboard, installer dashboard)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-28
**Feature**: 005-comprehensive-css-class
**Status**: Phase 5 Complete
