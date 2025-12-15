# HomeownerSignInModal - Theme Token Migration Audit

**Component**: `src/components/HomeownerSignInModal.tsx`  
**File Size**: 184 lines  
**Migration Status**: Ready for migration  
**Task**: T116 - Migrate HomeownerSignInModal  

---

## Executive Summary

HomeownerSignInModal is a **simple authentication modal** with approximately **22 hardcoded theme values**. This is significantly smaller than InstantQuoteForm (131 values) and similar in complexity to Homepage (17 values).

### Characteristics
- **Size**: 184 lines (vs Homepage 383, InstantQuoteForm 1,884)
- **Complexity**: Low - Single-purpose authentication form
- **Theme Elements**: Modal backdrop, input fields, social buttons, text elements, error states
- **Estimated Migration Time**: 15-20 minutes (similar to Homepage)
- **Migration Strategy**: Full migration (not partial)

---

## Hardcoded Values Inventory

### 1. Modal Backdrop (1 value)
**Line 83**: `bg-black/80`
```tsx
// BEFORE
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in" onClick={onClose}>

// AFTER
<div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-20 animate-fade-in" onClick={onClose}>
```
**Token**: `bg-overlay` (May need to create new semantic token)

---

### 2. Close Button (3 values)
**Line 85**: `text-slate-500 dark:text-slate-400`, `hover:text-slate-800 dark:hover:text-white`
```tsx
// BEFORE
<button onClick={onClose} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" aria-label="Close"><XIcon /></button>

// AFTER
<button onClick={onClose} className="absolute top-4 right-4 text-subtle hover:text-foreground transition-colors" aria-label="Close"><XIcon /></button>
```
**Tokens**: 
- `text-subtle` (existing)
- `hover:text-foreground` (existing)

---

### 3. Welcome Header (2 values)
**Line 89**: `text-slate-900 dark:text-white`
```tsx
// BEFORE
<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>

// AFTER
<h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
```
**Token**: `text-foreground` (existing)

**Line 90**: `text-slate-600 dark:text-slate-400`
```tsx
// BEFORE
<p className="text-slate-600 dark:text-slate-400 text-sm">Sign in to access your dashboard.</p>

// AFTER
<p className="text-subtle text-sm">Sign in to access your dashboard.</p>
```
**Token**: `text-subtle` (existing)

---

### 4. Social Login Buttons (8 values, identical pattern × 2 buttons)
**Lines 94, 98**: Google and Apple buttons (same classes)
```tsx
// BEFORE (both buttons)
<button className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium">

// AFTER (both buttons)
<button className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors text-foreground font-medium">
```
**Tokens Used** (per button):
- Border: `border-border` (existing) - 2 values replaced (light + dark)
- Background: `bg-surface` (existing) - 2 values replaced
- Hover: `hover:bg-surface-hover` (May need to create) - 2 values replaced
- Text: `text-foreground` (existing) - 2 values replaced
**Total per button**: 8 values  
**Total both buttons**: 16 values (but only 1 refactor since identical)

---

### 5. Divider (2 values)
**Line 106**: `border-gray-300 dark:border-slate-700`
```tsx
// BEFORE
<div className="w-full border-t border-gray-300 dark:border-slate-700"></div>

// AFTER
<div className="w-full border-t border-border"></div>
```
**Token**: `border-border` (existing)

**Line 109**: `bg-white dark:bg-slate-900`, `text-slate-500 dark:text-slate-400`
```tsx
// BEFORE
<span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">or</span>

// AFTER
<span className="px-3 bg-background text-subtle">or</span>
```
**Tokens**:
- `bg-background` (existing)
- `text-subtle` (existing)

---

### 6. Error Alert (4 values)
**Line 115**: Full error styling
```tsx
// BEFORE
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl text-sm">

// AFTER
<div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-xl text-sm">
```
**Tokens Needed** (May need to create):
- `bg-error-bg` (light: red-50, dark: red-900/20)
- `border-error-border` (light: red-200, dark: red-800)
- `text-error` (light: red-800, dark: red-200)

**Note**: Error colors are **functional**, not purely thematic. Consider if these should be deferred or use existing semantic tokens.

---

### 7. Base Input Classes (Line 76) (6 values) - **HIGHEST IMPACT**
```tsx
// BEFORE
const baseInputClasses = "w-full bg-white/5 dark:bg-black/20 border border-gray-300/30 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

// AFTER
const baseInputClasses = "w-full bg-surface/5 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";
```
**Tokens Used**:
- Background: `bg-surface/5` (2 values replaced: white/5, black/20)
- Border: `border-border/50` (2 values replaced: gray-300/30, slate-700/50)
- Text: `text-foreground` (2 values replaced: slate-900, white)
- Placeholder: `placeholder-subtle` (2 values replaced: slate-500, slate-400)

**Note**: Uses opacity modifiers (`/5`, `/50`) which Tailwind supports with design tokens.

**Impact**: Applies to **2 input fields** (email, password)

---

