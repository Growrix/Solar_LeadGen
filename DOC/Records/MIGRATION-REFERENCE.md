# Component Migration Reference Guide

**Last Updated**: November 3, 2025  
**Purpose**: Quick reference for migrating components to neumorphic design system  
**Status**: Active - Use this for ALL future migrations

---

## 🎯 Quick Reference: Migrated Components

Use these as **templates** when migrating new components. Always open and study these files before starting:

### 1. Navigation Components

#### TopBar.tsx ✅
**Location**: `src/components/TopBar.tsx`  
**What to Learn**:
- Neumorphic glass effect: `glass-top-bar` class
- Button component usage for navigation actions
- Responsive design patterns
- Minimal color usage (mostly semantic tokens)

**Key Patterns**:
```tsx
// Neumorphic navigation bar
<div className="glass-top-bar text-sm py-2 transition-colors duration-300">
  <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
    Action
  </button>
</div>
```

#### HeaderMenu.tsx ✅
**Location**: `src/components/HeaderMenu.tsx`  
**What to Learn**:
- Rounded neumorphic bar: `bg-background rounded-full shadow-neu-outset`
- ThemeSwitcher component integration
- Button component for Login/Signup
- Logo and branding patterns

**Key Patterns**:
```tsx
import Button from '@/components/ui/button';
import { ThemeSwitcher } from './ThemeSwitcher';

// Rounded neumorphic container
<div className="bg-background rounded-full shadow-neu-outset px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 hover:shadow-neu-outset-lg">
  <Button variant="primary" size="sm" onClick={onLoginClick}>
    Login
  </Button>
  <ThemeSwitcher theme={theme} setTheme={setTheme} />
</div>
```

---

### 2. Authentication Modals

#### InstallerSignupModal.tsx ✅
**Location**: `src/components/InstallerSignupModal.tsx`  
**What to Learn**:
- Multi-step form structure
- `.form-input` class usage for ALL inputs
- Button component for form actions (Next, Back, Submit)
- Modal container: `.theme-card` class
- Social auth buttons (Google, Apple)
- Form validation patterns

**Key Patterns**:
```tsx
import Button from '@/components/ui/button';

// Modal container
<div className="theme-card w-full max-w-md p-8">
  {/* Form step */}
  <input 
    className="form-input w-full pl-11 pr-4 py-3" 
    type="email" 
    placeholder="Email"
  />
  
  {/* Action buttons */}
  <Button variant="primary" className="w-full py-3" onClick={handleNext}>
    Next
  </Button>
  <Button variant="secondary" onClick={handleBack}>
    Back
  </Button>
</div>
```

#### HomeownerSignInModal.tsx ✅
**Location**: `src/components/HomeownerSignInModal.tsx`  
**What to Learn**:
- Complete auth modal pattern
- Password input with show/hide toggle
- Social auth buttons (Google, Apple)
- Success/error message display
- "Forgot password" link styling
- Remember me checkbox

**Key Patterns**:
```tsx
// Password input with toggle
<div className="relative">
  <input 
    className="form-input w-full pl-11 pr-12 py-3" 
    type={showPassword ? 'text' : 'password'}
  />
  <button 
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>

// Forgot password link
<button className="text-sm text-primary hover:text-primary/90 transition-colors">
  Forgot password?
</button>

// Social auth buttons
<Button variant="secondary" className="w-full py-3 flex items-center justify-center">
  <GoogleIcon />
  <span>Continue with Google</span>
</Button>
```

#### HomeownerSignupModal.tsx ✅
**Location**: `src/components/HomeownerSignupModal.tsx`  
**What to Learn**:
- Multi-field signup form
- All inputs use `.form-input` class
- Password confirmation pattern
- Phone number input
- Terms and conditions checkbox

---

### 3. Content Sections

#### Hero.tsx ✅
**Location**: `src/components/Hero.tsx`  
**What to Learn**:
- Responsive typography using semantic classes
- Animation preservation (fade-in-up)
- CTA button with Button component
- Background gradient patterns
- Stats/features display

**Key Patterns**:
```tsx
// Hero section container
<section className="hero-section relative flex items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
  {/* Heading with semantic tokens */}
  <h1 className="text-heading-1 font-bold text-foreground mb-6">
    Your Headline
  </h1>
  
  {/* Subheading */}
  <p className="text-xl text-muted-foreground mb-8">
    Your subheading
  </p>
  
  {/* CTA button */}
  <Button variant="primary" size="lg" onClick={handleCTA}>
    Get Started
  </Button>
</section>
```

---

## 🎨 Design System Quick Reference

### Color Classes (Use These, NOT Hardcoded Colors)

```tsx
// Backgrounds
bg-background        // Main page background
bg-surface          // Cards, modals, elevated surfaces
bg-surface-hover    // Hover state for bg-surface

// Text
text-foreground           // Primary text
text-muted-foreground     // Secondary text, labels
text-subtle               // Placeholders, disabled text

// Accent (Use Sparingly - 10% of UI)
bg-primary                // Primary CTA buttons
text-primary              // Links, active states
border-primary            // Focus rings, active borders
hover:bg-primary/90       // Button hover state

// Borders
border-border            // Default borders
border-border/50         // Subtle borders (50% opacity)

// Status Colors
text-success             // Success messages (green)
text-destructive         // Error messages (red)
text-warning             // Warning messages (yellow)
```

### Component Classes (Central Classes from globals.css)

