# Migration Principle: 100% Clean Replacement Policy

**Feature 005: Comprehensive CSS Class Audit and Standardization**  
**Policy**: Industry Standard Requirement  
**Status**: Enforced via verification tasks and pre-commit hooks

---

## 🎯 Core Principle

**Every component migration MUST be a complete replacement. NO hybrid old+new class patterns allowed.**

This is NOT about being overly strict—this is **industry standard** followed by all major design systems.

---

## ❌ What NOT to Do (Hybrid Patterns)

### Example 1: Mixing Old + New in Same Component
```tsx
// ❌ FORBIDDEN - Hybrid pattern
<Button className="bg-teal-600 hover:bg-primary text-white">
  Submit
</Button>
```
**Problem**: Mixes old hardcoded color (`bg-teal-600`) with new semantic token (`hover:bg-primary`). Which is correct? Confusing for developers.

### Example 2: Partial Component Migration
```tsx
// ❌ FORBIDDEN - Some buttons updated, some not
// File: src/app/auth/page.tsx
<Button className="bg-primary">Login</Button>        // ✅ New
<Button className="bg-teal-600">Register</Button>    // ❌ Old (inconsistent)
```
**Problem**: User sees inconsistent UI. Some buttons follow design system, others don't.

### Example 3: Leaving "Just a Few" Old Classes
```tsx
// ❌ FORBIDDEN - "I only left 3 old classes, not a big deal"
<Card className="p-6 shadow-sm">           // ✅ New
  <h2 className="text-2xl font-bold">      // ❌ Old (raw Tailwind, should use text-heading-2)
    Solar Savings
  </h2>
  <p className="text-body text-muted-foreground">  // ✅ New
    Calculate your potential savings
  </p>
</Card>
```
**Problem**: Technical debt accumulates. These "just a few" classes multiply across components.

---

## ✅ What TO Do (Clean Replacement)

### Example 1: Complete Button Migration
```tsx
// ✅ CORRECT - Complete replacement
// Before migration:
<Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded">
  Submit
</Button>

// After migration:
<Button variant="default" size="default">
  Submit
</Button>
// Uses: bg-primary, hover:bg-primary/90, text-primary-foreground (from shadcn Button)
```

### Example 2: Complete Form Migration
```tsx
// ✅ CORRECT - All inputs migrated together
// Before:
<input className="border-gray-300 rounded px-3 py-2" />
<input className="border-gray-300 rounded px-3 py-2" />

// After (ALL at once):
<Input className="border-border" />
<Input className="border-border" />
```

### Example 3: Complete Typography Migration
```tsx
// ✅ CORRECT - All headings use semantic tokens
<h1 className="text-heading-1 text-foreground">Solar Match</h1>
<h2 className="text-heading-2 text-foreground">Get Started</h2>
<p className="text-body text-muted-foreground">Find installers near you</p>
```

---

## 🏢 Industry Standard Validation

### Material UI Approach
**Migration Guide**: "Replace ALL instances of old components. Mixing v4 and v5 components creates conflicts."

### Chakra UI Approach  
**Docs**: "Complete migration to v2 theme tokens. Partial migrations lead to inconsistent theming."

### Ant Design Approach
**Best Practice**: "Upgrade all components to latest version. Mixed versions cause unpredictable behavior."

### shadcn/ui Approach
**Philosophy**: "Copy-paste components and customize. Don't mix with other component libraries."

---

## 📋 Verification Process

Each migration phase includes **CRITICAL VERIFICATION** task:

### Phase 6 - Button Migration (T064a)
```bash
# Search for ANY remaining hardcoded button classes
grep -r "bg-teal-" src/components/**/*.tsx
grep -r "bg-red-500" src/components/**/*.tsx

# Result MUST be: NO MATCHES
# If matches found: Migration INCOMPLETE
```

### Phase 8 - Typography Migration (T129a)
```bash
# Search for raw Tailwind font classes
grep -r "text-2xl\|text-4xl\|font-bold" src/components/**/*.tsx

# Result MUST be: NO MATCHES (except in token definitions)
```

### Pre-Commit Hook
```bash
# Blocks commits with forbidden classes
npm run validate-classnames

# Checks:
# - No bg-teal-*, bg-blue-*, bg-red-500
# - No text-2xl, text-xl (use text-heading-*)
# - No transition-all
# - No dark:text-white (use text-foreground)
```

---

## 🎯 Enforcement Timeline