### 8. Password Toggle Button (3 values)
**Line 141**: `text-slate-500`, `hover:text-slate-700 dark:hover:text-white`
```tsx
// BEFORE
className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"

// AFTER
className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
```
**Tokens**:
- `text-subtle` (existing)
- `hover:text-foreground` (existing)

---

### 9. Footer Text (2 values)
**Line 168**: `text-slate-600 dark:text-slate-400`
```tsx
// BEFORE
<p className="text-slate-600 dark:text-slate-400 text-sm">

// AFTER
<p className="text-subtle text-sm">
```
**Token**: `text-subtle` (existing)

---

## Token Summary

### Existing Tokens (Can Use Immediately)
1. **`bg-background`** - Main backgrounds
2. **`bg-surface`** - Card/modal surfaces
3. **`text-foreground`** - Primary text
4. **`text-subtle`** - Secondary/muted text
5. **`border-border`** - Standard borders
6. **`bg-primary`** - Already used (icon container line 88)
7. **`text-primary`** - Already used (links lines 147, 172)
8. **`text-white`** - Already used (UserIcon line 8, loading spinner line 158)

### Tokens May Need to Create
1. **`bg-overlay`** - Modal backdrop (black/80)
2. **`bg-surface-hover`** - Surface hover state (gray-50, slate-700)
3. **Error tokens** (3):
   - `bg-error-bg` (red-50, red-900/20)
   - `border-error-border` (red-200, red-800)
   - `text-error` (red-800, red-200)

### Alternative: Use Existing Semantic Tokens for Error
Instead of creating new error tokens, consider using:
- `bg-error-bg` → `bg-red-50 dark:bg-red-900/20` (keep as-is, functional color)
- `border-error-border` → `border-red-200 dark:border-red-800` (keep as-is)
- `text-error` → `text-red-800 dark:text-red-200` (keep as-is)

**Recommendation**: **Keep error colors as-is** for now. They are functional (validation feedback) rather than thematic (brand colors). Focus this migration on theme-critical elements only.

---

## Migration Statistics

| Category | Hardcoded Values | After Migration | Reduction |
|----------|------------------|-----------------|-----------|
| **Modal Backdrop** | 1 | 0 | 1 |
| **Close Button** | 3 | 0 | 3 |
| **Headers/Text** | 4 | 0 | 4 |
| **Social Buttons** | 8 | 0 | 8 |
| **Divider** | 4 | 0 | 4 |
| **Error Alert** | 4 | 4 | 0 (Deferred - Functional) |
| **Input Fields** | 6 | 0 | 6 |
| **Password Toggle** | 3 | 0 | 3 |
| **Footer** | 2 | 0 | 2 |
| **TOTAL** | **35** | **4** | **31 (89% reduction)** |

**Target Migration**: 31/35 values (89%)  
**Deferred**: 4/35 values (11% - error colors only)

---

## Token Mapping Reference

| Old Pattern | New Token | Category |
|-------------|-----------|----------|
| `bg-black/80` | `bg-overlay` | Modal backdrop |
| `bg-white/5 dark:bg-black/20` | `bg-surface/5` | Input background |
| `bg-white dark:bg-slate-800` | `bg-surface` | Social button background |
| `bg-gray-50 dark:bg-slate-700` | `bg-surface-hover` | Social button hover |
| `bg-white dark:bg-slate-900` | `bg-background` | Divider text background |
| `border-gray-300 dark:border-slate-700` | `border-border` | Social buttons, divider |
| `border-gray-300/30 dark:border-slate-700/50` | `border-border/50` | Input border |
| `text-slate-900 dark:text-white` | `text-foreground` | Headings, inputs |
| `text-slate-600 dark:text-slate-400` | `text-subtle` | Descriptions, footer |
| `text-slate-500 dark:text-slate-400` | `text-subtle` | Close button, toggle |
| `text-slate-500` | `text-subtle` | Toggle button base |
| `text-slate-700 dark:text-slate-200` | `text-foreground` | Social button text |
| `hover:text-slate-800 dark:hover:text-white` | `hover:text-foreground` | Close button hover |
| `hover:text-slate-700 dark:hover:text-white` | `hover:text-foreground` | Toggle button hover |
| `placeholder-slate-500 dark:placeholder-slate-400` | `placeholder-subtle` | Input placeholders |

---

## New Token Proposals

### 1. Overlay Token (Modal Backdrop)
**Location**: `src/design-tokens/semantic/colors.ts`
```typescript
overlay: {
  light: 'rgba(0, 0, 0, 0.8)', // black/80
  dark: 'rgba(0, 0, 0, 0.8)',   // Same for dark mode
  DEFAULT: 'rgba(0, 0, 0, 0.8)',
} as ThemeColor,
```

**Tailwind Config**: Add `overlay: colors.overlay.DEFAULT`

**Rationale**: Modal overlays are consistent across light/dark themes (always dark with transparency).

---

