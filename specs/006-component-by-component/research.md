# Research: Component-by-Component Migration

**Feature**: Component-by-Component Migration to Neumorphic Design System  
**Date**: 2025-11-01  
**Status**: Complete

---

## Research Questions & Findings

### Q1: What is the safest order to migrate 15 components?

**Decision**: Priority-based order starting with highest-violation components

**Rationale**:
- InstantQuoteForm has 50+ violations (most impact for single migration)
- Hero component is high-visibility (home page, 6 violations, quick win)
- QuoteOptionsModal is user-flow critical (10 violations, medium complexity)
- SimplifiedQuoteForm has 35+ violations but lower priority (backup quote form)
- MobileSidebar has 20 violations (mobile UX consistency)
- Auth components last (5 remaining, follow established pattern from HomeownerSignInModal)

**Alternatives Considered**:
- ❌ Alphabetical order: Ignores impact and complexity
- ❌ Simplest first: Delays high-impact work
- ❌ All at once: Too risky, hard to review
- ✅ **Priority-based (chosen)**: Maximum impact, establishes pattern early

**Priority Order**:
1. InstantQuoteForm (P1) - 50+ violations, most critical
2. Hero (P2) - 6 violations, high visibility
3. QuoteOptionsModal (P3) - 10 violations, user flow
4. SimplifiedQuoteForm (P4) - 35+ violations
5. HomeownerMobileSidebarMenu (P5) - 20 violations
6. Auth components (P6) - 5 remaining components
7. Verification script (P7) - tooling

---

### Q2: How to ensure ZERO functional regressions during className changes?

**Decision**: Mandatory pre-migration logic audit with preservation checklist

**Rationale**:
- Constitution requires "zero hoping for the best" approach
- Changing className strings is low-risk, but complex components have:
  - Form validation logic (high risk)
  - State management (medium risk)
  - API calls (high risk)
  - Event handlers (medium risk)
  - Conditional rendering (low-medium risk)
- Document BEFORE touching code = reference during migration

**Implementation**:
- User Story 0: Create logic audit report for EACH component before migration
- Audit sections:
  1. State Management (useState, useReducer, useContext)
  2. Props Interface (what data component receives)
  3. Event Handlers (onClick, onChange, onSubmit, etc.)
  4. Side Effects (useEffect, API calls, cleanup)
  5. Conditional Logic (if/else, ternary, && chains)
  6. Form Validation (rules, error handling, submission)
  7. Navigation (router.push, Link components, redirects)
- **Logic Preservation Checklist**: For each item, mark ✅ Preserve or ❌ Replace

**Alternatives Considered**:
- ❌ No audit, just be careful: Too risky, "hoping for the best"
- ❌ Automated test generation: Overkill for className changes
- ❌ Code review only: Too late (after changes made)
- ✅ **Pre-migration audit (chosen)**: Proactive, documented, reviewable

---

### Q3: How to verify component fully migrated (no hardcoded classes remain)?

**Decision**: Automated verification script with pattern matching

**Rationale**:
- Manual review misses violations (human error)
- Grep search patterns well-established:
  - `bg-slate-*`, `text-slate-*` (hardcoded colors)
  - `dark:text-white`, `dark:bg-*` (manual dark mode)
  - `text-2xl`, `font-bold` (raw typography)
  - `px-6`, `py-4` (hardcoded spacing)
- Script returns exit code 0 (pass) or 1 (fail with line numbers)
- Gate: Component not marked "migrated" until verification passes

**Implementation**:
- User Story 7: Create verification script (PowerShell or Node.js)
- Search patterns:
  ```bash
  grep -E "(bg-slate-|text-slate-|bg-gray-|text-gray-)" $file
  grep -E "(dark:text-|dark:bg-|dark:border-)" $file
  grep -E "(text-[0-9]xl|font-bold|font-semibold)" $file
  grep -E "(px-[0-9]|py-[0-9]|p-[0-9])" $file
  ```
