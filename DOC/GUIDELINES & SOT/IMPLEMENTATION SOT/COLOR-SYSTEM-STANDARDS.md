# Color System Standards (60-30-10 Rule)

**Last Updated**: 2025-11-01  
**Status**: ✅ APPROVED - Orange accent for dark theme (scalable to white later)  
**Applies To**: All component migrations (Phase 3-9)

---

## 📊 The 60-30-10 Rule (Industry Standard)

### Dark Theme Distribution:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  60% BACKGROUNDS (#101010, #1A1A1A)                   │
│  ═══════════════════════════════════                  │
│  - Page background (bg-background)                    │
│  - Cards, modals, sections (bg-surface)               │
│  - Neumorphic shadows                                 │
│                                                       │
│    30% TEXT (#E5E5E5, #888888)                        │
│    ─────────────────────────                          │
│    - Headings, body text (text-foreground)            │
│    - Labels, secondary text (text-muted-foreground)   │
│    - Placeholders (text-subtle)                       │
│                                                       │
│      10% ACCENT (Orange #FF6B00) ← INTENTIONAL        │
│      ────────────────────────                         │
│      - CTAs ("Get Quote", "Sign Up")                  │
│      - Active navigation items                        │
│      - Links in body text                             │
│      - Focus rings, selected states                   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Why This Works**:
- **60% neutrals**: Creates calm, professional atmosphere
- **30% text**: Clear readability without overwhelming
- **10% accent**: Draws attention to ONLY the most important interactive elements

---

## 🎨 Color Token Reference

### 1. Backgrounds (60% of UI)

```typescript
bg-background        → #101010  // Main page background (darkest)
bg-surface           → #1A1A1A  // Cards, modals, elevated sections
shadow-neu-*         → Neumorphic shadows (subtle depth)
```

**Usage**:
```tsx
// ✅ CORRECT:
<div className="bg-background min-h-screen">
  <div className="bg-surface rounded-xl shadow-neu">
    <p>Content here</p>
  </div>
</div>
```

---

### 2. Text (30% of UI)

```typescript
text-foreground              → #E5E5E5  // Body text, headings (high contrast)
text-muted-foreground        → #888888  // Labels, secondary text (medium contrast)
text-subtle                  → #666666  // Placeholders, disabled (low contrast)
```

**Text Hierarchy**:
```tsx
// ✅ CORRECT:
<h1 className="text-heading-1 text-foreground">Solar Quotes</h1>
<p className="text-body text-foreground">Get instant pricing</p>
<label className="text-label text-muted-foreground">Email Address</label>
<input placeholder="Enter email..." className="placeholder:text-subtle" />
```

---

### 3. Accent Color (10% of UI - USE SPARINGLY!)

```typescript
bg-primary                   → #FF6B00  // Orange - CTA backgrounds, active states
text-primary                 → #FF6B00  // Orange - Links, active labels
border-primary               → #FF6B00  // Orange - Focus rings, active borders
hover:bg-primary/90          → #FF8533  // Hover effect (lighter orange)
bg-primary-foreground        → #FFFFFF  // White text ON orange background
```

**Accent Usage Rules**:

#### ✅ USE `bg-primary` / `text-primary` FOR:

```tsx
// Primary CTA Buttons
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Get Free Quote
</button>

// Active Navigation Item
<a className={cn(
  "text-muted-foreground hover:text-foreground",
  isActive && "text-primary font-medium"  // ← Only active page uses blue
)}>
  Dashboard
</a>

// Interactive Links in Body Text
<p className="text-foreground">
  Already have an account?{' '}
  <a className="text-primary hover:underline">Sign In</a>
</p>

// Focus Rings on Inputs
<input className="border focus:ring-2 focus:ring-primary focus:border-primary" />

// Selected States
<Checkbox checked={true} className="data-[state=checked]:bg-primary" />

// Status Badges (Important Only)
<Badge className="bg-primary text-primary-foreground">Live</Badge>
```

#### ❌ DON'T USE `primary` FOR:

```tsx
// ❌ WRONG: Body text (use text-foreground)
<p className="text-primary">This is body text</p>
// ✅ CORRECT:
<p className="text-foreground">This is body text</p>

// ❌ WRONG: Section headings (use text-foreground)
<h2 className="text-primary">Our Services</h2>
// ✅ CORRECT:
<h2 className="text-heading-2 text-foreground">Our Services</h2>

// ❌ WRONG: Card backgrounds (use bg-surface)
<div className="bg-primary">Card content</div>
// ✅ CORRECT:
<div className="bg-surface shadow-neu">Card content</div>

// ❌ WRONG: General borders (use border)
<div className="border-2 border-primary">Content</div>
// ✅ CORRECT:
<div className="border border-muted">Content</div>

// ❌ WRONG: Secondary buttons (use outline style)
<button className="bg-primary">Cancel</button>
// ✅ CORRECT:
<button className="bg-surface border border-muted text-foreground">Cancel</button>
```

---

## 🧪 Visual Test: Is Your Accent Usage Correct?

### Squint Test:
1. **Step back from screen** and squint your eyes
2. **Count the blue spots** - should be ~3-5 visible blue elements per screen
3. **If you see >10 blue elements** → You're overusing the accent (breaks 60-30-10 rule)

### Good Example (Homepage):
```
✅ Correct accent usage (10%):
- Top CTA button: "Get Quote" (blue)
- Active nav link: "Home" (blue)
- Footer CTA: "Sign Up" (blue)
- 2 inline links in body text (blue)
→ Total: 5 blue elements across entire page ✅
```

### Bad Example (Homepage):
```
❌ Overusing accent (40%):
- Every heading is blue (8 headings)
- Every button is blue (6 buttons)
- Every icon is blue (12 icons)
- All borders are blue (20 cards)
→ Total: 46 blue elements across entire page ❌
→ User's eye doesn't know where to focus!
```

---

## 🎨 Why Orange Accent (Current Strategy)?

### Problem with Gray/White Accent:
```typescript
// BEFORE (Gray accent - ❌ Bad):
primary: { dark: '#A0A0A0' }         // Medium gray accent
foreground: { dark: '#F5F5F5' }      // Off-white body text

// Visual Result:
Background: #101010 (black)
Body Text: #F5F5F5 (off-white) ← MORE prominent
Accent: #A0A0A0 (medium gray)  ← LESS prominent
→ Inverted hierarchy! User can't tell what's important.
```

### Solution with Orange Accent:
```typescript
// CURRENT (Orange accent - ✅ Good):
primary: { dark: '#FF6B00' }         // Orange accent
foreground: { dark: '#F5F5F5' }      // Off-white body text

// Visual Result:
Background: #101010 (black)
Body Text: #F5F5F5 (off-white) ← Readable, calm
Accent: #FF6B00 (orange)       ← POPS, draws attention
→ Clear hierarchy! User immediately sees CTAs.
```

**Why Orange Specifically?**
- ✅ **Solar Energy Theme**: Orange = warmth, sun, energy, activity
- ✅ **High Contrast**: Vibrant on dark backgrounds (WCAG AAA compliant)
- ✅ **Distinctive**: Clearly different from white body text
- ✅ **Scalable**: Easy token swap to white accent when system theme enabled later

**Future Migration Path**:
- **Current (Dark Only)**: Orange accent (#FF6B00)
- **Future (System Theme)**: White accent for dark theme, dark accent for light theme
- **Migration Time**: ~40 minutes (token change only)
- **See**: `DOC/ACCENT-MIGRATION-STRATEGY.md` for complete plan

---

## 📋 Implementation Checklist

Before starting Phase 3 (TopBar migration):

- [ ] **T004a**: Verify `src/design-tokens/semantic/colors.ts` has orange accent:
  ```typescript
  primary: {
    dark: '#FF6B00',  // Orange (current dark theme)
  }
  ```
  ✅ Already configured - no changes needed
- [ ] **T004b**: Audit existing components for accent overuse:
  - Search for `bg-primary` usage → Should be <5 per page
  - Search for `text-primary` usage → Should be <10 per page (links)
  - If found excessive usage, plan refactor to `text-foreground`
- [ ] **T004c**: Document accent usage in component checklist:
  - Add "Verify accent color used <10% (CTAs, active states, links only)" to each phase
- [ ] **Visual Test**: Build a sample page and do squint test (count blue spots)

---

## 🔗 References

- [60-30-10 Color Rule (Interior Design)](https://www.thespruce.com/timeless-color-rule-797859)
- [GitHub's Dark Theme Color System](https://primer.style/foundations/color)
- [Material Design Color System](https://m3.material.io/styles/color/roles)
- [Refactoring UI Book - Color Hierarchy](https://www.refactoringui.com/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Next Steps**:
1. Update `semantic/colors.ts` with blue accent (#0969da)
2. Run through Phase 2 foundation tasks (T004-T008)
3. Begin Phase 3 (TopBar + Installer Auth) with proper accent usage