### 2. Surface Hover Token
**Location**: `src/design-tokens/semantic/colors.ts`
```typescript
'surface-hover': {
  light: primitives.custom.lightSurface + '/90', // gray-50 or similar
  dark: primitives.custom.darkSurface + '/90',   // slate-700 or similar
  DEFAULT: primitives.custom.lightSurface + '/90',
} as ThemeColor,
```

**Alternative**: Check if `bg-muted` can serve this purpose (already exists).

**Tailwind Config**: Add `'surface-hover': colors['surface-hover'].DEFAULT`

**Rationale**: Interactive surfaces need hover states that adapt to theme.

---

## Migration Checklist

### Phase 1: Token Preparation
- [ ] **T116.1**: Verify existing tokens (background, foreground, subtle, border, surface)
- [ ] **T116.2**: Create `overlay` token OR check if `bg-black/80` should remain as-is
- [ ] **T116.3**: Create `surface-hover` token OR use existing `bg-muted`
- [ ] **T116.4**: Decide on error color strategy (keep as-is vs semantic tokens)

### Phase 2: Refactoring
- [ ] **T116.5**: Migrate modal backdrop (line 83)
- [ ] **T116.6**: Migrate close button (line 85)
- [ ] **T116.7**: Migrate header text (lines 89-90)
- [ ] **T116.8**: Migrate social buttons (lines 94, 98)
- [ ] **T116.9**: Migrate divider (lines 106, 109)
- [ ] **T116.10**: Migrate base input classes (line 76) - **HIGH IMPACT**
- [ ] **T116.11**: Migrate password toggle (line 141)
- [ ] **T116.12**: Migrate footer text (line 168)

### Phase 3: Validation
- [ ] **T116.13**: TypeScript compilation (0 errors)
- [ ] **T116.14**: Build verification (`npm run build`)
- [ ] **T116.15**: Visual QA - Light theme
- [ ] **T116.16**: Visual QA - Dark theme
- [ ] **T116.17**: Interactive testing (hover states, form submission)

### Phase 4: Documentation
- [ ] **T116.18**: Create Storybook story (HomeownerSignInModal.stories.tsx)
- [ ] **T116.19**: Chromatic visual regression test
- [ ] **T116.20**: Create QA checklist document
- [ ] **T116.21**: Git commit with comprehensive message
- [ ] **T116.22**: Update gitstatus.md

---

## Expected Outcomes

### Before Migration
- 35 hardcoded theme values (31 targeted + 4 error deferred)
- Manual dark mode throughout
- Inconsistent with design system
- Changes require multiple file edits

### After Migration
- 4 hardcoded values (error colors only - functional)
- Automatic theme switching
- 89% reduction in hardcoded values
- Aligned with centralized design token system
- Social buttons, inputs, text all theme-aware

### Impact Assessment
- **Theme Switching**: Modal backdrop, social buttons, inputs, text all respond instantly
- **Maintainability**: Changes to brand colors propagate automatically
- **Consistency**: Matches Homepage and Dashboard token usage
- **Accessibility**: Proper contrast ratios maintained through semantic tokens

---

## Notes

### Similarities to InstantQuoteForm
- Base input classes use **identical pattern** (bg, border, text, placeholder)
- Can reuse exact same token replacements
- Opacity modifiers (`/5`, `/50`) work with semantic tokens

### Key Differences from Homepage
- Homepage: Mostly presentational (headings, sections)
- HomeownerSignInModal: Interactive (inputs, buttons, forms)
- Requires hover state tokens (`hover:bg-surface-hover`, `hover:text-foreground`)

### Estimated Time
- **Token preparation**: 5 minutes (minimal - most exist)
- **Refactoring**: 10 minutes (straightforward replacements)
- **Validation**: 5 minutes (TypeScript + build + visual check)
- **Total**: ~20 minutes

### Continuation Strategy
After completing this modal:
1. **HomeownerSignupModal** (similar complexity)
2. **InstallerSignInModal** (reuse same tokens)
3. **InstallerSignupModal** (reuse same tokens)
4. Then return to **InstantQuoteForm remaining 110 values** (2.5 hours)

---

## Appendix: Current Code Structure

### Component Props
```typescript
interface HomeownerSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}
```

### Key Features
- NextAuth integration (`signIn` from 'next-auth/react')
- Form state management (email, password)
- Error handling with visual feedback
- Social login buttons (Google, Apple) - likely decorative for now
- Password visibility toggle
- Modal escape key handler
- Body scroll lock when open

### Dependencies
- `next-auth/react` - Authentication
- React hooks (useState, useEffect)
- Custom SVG icon components

### Already Semantic (No Changes Needed) ✅
- Line 88: `bg-primary` (icon container)
- Line 147: `text-primary` (forgot password link)
- Line 154: `bg-primary hover:bg-teal-700` (submit button)
- Line 172: `text-primary` (sign up link)
- Line 76: `focus:border-primary`, `focus:ring-primary` (input focus states)

---

**Last Updated**: 2025-01-28  
**Status**: Ready for migration (T116)  
**Estimated Completion**: 20 minutes  