- Exit code 0 = PASSED (zero violations)
- Exit code 1 = FAILED (violations found, show line numbers)

**Alternatives Considered**:
- ❌ Manual review only: Error-prone
- ❌ ESLint rule: Overkill, doesn't catch all patterns
- ❌ Visual inspection: Misses non-visible classes
- ✅ **Automated script (chosen)**: Fast, reliable, automatable

---

### Q4: What if migration breaks component? How to rollback safely?

**Decision**: Atomic commits (one component per commit) + git revert capability

**Rationale**:
- Constitution requires "one component or feature per commit"
- Git revert works cleanly with atomic commits
- Easy to identify which commit broke which component
- Can cherry-pick successful migrations even if one fails

**Implementation**:
- Commit message format:
  ```
  refactor(InstantQuoteForm): migrate to design token system
  
  - Replaced 50 hardcoded bg-slate-* with bg-surface/bg-primary
  - Replaced 15 text-slate-* with text-foreground/text-muted
  - Removed all dark: manual classes
  - Migrated to AuthInput component
  
  Logic preserved:
  - Form validation unchanged
  - Quote calculation unchanged
  - API calls unchanged
  
  Validation:
  - Manual QA checklist passed
  - Verification script passed (0 violations)
  - TypeScript validation passed
  - Build passed
  
  Closes #006 (Component-by-Component - InstantQuoteForm)
  ```

**Rollback Process**:
1. Identify breaking commit: `git log --oneline`
2. Revert specific commit: `git revert <commit-hash>`
3. Fix issues in new commit
4. Re-apply migration with fixes

**Alternatives Considered**:
- ❌ Batch commits (multiple components): Hard to rollback selectively
- ❌ WIP commits: Pollutes history
- ❌ Squash everything: Loses audit trail
- ✅ **Atomic commits (chosen)**: Clean history, easy rollback

---

### Q5: How to track migration progress across 15 components?

**Decision**: Migration tracker markdown file with status table

**Rationale**:
- Clear visibility into what's done vs. remaining
- Shows compliance improvement over time (40% → 50% → ... → 95%)
- Documents violation reduction per component
- Easy to update after each migration

**Implementation**:
- Create `specs/006-component-by-component/migration-tracker.md`
- Table format:
  ```markdown
  | Component | Status | Violations Before | Violations After | Date | Commit |
  |-----------|--------|-------------------|------------------|------|--------|
  | InstantQuoteForm | ✅ Complete | 50 | 0 | 2025-11-02 | abc123 |
  | Hero | ✅ Complete | 6 | 0 | 2025-11-03 | def456 |
  | QuoteOptionsModal | 🚧 In Progress | 10 | - | - | - |
  | SimplifiedQuoteForm | ⏳ Not Started | 35 | - | - | - |
  ```
- Overall metrics:
  - Components migrated: X/15
  - Design system compliance: Y%
  - Total violations fixed: Z

**Alternatives Considered**:
- ❌ No tracking: Hard to see progress
- ❌ GitHub issues: Overhead for small migrations
- ❌ Spreadsheet: Not version controlled
- ✅ **Markdown tracker (chosen)**: Simple, version controlled, visible

---

### Q6: What design token patterns should be used for each component type?

**Decision**: Reference DOC/DESIGN-SYSTEM-SOT.md for all replacements

**Rationale**:
- SOT document already defines complete replacement maps
- Ensures consistency across all component migrations
- Reduces decision-making during migration (follow the standard)

**Common Patterns** (from DESIGN-SYSTEM-SOT.md):

