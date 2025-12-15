# 🎨 COLOR PALETTE REFERENCE GUIDE
**Solar Match - Visual Theme Guide**

---

## 🌈 CURRENT COLOR PALETTE

### Brand Colors

#### Primary (Teal/Turquoise)
```
■ #14b8a6  Light    - Hover states, highlights
■ #0d9488  Default  - Main brand color, buttons, links
■ #0f766e  Dark     - Pressed states, emphasis
```
**Usage:** Buttons, links, accents, focus states, progress indicators

#### Secondary (Amber/Gold - Sun theme)
```
■ #fcd34d  Light    - Subtle highlights
■ #fbbf24  Default  - Secondary actions, sun icons
■ #f59e0b  Dark     - Hover states
```
**Usage:** Secondary buttons, warnings, sun/energy icons

---

### Semantic Colors

#### Success (Green)
```
■ #34d399  Light    - Success backgrounds
■ #10b981  Default  - Success messages, active status
■ #059669  Dark     - Success borders
```
**Usage:** Success alerts, verified badges, active status, positive metrics

#### Warning (Orange/Amber)
```
■ #fbbf24  Light    - Warning backgrounds
■ #f59e0b  Default  - Warning messages, pending status
■ #d97706  Dark     - Warning borders
```
**Usage:** Warning alerts, pending status, caution indicators

#### Error (Red)
```
■ #f87171  Light    - Error backgrounds
■ #ef4444  Default  - Error messages, rejected status
■ #dc2626  Dark     - Error borders
```
**Usage:** Error alerts, validation errors, rejected status, danger actions

#### Info (Blue)
```
■ #60a5fa  Light    - Info backgrounds
■ #3b82f6  Default  - Info messages, links
■ #2563eb  Dark     - Info borders
```
**Usage:** Info alerts, help text, informational badges

---

### Theme-Specific Colors

#### Light Theme
```
Background Primary:     ■ #F2F0EF  (Cream)
Background Secondary:   ■ #ffffff  (White)
Text Primary:           ■ #0F172A  (Dark Slate)
Text Secondary:         ■ #475569  (Gray)
Border Color:           ■ #e5e7eb  (Light Gray)
Accent Color:           ■ #0d9488  (Teal)
```

#### Dark Theme
```
Background Primary:     ■ #000000  (Pure Black)
Background Secondary:   ■ #0f172a  (Slate)
Text Primary:           ■ #E2E8F0  (Light)
Text Secondary:         ■ #94a3b8  (Gray)
Border Color:           ■ #334155  (Slate)
Accent Color:           ■ #14b8a6  (Bright Teal)
```

#### System Theme (Eco-Friendly)
```
Background Primary:     ■ #001405  (Dark Green)
Background Secondary:   ■ #0a2f1a  (Forest Green)
Text Primary:           ■ #FFFFFF  (White)
Text Secondary:         ■ #86efac  (Light Green)
Border Color:           ■ #0d9488  (Teal)
Accent Color:           ■ #0d9488  (Teal)
```

---

### Chart & Data Visualization Colors

```
Savings/Positive:    ■ #10b981  (Green)
Cost/Neutral:        ■ #0D9488  (Teal)
ROI:                 ■ #14b8a6  (Bright Teal)
Loss/Negative:       ■ #ef4444  (Red)
Projection:          ■ #94a3b8  (Gray - dashed)
```

---

## 📐 COMPONENT COLOR PATTERNS

### Buttons

```tsx
// Primary Button
bg-primary hover:bg-primary-hover text-white
■ #0d9488 → ■ #0f766e (hover)

// Secondary Button  
bg-secondary hover:bg-secondary-hover text-white
■ #fbbf24 → ■ #f59e0b (hover)

// Success Button
bg-success hover:bg-success-dark text-white
■ #10b981 → ■ #059669 (hover)

// Danger Button
bg-error hover:bg-error-dark text-white
■ #ef4444 → ■ #dc2626 (hover)

// Outline Button
border-2 border-primary text-primary hover:bg-primary hover:text-white
```

### Status Badges

```tsx
// Active/Verified
bg-success text-white
■ #10b981

// Pending/Draft
bg-warning text-white
■ #f59e0b

// Rejected/Inactive
bg-error text-white
■ #ef4444

// Completed/Paid
bg-info text-white
■ #3b82f6

// Draft (alternate)
bg-amber-500 text-white
■ #f59e0b
```

### Form Elements

```tsx
// Default Input
border-gray-300 dark:border-slate-700 focus:border-primary focus:ring-primary

// Error Input
border-error focus:border-error focus:ring-error

// Success Input
border-success focus:border-success focus:ring-success
```

### Cards & Surfaces

```tsx
// Light Theme Card
bg-white border-gray-200 hover:border-primary

// Dark Theme Card
bg-slate-900/40 border-slate-700 hover:border-teal-500
backdrop-filter: blur(16px)

// System Theme Card
bg-[#0a2f1a]/50 border-[#0d9488]/40
backdrop-filter: blur(16px)
```

---

## 🎭 GLASSMORPHISM EFFECTS

### Header/Navigation
```css
Light:  background: linear-gradient(rgba(242,240,239,0.8), rgba(242,240,239,0.5))
        backdrop-filter: blur(12px)
        border-bottom: rgba(229,231,235,0.7)

Dark:   background: linear-gradient(rgba(0,0,0,0.8), rgba(15,23,42,0.5))
        backdrop-filter: blur(12px)
        border-bottom: rgba(51,65,85,0.6)

System: background: linear-gradient(rgba(0,20,5,0.9), rgba(10,47,26,0.5))
        backdrop-filter: blur(12px)
        border-bottom: rgba(13,148,136,0.4)
```