| Phase | Verification Task | What Gets Blocked |
|-------|------------------|-------------------|
| **Quick Wins** ✅ | Completed (97 replacements) | bg-teal-*, text-red-500, border-gray-300 |
| **Phase 6 - Buttons** | T064a | bg-teal-*, hover:bg-teal-*, custom button classes |
| **Phase 7 - Icons** | T075a | h-5 w-5 hardcoded, text-teal-600 on icons |
| **Phase 8 - Forms** | T089a | border-gray-300, bg-white, custom input styles |
| **Phase 9 - Cards** | T100a | p-4/p-6 hardcoded, shadow-md custom, border-gray-200 |
| **Phase 10 - Modals** | T112a | bg-black/70 backdrop, z-40/z-50 hardcoded |
| **Phase 11 - Typography** | T129a | text-2xl, font-bold on headings, dark:text-white |

---

## 🔧 How to Fix Violations

### Violation Found: `bg-teal-600` in Button
```tsx
// ❌ Current (violation)
<Button className="bg-teal-600 hover:bg-teal-700">Submit</Button>

// ✅ Fix: Use shadcn Button variant
<Button variant="default">Submit</Button>
// OR custom class with semantic token
<Button className="bg-primary hover:bg-primary/90">Submit</Button>
```

### Violation Found: `text-2xl font-bold` in Heading
```tsx
// ❌ Current (violation)
<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
  Solar Savings
</h2>

// ✅ Fix: Use typography token
<h2 className="text-heading-2 text-foreground">
  Solar Savings
</h2>
```

### Violation Found: `border-gray-300` in Form
```tsx
// ❌ Current (violation)
<input className="border-gray-300 rounded px-3 py-2" />

// ✅ Fix: Use shadcn Input
<Input className="border-border" />
```

---

## 📊 Success Criteria

**Migration phase is COMPLETE when**:
1. ✅ All components in scope use shadcn/ui or semantic tokens
2. ✅ Verification task passes (zero matches for old classes)
3. ✅ Pre-commit hook passes
4. ✅ ESLint validation passes
5. ✅ TypeScript compiles without errors
6. ✅ Storybook stories reflect new components
7. ✅ Visual regression tests pass (Chromatic)

**Migration phase is INCOMPLETE if**:
- ❌ ANY old hardcoded classes remain
- ❌ Verification grep finds matches
- ❌ Some components migrated, others not
- ❌ Hybrid patterns exist (mixing old+new)

---

## 💬 Common Questions

### Q: "Can I migrate just the homepage first, then other pages later?"
**A**: ❌ No. Migrate by COMPONENT TYPE (all buttons, then all forms), NOT by page. This ensures consistency across the app.

### Q: "I found one edge case button that's hard to migrate. Can I leave it for now?"
**A**: ❌ No. Document it as an exception in `exceptions.json` with justification, but still migrate it. If truly impossible, wrap old component and migrate wrapper.

### Q: "What if the design system doesn't have a variant I need?"
**A**: ✅ Extend the design system properly:
1. Add variant to shadcn component (`tailwind.config.js`)
2. Use semantic token (e.g., `bg-accent` instead of `bg-purple-600`)
3. Document in naming-convention.md
4. Never use hardcoded value

### Q: "Can I use hardcoded classes for prototypes or temporary code?"
**A**: ✅ Yes, BUT:
1. Add comment: `{/* TODO: Replace with semantic token before prod */}`
2. Add to `exceptions.json` with approval date
3. Set reminder to fix before merging to main
4. Pre-commit hook will warn (don't bypass it)

---

## 🎉 Benefits of This Approach

1. **Maintainability**: Future developers know ALL buttons use shadcn Button. No "which pattern do I follow?" confusion.
2. **Consistency**: Users see consistent UI. All primary buttons look identical.
3. **Themability**: When adding light/brand themes, only need to update CSS variables. No hardcoded colors to hunt down.
4. **Scalability**: Easy to add new components—just follow the one established pattern.
5. **Performance**: CSS tree-shaking removes unused classes. Hybrid patterns prevent effective tree-shaking.
6. **Onboarding**: New developers learn one system (shadcn), not "old way vs new way."

---

**Bottom Line**: Complete replacement is MORE work upfront, but LESS work long-term. Industry standard for good reason.

**Policy Owner**: Development Team  
**Enforcement**: Automated (pre-commit hooks, verification tasks)  
**Exceptions**: Require documentation in `exceptions.json` with justification and approval