| Old Pattern | New Pattern | Use Case |
|------------|-------------|----------|
| `bg-slate-700` | `bg-surface` | Card/modal backgrounds |
| `bg-slate-800` | `bg-primary` | Main app background |
| `text-slate-400` | `text-muted` | Secondary text |
| `text-white` | `text-foreground` | Primary text |
| `dark:text-white` | `text-foreground` | Remove (CSS variables handle theme) |
| `text-2xl font-bold` | `text-heading-2` | Section headings |
| `text-lg font-semibold` | `text-heading-3` | Subsection headings |
| `text-base` | `text-body` | Body text |
| `px-6 py-4` | `px-card-padding py-card-padding` | Card padding |
| `border-gray-300` | `border-border` | Borders |
| Inline SVG | Icon component | `<MailIcon className="w-5 h-5" />` |

**Form Components Special Case**:
- `baseInputClasses` string (175 chars) → `<AuthInput>` component
- `baseLabelClasses` → `AuthInput` label prop
- Error handling → `AuthInput` error prop
- Icons → `AuthInput` icon prop

**Alternatives Considered**:
- ❌ Invent new patterns: Inconsistent
- ❌ Mix approaches: Confusing
- ✅ **Follow SOT document (chosen)**: Consistent, documented

---

### Q7: How to handle mobile-responsive components during migration?

**Decision**: Maintain existing breakpoints, ensure tokens work at all sizes

**Rationale**:
- Constitution requires mobile-first approach (320px-640px base)
- Design tokens already responsive (e.g., `text-heading-2` scales with viewport)
- Migration shouldn't change responsive behavior (logic preservation)

**Testing Requirements** (from Manual QA Checklist):
- [ ] Mobile (320px): Layout appropriate, touch targets ≥ 44px
- [ ] Tablet (768px): Layout appropriate
- [ ] Desktop (1024px+): Layout appropriate
- [ ] No horizontal scroll at any breakpoint

**Special Cases**:
- **MobileSidebar**: Already mobile-specific (maintain drawer behavior)
- **Bottom Navigation**: Touch-friendly (maintain 56px height)
- **Forms**: Full-width mobile, constrained desktop (maintain pattern)

**Implementation**:
- Use Chrome DevTools responsive mode for testing
- Test at breakpoints: 320px, 375px, 768px, 1024px, 1440px
- Verify touch targets meet WCAG 2.5.5 (≥ 44×44px)

**Alternatives Considered**:
- ❌ Redesign responsive behavior: Out of scope
- ❌ Test only desktop: Miss mobile issues
- ✅ **Maintain + test all breakpoints (chosen)**: Safe, comprehensive

---

## Research Summary

**All Clarifications Resolved**: ✅

1. ✅ Migration order: Priority-based (highest violations first)
2. ✅ Regression prevention: Pre-migration logic audit mandatory
3. ✅ Verification: Automated script with pattern matching
4. ✅ Rollback strategy: Atomic commits + git revert
5. ✅ Progress tracking: Markdown migration tracker
6. ✅ Design patterns: Follow DESIGN-SYSTEM-SOT.md
7. ✅ Mobile testing: Maintain responsive behavior, test all breakpoints

**Ready for Phase 1**: Data model and contracts generation

---

## Best Practices Summary

### From Constitution v1.0.2:
- ✅ Component-by-Component Workflow (8 steps)
- ✅ 100% Clean Replacement Rule
- ✅ Logic Preservation First
- ✅ Manual QA Checklist (30+ items)
- ✅ Atomic Commits (one component per commit)
- ✅ Design Token Compliance (zero hardcoded values)

### From DESIGN-SYSTEM-SOT.md:
- ✅ Semantic token usage (bg-surface, text-foreground, etc.)
- ✅ Neumorphic component classes (.neu-btn-primary, .neu-card)
- ✅ Centralized components (AuthInput, AuthButton, etc.)
- ✅ Icon library (src/components/icons/auth/)

### From DESIGN-SYSTEM-AUDIT-REPORT.md:
- ✅ Current state: 40% compliance, 285 violations
- ✅ Target state: 95% compliance, <10 violations
- ✅ Priority order established
- ✅ Expected impact documented

---

**Phase 0 Complete** ✅  
**Next**: Phase 1 - Data Model & Contracts