### Cards with Glow
```css
Dark:   box-shadow: 0 0 0 1px rgba(20,184,166,0.2),
                    0 8px 32px 0 rgba(0,0,0,0.3)
        
System: box-shadow: 0 0 0 1px rgba(13,148,136,0.3),
                    0 8px 32px 0 rgba(13,148,136,0.15)
```

---

## 🔍 ACCESSIBILITY

### Color Contrast Ratios (WCAG AA)

✅ **Passes WCAG AA:**
- #0d9488 on white: 4.8:1 (Normal text ✅)
- #0F172A on white: 14.3:1 (Large & small text ✅)
- white on #0d9488: 4.8:1 (Normal text ✅)

⚠️ **Needs Review:**
- #fbbf24 on white: 1.9:1 (Fails - needs darker shade)
- #86efac on #001405: 3.5:1 (Borderline - use for large text only)

**Recommendation:** When using amber/yellow, use darker shades (#f59e0b or #d97706) for text on light backgrounds.

---

## 📱 USAGE EXAMPLES

### Status Indicator
```tsx
// Homeowner verification status
{verified ? (
  <span className="text-success">✓ Verified</span>
) : (
  <span className="text-gray-400">○ Not Verified</span>
)}
```

### Lead Status
```tsx
const statusColors = {
  new: 'bg-info text-white',
  active: 'bg-success text-white',
  pending: 'bg-warning text-white',
  rejected: 'bg-error text-white',
  completed: 'bg-success text-white',
}

<span className={`px-2 py-1 rounded ${statusColors[status]}`}>
  {status}
</span>
```

### Interactive Button
```tsx
<button className="
  bg-primary hover:bg-primary-hover
  text-white font-semibold
  px-4 py-2 rounded-lg
  transition-all transform hover:scale-105
  focus:ring-2 focus:ring-primary focus:ring-offset-2
">
  Get Quote
</button>
```

### Form Input with Validation
```tsx
<input
  className={cn(
    "w-full px-4 py-2 rounded-lg border-2",
    "focus:outline-none focus:ring-2",
    error 
      ? "border-error focus:border-error focus:ring-error"
      : "border-gray-300 focus:border-primary focus:ring-primary"
  )}
/>
```

---

## 🎨 DESIGN SYSTEM TOKENS (Proposed)

```typescript
// After refactoring, use these semantic names:

// Surfaces
surface-primary     // Main backgrounds
surface-secondary   // Cards, containers
surface-tertiary    // Nested elements
surface-hover       // Hover states

// Text
text-primary        // Main content
text-secondary      // Supporting text
text-muted          // Disabled/placeholder
text-link           // Links

// Borders
border-light        // Subtle dividers
border-medium       // Default borders
border-heavy        // Emphasized borders

// Interactive
interactive-primary     // Main CTAs
interactive-secondary   // Secondary actions
interactive-hover       // Hover states
interactive-active      // Active/pressed states
```

---

## 🔄 BEFORE & AFTER COMPARISON

### ❌ Current (Inconsistent)
```tsx
// Different files use different approaches:
className="bg-teal-600"
className="bg-[#0d9488]"
style={{ backgroundColor: '#0d9488' }}
className="bg-primary"
```

### ✅ After Refactoring (Consistent)
```tsx
// All files use tokens:
className="bg-primary"           // From Tailwind config
className="bg-surface-primary"   // From CSS variables
className={colors.button.primary} // From theme hook
```

---

## 🛠️ QUICK REFERENCE

### Most Common Color Classes
```
Backgrounds:
- bg-primary (teal)
- bg-secondary (amber)
- bg-success (green)
- bg-error (red)
- bg-white dark:bg-slate-900

Text:
- text-primary (teal)
- text-slate-900 dark:text-white
- text-slate-600 dark:text-slate-400
- text-success
- text-error

Borders:
- border-primary
- border-gray-200 dark:border-slate-700
- border-success
- border-error

Hover States:
- hover:bg-primary-hover
- hover:text-primary
- hover:border-primary
```

---

## 📊 COLOR FREQUENCY ANALYSIS

Based on audit findings:

| Color Family | Usage Count | Priority |
|--------------|-------------|----------|
| Teal (#0d9488) | 150+ | Critical |
| Slate/Gray | 200+ | Critical |
| Amber (#fbbf24) | 30+ | High |
| Green (#10b981) | 40+ | High |
| Red (#ef4444) | 25+ | Medium |
| Blue (#3b82f6) | 15+ | Medium |

---

## 🎯 DESIGNER HANDOFF NOTES

### When Changing Colors:

1. **Brand Color Change:**
   - Update `colorTokens.brand.primary` in `colors.ts`
   - All buttons, links, accents update automatically
   - Test contrast ratio (aim for 4.5:1 minimum)

2. **Theme Background Change:**
   - Update CSS variables in `globals.css`
   - Test all 3 themes (light/dark/system)
   - Check glassmorphism effects

3. **Status Color Change:**
   - Update `colorTokens.semantic` in `colors.ts`
   - All badges, alerts update automatically
   - Verify icon colors match

### Design Tokens to Maintain:
- Primary color and 2 shades (light/dark)
- Secondary color and 2 shades
- 4 semantic colors (success/warning/error/info)
- 3 theme variations (light/dark/system)

---

**Last Updated:** January 27, 2025  
**Version:** 1.0  
**See Also:** THEME-AUDIT-REPORT-2025-01-27.md
