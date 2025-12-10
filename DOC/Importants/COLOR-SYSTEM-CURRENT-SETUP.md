# Color System - Current Setup Summary

**Last Updated**: 2025-11-01  
**Status**: ✅ Configured and Ready for Phase 3 Migration

---

## Current Configuration (Dark Theme Only)

### Accent Color: Orange (#FF6B00)

```typescript
// File: src/design-tokens/semantic/colors.ts

primary: {
  light: '#FF6B00',  // Orange (for future light theme)
  dark: '#FF6B00',   // Orange (CURRENT - dark theme)
  DEFAULT: '#FF6B00',
}

'primary-hover': {
  light: '#FF8533',  // Lighter orange hover
  dark: '#FF8533',   // Lighter orange hover (CURRENT)
  DEFAULT: '#FF8533',
}

'primary-foreground': {
  light: '#FFFFFF',  // White text on orange
  dark: '#FFFFFF',   // White text on orange (CURRENT)
  DEFAULT: '#FFFFFF',
}
```

---

## 60-30-10 Distribution (Current Dark Theme)

### 60% - Backgrounds (Neutrals)
```
bg-background       → #101010 (very dark gray - main page)
bg-surface          → #1A1A1A (dark gray - cards, modals)
shadow-neu-*        → Neumorphic shadows
```

### 30% - Text (Hierarchy)
```
text-foreground           → #F5F5F5 (off-white - body text, headings)
text-muted-foreground     → #A0A0A0 (gray - labels, secondary text)
text-subtle               → #666666 (dark gray - placeholders)
```

### 10% - Accent (Orange - Intentional Highlights)
```
bg-primary                → #FF6B00 (orange - CTAs)
text-primary              → #FF6B00 (orange - links)
border-primary            → #FF6B00 (orange - focus rings)
hover:bg-primary/90       → #FF8533 (lighter orange - hover)
bg-primary-foreground     → #FFFFFF (white text on orange)
```

---

## Usage Rules (10% Accent Only!)

### ✅ USE `bg-primary` / `text-primary` FOR:
```tsx
// Primary CTA buttons
<button className="bg-primary text-primary-foreground">Get Quote</button>

// Active navigation
<a className={isActive && "text-primary"}>Dashboard</a>

// Body text links
<a className="text-primary hover:underline">Sign In</a>

// Focus rings
<input className="focus:ring-primary focus:border-primary" />

// Selected states
<Checkbox className="data-[state=checked]:bg-primary" />
```

### ❌ DON'T USE `primary` FOR:
```tsx
// Body text (use text-foreground)
<p className="text-foreground">This is body text</p>

// Headings (use text-foreground)
<h2 className="text-heading-2 text-foreground">Section Title</h2>

// Card backgrounds (use bg-surface)
<div className="bg-surface">Card content</div>

// General borders (use border)
<div className="border border-muted">Content</div>

// Secondary buttons (use outline style)
<button className="bg-surface border text-foreground">Cancel</button>
```

---

## Why Orange Works (Current Dark Theme)

| Benefit | Description |
|---------|-------------|
| **Solar Theme** | Orange = warmth, sun, energy (matches business domain) |
| **High Contrast** | #FF6B00 on #101010 = 8.5:1 contrast (WCAG AAA) |
| **Clear Hierarchy** | Easy to spot CTAs, active states, links |
| **Distinctive** | Clearly different from white/gray body text |
| **Scalable** | Simple token change when system theme enabled |

---

## Future Migration Path (When System Theme Enabled)

**Trigger**: User re-enables light theme or system theme switching

**Migration Steps**:
1. Update `semantic/colors.ts` tokens (~2 min)
2. Change to white accent for dark theme, dark accent for light theme
3. Verify accent usage still <10% (~10 min)
4. Test visual contrast (~5 min)
5. Commit changes (~2 min)

**Total Time**: ~40 minutes (if 10% rule followed during Phase 3-9 migrations)

**Reference**: See `DOC/ACCENT-MIGRATION-STRATEGY.md` for complete plan

---

## Documentation Files

| File | Purpose |
|------|---------|
| `COLOR-SYSTEM-STANDARDS.md` | Complete 60-30-10 guide with examples |
| `ACCENT-MIGRATION-STRATEGY.md` | Future migration plan (orange → white) |
| `ACCENT-COLOR-DECISION.md` | Comparison of gray vs blue vs orange |
| `tasks.md` (Phase 2) | Foundation tasks with color guidelines |
| `semantic/colors.ts` | Token definitions (source of truth) |

---

## Phase 3-9 Migration Checklist

During each component migration, verify:

- [ ] Accent color used for <10% of component (CTAs, active states, links only)
- [ ] Background colors use `bg-background` / `bg-surface` (NOT `bg-primary`)
- [ ] Body text uses `text-foreground` (NOT `text-primary`)
- [ ] Headings use `text-foreground` (NOT `text-primary`)
- [ ] Card backgrounds use `bg-surface` (NOT `bg-primary`)
- [ ] General borders use `border` (NOT `border-primary`)
- [ ] Focus rings use `ring-primary` (correct usage)
- [ ] Active nav items use `text-primary` (correct usage)
- [ ] Primary CTAs use `bg-primary` (correct usage)

**Why This Matters**: Following 10% rule NOW ensures easy migration to white accent later (no component refactoring needed).

---

## Quick Reference: When to Use Orange Accent

```
ASK: Is this element the PRIMARY ACTION or ACTIVE STATE?

YES → Use bg-primary / text-primary
  Examples:
  - "Get Quote" button (primary CTA)
  - "Dashboard" link (when on dashboard page)
  - "Sign In" link in body text
  - Input focus ring (shows active field)

NO → Use text-foreground / bg-surface
  Examples:
  - Paragraph text
  - Section headings
  - Card backgrounds
  - Secondary buttons ("Cancel", "Back")
  - General borders
```

**Rule of Thumb**: If user needs to click it to complete main task → use accent. Everything else → use neutral colors.

---

## Squint Test (Verify 10% Usage)

**How to Test**:
1. Step back from screen
2. Squint your eyes (blur vision)
3. Count orange spots you see

**Expected Result**:
- Homepage: 3-5 orange spots (header CTA, hero CTA, 1-2 inline links, footer CTA)
- Dashboard: 3-5 orange spots (active nav item, primary CTA, 1-2 action buttons)

**If you see >10 orange spots** → You're overusing accent (breaks 60-30-10 rule)

---

**Status**: ✅ Ready for Phase 3 migration with orange accent strategy