```tsx
// Form input (ALL inputs MUST use this)
<input className="form-input w-full pl-11 pr-4 py-3" />

// Modal/Card container
<div className="theme-card p-8">...</div>

// Glass effect (navigation bars)
<header className="glass-header">...</header>
<div className="glass-top-bar">...</div>

// Neumorphic shadows
className="shadow-neu-outset"         // Raised effect
className="shadow-neu-outset-lg"      // Large raised effect
className="shadow-neu-inset"          // Pressed/embossed effect
className="shadow-inset-md"           // Medium inset (for inputs)
```

### Button Component (ALWAYS Use This)

```tsx
import Button from '@/components/ui/button';

// Primary CTA
<Button variant="primary" size="lg" onClick={handleClick}>
  Primary Action
</Button>

// Secondary action
<Button variant="secondary" onClick={handleClick}>
  Secondary Action
</Button>

// Small button
<Button variant="primary" size="sm">
  Small
</Button>

// With custom classes
<Button variant="primary" className="w-full py-3">
  Full Width
</Button>
```

---

## ✅ Migration Checklist (Use for Every Component)

### Before Starting
- [ ] Read `DOC/DESIGN-SYSTEM-SOT.md` - Migration Principles section
- [ ] Open reference components (HeaderMenu, InstallerSignupModal, HomeownerSignInModal)
- [ ] Run system health check (verify .form-input, .theme-card exist in globals.css)
- [ ] Create audit report for component logic (preserve hooks, handlers, validation)

### During Migration
- [ ] Replace ALL `<button>` with `<Button>` component
- [ ] Replace ALL inputs with `.form-input` class
- [ ] Replace ALL modal containers with `.theme-card` class
- [ ] Remove ALL `dark:` prefixes (themes handle automatically)
- [ ] Replace hardcoded colors with semantic tokens
- [ ] Preserve ALL logic (hooks, handlers, API calls, validation)
- [ ] Test in all 3 themes (Dark, Light, Purple)

### After Migration
- [ ] Run verification: `Select-String -Path "ComponentFile.tsx" -Pattern "dark:"`  (Should be ZERO matches)
- [ ] Run verification: `Select-String -Path "ComponentFile.tsx" -Pattern "<button"`  (Should be ZERO matches)
- [ ] Run verification: `Select-String -Path "ComponentFile.tsx" -Pattern "bg-(slate|gray|zinc)-"`  (Should be ZERO matches)
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Visual test: All 3 themes look correct
- [ ] Functional test: All interactions work (forms submit, buttons click, modals open/close)
- [ ] Update tasks.md: Mark component as ✅ Complete

---

## 🚨 Common Mistakes to Avoid

### 1. Mixing Input Approaches ❌
```tsx
// ❌ WRONG - Some use form-input, some use inline classes
<input className="form-input w-full" />
<input className="w-full bg-surface border border-border rounded-xl" />

// ✅ CORRECT - ALL use form-input
<input className="form-input w-full pl-11 pr-4 py-3" />
<input className="form-input w-full pl-4 pr-4 py-3" />
```

### 2. Not Using Button Component ❌
```tsx
// ❌ WRONG - Native button element
<button className="bg-primary text-white px-6 py-3 rounded-xl">
  Submit
</button>

// ✅ CORRECT - Button component
<Button variant="primary" className="px-6 py-3">
  Submit
</Button>
```

### 3. Using dark: Prefixes ❌
```tsx
// ❌ WRONG - Manual dark mode classes
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">

// ✅ CORRECT - Semantic tokens (automatic theme switching)
<div className="bg-surface text-foreground">
```

### 4. Hardcoding Colors ❌
```tsx
// ❌ WRONG - Hardcoded Tailwind colors
<p className="text-slate-600">Secondary text</p>
<div className="bg-gray-100 border-gray-300">

// ✅ CORRECT - Semantic tokens
<p className="text-muted-foreground">Secondary text</p>
<div className="bg-surface border-border">
```

### 5. Modifying Logic During UI Migration ❌
```tsx
// ❌ WRONG - Changed validation logic
const handleSubmit = () => {
  if (email && password) {  // CHANGED: Was checking length > 0
    // ...
  }
};

// ✅ CORRECT - Preserved exact logic
const handleSubmit = () => {
  if (email.trim() !== '' && password.length >= 8) {  // PRESERVED
    // ...
  }
};
```

---

## 📚 Additional Resources

- **Design System SOT**: `DOC/DESIGN-SYSTEM-SOT.md` - Complete design system reference
- **Tasks.md**: `specs/006-component-by-component/tasks.md` - Migration task list and validation checklists
- **Multi-Theme System**: `DOC/MULTI-THEME-SYSTEM.md` - Theme system documentation
- **Color Palette Guide**: `DOC/COLOR-PALETTE-GUIDE.md` - Semantic color token usage

---

## 🎯 Next Components to Migrate (Phase 4 Completion)

### NewQuoteRequestModal.tsx
**Priority**: High  
**Reference**: HomeownerSignupModal.tsx (similar multi-field form)  
**Key Tasks**:
- Replace all inputs with `.form-input` class
- Replace submit button with Button component
- Use `.theme-card` for modal container
- Test quote request flow

### MessagingModal.tsx
**Priority**: High  
**Reference**: HomeownerSignInModal.tsx (modal structure)  
**Key Tasks**:
- Replace message input with `.form-input` class
- Replace send button with Button component
- Update chat bubble styling with semantic tokens
- Test messaging flow

---

**Remember**: Migration is about **UI consistency**, not logic changes. Preserve all functionality, only update visual styling.
