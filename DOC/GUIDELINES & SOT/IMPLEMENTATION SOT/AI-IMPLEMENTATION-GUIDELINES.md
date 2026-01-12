# AI Implementation Guidelines
**Purpose**: Universal process and principles for AI-assisted development to ensure quality and consistency  
**Date**: November 26, 2025  
**Status**: Active Standard  
**Scope**: All AI models working on this codebase

---

## ⚠️ CRITICAL WARNINGS (Read First Before ANY Work)

### 🔴 The Three Catastrophic Mistakes That Destroyed Projects

**November 29, 2025 - Lessons from Real Production Incidents:**

#### 1. Git Folder Deletion (CATASTROPHIC - 1+ Hour Recovery Time)
**What Happened**: Used `Remove-Item -Path ".*"` thinking it would clean cache files → Deleted `.git` folder → Lost entire project history
**Impact**: Unable to commit, pull, or track changes. Required re-cloning repository and manual file restoration.
**Prevention**: 
- ✅ NEVER use wildcards that match hidden folders (`.git`, `.env`, etc.)
- ✅ ALWAYS create backup commit before ANY file deletion
- ✅ ALWAYS test delete command with `-WhatIf` flag first
- ✅ ALWAYS verify `.git` folder exists after operations: `Test-Path ".git"`

#### 2. Conflicting Dynamic Route Names (CRITICAL - Complete App Crash)
**What Happened**: Created `src/app/api/bids/[leadId]/route.ts` and `src/app/api/bids/[bidId]/route.ts` simultaneously
**Error**: `Error: You cannot use different slug names for the same dynamic path ('bidId' !== 'leadId')`
**Impact**: Dev server refused to start. Application completely non-functional.
**Prevention**:
- ✅ Plan route structure BEFORE creating files
- ✅ Use consistent dynamic segment names at same level
- ✅ Test dev server after creating EACH route (not after all routes)

#### 3. Missing Dependencies & Prisma Desync (CRITICAL - Runtime Crashes)
**What Happened**: Used `import { format } from 'date-fns'` without installing package + Modified schema without regenerating Prisma Client
**Errors**: `Module not found: Can't resolve 'date-fns'` + `Cannot read properties of undefined (reading 'DRAFT')`
**Impact**: Build failures, runtime crashes, type errors everywhere
**Prevention**:
- ✅ Check package.json BEFORE using any import
- ✅ Run `npm install <package>` immediately when adding new import
- ✅ Run `npx prisma generate` IMMEDIATELY after schema changes
- ✅ Verify types in IDE before continuing

### 🚨 The Golden Rules (Never Break These)

1. **ONE CHANGE → TEST IMMEDIATELY → VERIFY WORKS → THEN NEXT CHANGE**
   - Creating multiple endpoints then testing = Recipe for disaster
   - You won't know which change broke things

2. **BACKUP BEFORE MAJOR CHANGES (Non-Negotiable)**
   ```powershell
   git add .
   git commit -m "backup: before [what you're about to do]"
   ```

3. **NEVER USE WILDCARDS NEAR ROOT OR .git**
   ```powershell
   # ❌ FORBIDDEN:
   Remove-Item -Path ".*" -Recurse
   Remove-Item -Path "*" -Recurse
   rm -rf .*
   
   # ✅ REQUIRED:
   Remove-Item -Path ".next" -Recurse
   Remove-Item -Path "specific-folder" -Recurse
   ```

4. **TEST IN BROWSER, NOT JUST CODE**
   - Open DevTools (F12) → Network tab
   - See the actual HTTP request/response
   - Verify database changes in Prisma Studio
   - Don't trust "success" messages without verification

---

## 🎯 CORE MANDATE

**NEVER implement anything without:**
1. ✅ Complete understanding of current state (audit first)
2. ✅ Clear implementation plan with testing checkpoints
3. ✅ Knowledge of where to find detailed guidance (reference files)

**Golden Rule**: If you don't have clear picture → STOP → Audit → Read Guidelines → Plan → Then implement

---

## 📚 REFERENCE FILES - READ BEFORE IMPLEMENTATION

**These files contain detailed standards. Read the relevant ones BEFORE starting work:**

### For ALL Tasks:
- `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/constitution.md` - Core principles, quality gates, 12-step audit workflow

### For UI/Design Work:
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md` - Design tokens, color system, migration patterns, verification commands
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md` - Layout patterns, component structure, routing conventions

### For Current Task:
- D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md - Specific task structure, testing protocols, phase details
- `prisma/schema.prisma` - Database models and relationships


**Do NOT replicate content from these files. Reference them when needed.**

---

## 🔄 THE 6-STEP UNIVERSAL WORKFLOW

**Follow this process for EVERY task, no exceptions:**

### Step 1: GATE 0 - System Health Check

Run these checks BEFORE starting:
```powershell
npx tsc --noEmit    # TypeScript: 0 errors + 0 warnings (empty output)
npm run build       # Build: "Compiled successfully" (no warnings)
npm run dev         # Dev server: Starts without errors
npx prisma validate # Schema: Valid
git status          # Know current state
ls -Force | Select-String ".git"  # Verify .git exists
```
**❌ STOP if ANY check fails** - Fix first, then proceed.

**⚠️ If you see warnings during GATE 0:**
- Document them in your audit report
- Plan to fix them BEFORE adding new code
- Do NOT add new code on top of existing warnings
- Warnings = Pre-existing technical debt that must be addressed

**Additional Backend Checks (if implementing APIs):**
```powershell
# Check existing route structure:
Get-ChildItem src/app/api -Recurse -Directory | Where-Object { $_.Name -match '\[.*\]' }
# Note any dynamic segment names ([id], [leadId], etc.)
# Your new routes MUST use same names at same level

# Verify dependencies for any planned imports:
Get-Content package.json | Select-String "package-name"
# If not found, add to implementation plan: "npm install package-name"
```

---

### Step 2: AUDIT - Understand Current State

Create audit report in `DOC/[folder]/[FEATURE]-AUDIT.md` with:
1. **Current State**: Files, data models, API endpoints, component tree
2. **Gap Analysis**: What's missing vs what's needed
3. **Root Cause**: WHY issue exists (not just what)
4. **Impact Assessment**: Files to modify, features affected, risk level
5. **Implementation Plan**: Phases, testing checkpoints, rollback procedures
6. **Verification Strategy**: Test cases, expected results, validation commands

**Read relevant reference files** (see "Reference Files" section above) to understand standards.

---

### Step 3: PLAN - Create Implementation Tasks

Create/update `DOC/FEATURES/<Feature Name>/tasks.md` using the canonical template:
- `DOC/.specify/templates/tasks-template.md`

Minimum requirements:
- Clear phases (Phase 1, Phase 2, ...)
- Tasks grouped by user story (US1, US2, ...)
- IDs in `T###` format and `[P]` label where parallel-safe
- Explicit file paths in task descriptions
- Testing checkpoints after each phase
- Stop criteria (when to halt if checks fail)

---

## 📌 Documentation Lock (AI Continuity Pack) — Required for Large Features

Problem this solves: AI context drift after a few implementation steps.

Rule: For any multi-phase feature (like Blog/CMS), you MUST create and lock an E2E documentation pack BEFORE writing production code.

Required artifacts:
- Feature SOT (Phases 0–5 planning): `DOC/Features/<Feature Name>/SOT/FEATURE-SOT.md`
- Feature SOT Index (Continuity Pack): `DOC/Features/<Feature Name>/SOT/INDEX.md`
   - Must list: canonical SOT, audit, execution tasks, and authority pointers
- Execution Tasks (all phases, including Phase 6): `DOC/FEATURES/<Feature Name>/tasks.md`

Lock protocol:
- When the user approves the plan, set Feature SOT status to `Locked (Approved)`.
- After lock: changes require a written “Change Request” section in the SOT (scope/ordering/data contract changes).
- Implementation MUST follow `DOC/FEATURES/<Feature Name>/tasks.md` phase-by-phase; do not improvise.

AI session restart rule:
- Always start a new implementation session by opening the Feature SOT Index first and following its “next step”.

---

### Step 4: IMPLEMENT - Execute Phase by Phase

**For each phase:**
1. **Create backup**: `git add . && git commit -m "before phase X"`
2. **Modify files** (one phase at a time)
3. **Run verification commands immediately**:
   ```powershell
   npx tsc --noEmit           # TypeScript check
   npm run dev                # Dev server starts?
   # Check terminal - should see "✓ Compiled" without errors
   ```
4. **Test in browser** (visual + console + network tab)
   - For APIs: Test endpoint immediately (curl or browser DevTools)
   - For UI: Visual check + responsive check + theme check
5. **Check checkpoint** - ALL tests must pass
6. **Only then proceed to next phase**

**STOP immediately if any test fails** - Don't continue to next phase.

**Backend Implementation Specifics:**
- Create ONE endpoint at a time (not all at once)
- After creating each endpoint file:
  ```powershell
  # 1. Check dev server recompiles:
  # Terminal should show: ✓ Compiled /api/your-route
  
  # 2. Test endpoint immediately:
  curl http://localhost:3000/api/your-route
  # OR open browser DevTools → Network tab → Trigger API call
  
  # 3. If modifies database, verify in Prisma Studio:
  npx prisma studio
  # Check affected table for changes
  ```
- Only after ONE endpoint fully works, create the next one

**Frontend Implementation Specifics:**
- Modify one component file
- Check browser immediately (F5 refresh)
- Check console for errors
- Test all themes (Dark, Light, Purple)
- Run design system verification if applicable

---

### Step 5: VERIFY - Complete System Validation

**🚨 ZERO WARNINGS POLICY - Mandatory for ALL Changes**

**CRITICAL RULE - ABSOLUTE 0 PROBLEMS REQUIREMENT**:

After EVERY implementation phase and BEFORE every commit, you MUST achieve **EXACTLY 0 PROBLEMS**:
- **0 TypeScript errors** (`npx tsc --noEmit` → empty output)
- **0 TypeScript warnings** (unused variables, implicit any, deprecated APIs)
- **0 ESLint warnings** (`npm run build` → "Compiled successfully" ONLY, no warning lines)
- **0 console warnings in browser** (React warnings, prop type mismatches, key warnings)
- **0 build warnings** (`npm run build` → NO yellow warning text)
- **0 problems in VSCode Problems panel** (Ctrl+Shift+M → empty list)

**"ZERO" means EXACTLY ZERO - not 1, not 2, not "reduced from 10 to 4"**

If VSCode Problems panel shows "4 problems" → NOT acceptable → MUST fix to "0 problems"

**Why This Matters:**
- Warnings indicate code quality issues that WILL become bugs later
- Warnings in production deployments can cause runtime failures
- Accumulating warnings creates technical debt that blocks future development
- "Just warnings" mindset leads to degraded code quality over time

**Run ALL verification commands:**

1. **TypeScript Compilation** (No Errors + No Warnings):
   ```powershell
   npx tsc --noEmit
   # Expected output: Empty (no errors, no warnings)
   # ❌ STOP if you see ANY output - fix immediately
   ```

2. **Build Verification** (Clean Production Build):
   ```powershell
   npm run build
   # Check terminal output carefully
   # ✅ Must see: "Compiled successfully"
   # ❌ STOP if warnings appear: "Compiled with warnings"
   # Common warnings to fix:
   #   - Unused variables: Remove or prefix with underscore (_unused)
   #   - Console.log in production: Remove or wrap in dev check
   #   - Missing dependencies: Add to package.json
   #   - Image optimization warnings: Use next/image correctly
   ```

3. **Browser Console Check** (No React/Runtime Warnings):
   ```powershell
   # Start dev server:
   npm run dev
   
   # Open browser → F12 DevTools → Console tab
   # Navigate to modified pages/components
   # ✅ Console should be completely clean (no yellow/orange warnings)
   # ❌ Fix immediately if you see:
   #   - "Warning: Each child in a list should have a unique key"
   #   - "Warning: Failed prop type"
   #   - "Warning: componentWillReceiveProps is deprecated"
   #   - "Warning: Can't perform a React state update on unmounted component"
   #   - "Warning: validateDOMNesting: <div> cannot appear as descendant"
   ```

4. **Design System Verification** (UI Work Only):
   - Run 6 verification commands from DESIGN-SYSTEM-SOT.md → 0/0/0/0/0/0
   
5. **Theme Testing** (UI Work Only):
   - Test Dark, Light, Purple themes → No color/contrast issues
   
6. **Responsive Testing** (UI Work Only):
   - Test 320px, 768px, 1440px breakpoints → No layout breaks

7. **Network Tab Verification** (API Work Only):
   ```powershell
   # Browser DevTools → Network tab
   # Trigger API calls through UI
   # ✅ Check: All requests return 200/201 (not 500/400)
   # ✅ Check: Response payloads contain expected data
   # ❌ Fix immediately: 500 errors, null responses, missing fields
   ```

8. **Database Verification** (Backend Work Only):
   ```powershell
   npx prisma studio
   # Verify: Data written correctly to tables
   # Verify: No NULL values in required fields
   # Verify: Relationships linked properly (foreign keys)
   ```

**Fixing Common Warnings:**

| Warning Type | How to Fix |
|--------------|------------|
| **Unused variable** | Remove it OR prefix with underscore `_unused` if intentional |
| **Implicit `any` type** | Add explicit type annotation: `: string`, `: number`, etc. |
| **Missing `key` prop** | Add unique `key={item.id}` to mapped JSX elements |
| **Console.log in production** | Remove OR wrap: `if (process.env.NODE_ENV === 'development') console.log(...)` |
| **Deprecated API** | Replace with modern equivalent (check docs/migration guide) |
| **Missing dependency** | Run `npm install <package>` and verify package.json updated |
| **React state update on unmounted** | Add cleanup in useEffect: `return () => { isMounted = false }` |
| **React Hook exhaustive-deps** | Add missing dependencies to useEffect array OR use `// eslint-disable-next-line react-hooks/exhaustive-deps` if intentional |
| **Custom classname not Tailwind** | Replace with design token class from tailwind.config.js OR add to config if new pattern |
| **Missing heading size (text-heading-5/6)** | Add missing fontSize to tailwind.config.js theme.extend.fontSize section |
| **Using `<img>` instead of `<Image />`** | Replace with `import Image from 'next/image'` and use `<Image />` component |

**ESLint Warning: "Classname 'X' is not a Tailwind CSS class"**
```markdown
CAUSE: Using custom CSS class that's not defined in tailwind.config.js

SOLUTIONS (choose one):
1. Replace with existing design token:
   - ❌ className="text-danger" 
   - ✅ className="text-error" (defined in config)
   
2. Replace with design system pattern:
   - ❌ className="animate-scale-in" 
   - ✅ className="animate-fade-in" (defined in config)
   
3. Add to tailwind.config.js if legitimate new pattern:
   - Check tailwind.config.js → theme.extend
   - Add new color/animation/typography token
   - Document reason in commit message

4. If using CSS module class, ensure file imported:
   - import styles from './Component.module.css'
   - className={styles.customClass}
```

**ESLint Warning: "React Hook useEffect has missing dependency"**
```markdown
CAUSE: useEffect dependency array doesn't include all used variables

SOLUTIONS (choose one):
1. Add missing dependency to array (PREFERRED):
   // ❌ BEFORE:
   useEffect(() => {
     fetchData();
   }, []); // fetchData not in deps

   // ✅ AFTER:
   useEffect(() => {
     fetchData();
   }, [fetchData]); // All deps included

2. Move function inside useEffect:
   // ✅ GOOD:
   useEffect(() => {
     const fetchData = async () => {
       // ... fetch logic
     };
     fetchData();
   }, [leadId]); // No function dep needed

3. Use useCallback for stable function reference:
   const fetchData = useCallback(async () => {
     // ... fetch logic
   }, [/* deps */]);

   useEffect(() => {
     fetchData();
   }, [fetchData]);

4. Suppress warning ONLY if intentionally omitting (rare):
   useEffect(() => {
     fetchData();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Intentionally run once only
```

**Verification Checklist Before Commit:**
```powershell
# Run this complete checklist:
npx tsc --noEmit                    # ✅ Empty output (no errors/warnings)
npm run build                       # ✅ "Compiled successfully" (no warnings)
npm run dev                         # ✅ Starts without errors
# Open browser + check console     # ✅ No yellow/orange warnings
npx prisma validate                 # ✅ "Schema is valid" (if touched schema)
git status                          # ✅ Know what you're committing
```

**❌ DO NOT COMMIT if ANY verification fails**  
**❌ DO NOT proceed to next phase if warnings remain**  
**❌ DO NOT report "complete" with active warnings**

**🎯 ACHIEVING EXACTLY 0 PROBLEMS - Step-by-Step Protocol**

If VSCode Problems panel shows ANY number > 0, follow this systematic approach:

```markdown
CURRENT STATE: VSCode shows "4 problems" (example from screenshot)

STEP 1: Open Problems Panel
- Press Ctrl+Shift+M (Windows) or Cmd+Shift+M (Mac)
- Review EVERY problem listed
- Document each: File, Line, Warning Type, Message

STEP 2: Categorize Problems
Group by type:
- TypeScript errors (red X icon)
- ESLint warnings (yellow ! icon)
- Custom classname warnings
- React Hook warnings

STEP 3: Fix ONE Problem at a Time
DO NOT try to fix all at once. For EACH problem:

A) Read error message carefully
B) Open file to exact line number
C) Apply appropriate fix from "Fixing Common Warnings" table above
D) Save file
E) Check Problems panel - should decrease by 1
F) Repeat until 0

STEP 4: Verify 0 Problems Achieved
After fixing all:
- Problems panel shows "No problems" or empty list
- Run: npx tsc --noEmit → empty output
- Run: npm run build → "Compiled successfully" (no warnings)
- VSCode status bar shows 0 errors, 0 warnings

ONLY THEN proceed to commit.
```

**Example: Fixing "4 problems" to "0 problems"**

```markdown
BEFORE FIX:
Problems panel shows:
1. RoofSiteDetails.tsx (76): Classname 'text-heading-5' is not a Tailwind CSS class
2. QuoteBuilderModal.tsx (377): React Hook useEffect has missing dependency: 'generatePreviewOptions'
3. QuoteBuilderModal.tsx (405): React Hook useEffect has missing dependency: 'setQuoteDraft'
4. QuoteBuilderModal.tsx (1091): Classname 'text-heading-6' is not a Tailwind CSS class

FIX PROCESS:
Problem 1 & 4 (Custom classnames):
- Check tailwind.config.js → heading-5 and heading-6 NOT defined
- Solution: Add to theme.extend.fontSize:
  'heading-5': ['14px', { lineHeight: '1.5', fontWeight: '600' }],
  'heading-6': ['12px', { lineHeight: '1.5', fontWeight: '600' }],
- Result: Problems 1 & 4 resolved

Problem 2 & 3 (React Hook deps):
- generatePreviewOptions is complex function, adding it would cause infinite loop
- setQuoteDraft is stable setter, doesn't need to be in deps
- Solution: Add eslint-disable-next-line comment to each useEffect
- Result: Problems 2 & 3 resolved

AFTER FIX:
- Problems panel: "No problems" ✅
- npx tsc --noEmit: Clean ✅
- npm run build: "Compiled successfully" ✅
- Ready to commit ✅
```

**Common Mistake: "I reduced warnings from 10 to 4"**
❌ WRONG: Thinking 4 is "better" and acceptable
✅ CORRECT: 4 is still FAILURE. Must continue until 0.

**Common Mistake: "Most warnings are fixed"**
❌ WRONG: Partial completion
✅ CORRECT: 100% completion required. ALL warnings must be resolved.

---

### Step 6: REPORT - Honest Status Update

```markdown
## Status Report

**Completed**:
- ✅ Main file (path): Verified clean
- ✅ Child component 1: Verified clean

**Remaining**:
- ❌ Child component 2: Needs migration
- ❌ Testing: Multi-user flow pending

**Issues Found**:
- Issue 1: Description and fix plan

**Ready for User Review**: YES / NO
```

Never report "complete" unless ALL components verified and ALL tests pass.

---

## 🧪 TESTING PRINCIPLES (NON-NEGOTIABLE)

### Principle 1: STOP-ON-FAIL
```
Test Failed → STOP IMMEDIATELY
❌ DO NOT proceed to next phase
❌ DO NOT implement additional features
✅ Fix the failing test first
✅ Re-run until test passes
✅ Only then continue
```

### Principle 2: INCREMENTAL VALIDATION
After EVERY file modification:
1. TypeScript check: `npx tsc --noEmit`
2. Build check: `npm run build`
3. Browser check: Open DevTools → Console (no errors) + Network tab (API calls work)

### Principle 3: TEST THE USER'S EXACT ACTION
Don't assume code works. Test what user actually does:
- User types comma → Open browser, click field, type comma → Does comma appear?
- User clicks save → Check Network tab → API returned 200? Database updated?
- User sees modal → Inspect element → z-index applied? No overlaps?

### Principle 4: VERIFY ALL DEPENDENCIES
Before marking complete:
1. Map component tree (parent → children → nested children)
2. Verify EACH file in tree (not just parent)
3. Run verification commands on ALL files
4. Only report complete when ENTIRE tree verified

### Principle 5: HONEST REPORTING
❌ WRONG: "Task complete! All fixed."
✅ CORRECT: "Main file verified. 2 child components pending. Not complete yet."

---

## 🎨 DESIGN SYSTEM COMPLIANCE

**For ALL UI work, reference**: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/DESIGN-SYSTEM-SOT.md`

That file contains:
- Design token reference (colors, spacing, typography)
- Verification commands (6 commands to detect hardcoded values)
- Migration patterns and lessons learned
- Multi-theme testing requirements

### Quick Reference - What NOT to Do:
```typescript
// ❌ FORBIDDEN:
<div className="bg-white text-gray-800">           // Hardcoded colors
<div style={{ backgroundColor: '#fff' }}>          // Inline styles
<div className="dark:bg-gray-900">                // Dark mode classes
<div className="mt-4 mb-6">                       // Hardcoded spacing
<h1 className="text-2xl font-bold">              // Hardcoded typography
```

### What TO Do:
```typescript
// ✅ CORRECT:
<div className="bg-surface text-foreground">      // Semantic tokens
<div className="spacing-4">                       // Spacing tokens
<h1 className="text-heading-1">                  // Typography tokens
<button className="btn-primary">                  // Design system components
```

**Verification**: Run 6 verification commands from DESIGN-SYSTEM-SOT.md → Must return 0/0/0/0/0/0

**Testing**: ALL 3 themes (Dark, Light, Purple) must pass. ALL 5 breakpoints (320px, 375px, 768px, 1024px, 1440px) must work.

---

## 🔐 BACKEND IMPLEMENTATION PATTERNS

**For database schema**: Reference `prisma/schema.prisma`
**For API structure**: See `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/constitution.md` for patterns

### ⚠️ CRITICAL: Pre-Backend Implementation Checklist

**BEFORE writing any backend code:**
```markdown
- [ ] Read prisma/schema.prisma - understand existing models
- [ ] Check src/app/api/ - map existing route structure
- [ ] Verify naming conventions - check how other routes are named
- [ ] Plan route structure - no conflicting dynamic segments
- [ ] List all dependencies - check if packages are installed
- [ ] Create backup - commit current state before major changes
```

**❌ NEVER START BACKEND WITHOUT THESE CHECKS ❌**

---

### 🛡️ CRITICAL FILE SAFETY PROTOCOLS

**ABSOLUTE RULES (Breaking these causes catastrophic failures):**

#### 1. Git Folder Protection
```powershell
# ❌ NEVER DO THESE:
Remove-Item -Path ".git" -Recurse
Remove-Item -Path "**/.git" -Recurse
git rm -rf .git

# ❌ NEVER use wildcards that could match .git:
Remove-Item -Path ".*" -Recurse
rm -rf .*

# ✅ SAFE: Always use specific paths
Remove-Item -Path ".next" -Recurse -Force
Remove-Item -Path "node_modules" -Recurse -Force
```

#### 2. Project Structure Protection
```powershell
# ❌ FORBIDDEN - Can delete critical folders:
Remove-Item -Path "src/*" -Recurse
Remove-Item -Path "*" -Include "*.tsx"
Get-ChildItem | Remove-Item -Recurse

# ✅ REQUIRED: Always specify EXACT paths
Remove-Item -Path "src/app/api/specific-feature" -Recurse
Remove-Item -Path "src/components/SpecificComponent.tsx"
```

#### 3. Pre-Delete Verification Protocol
**BEFORE any Remove-Item or file deletion:**
```markdown
1. [ ] List what will be deleted first (Get-ChildItem with same path)
2. [ ] Verify exact path matches intended target
3. [ ] Check if any git-related folders in path
4. [ ] Run git status to see current state
5. [ ] Create backup commit: git add . && git commit -m "backup before deletion"
6. [ ] Only then execute delete command
```

#### 4. Backup Creation Protocol
**BEFORE major structural changes:**
```powershell
# Step 1: Commit current state
git add .
git commit -m "backup: before [feature] implementation"

# Step 2: Create named backup branch (optional but recommended)
git branch backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')

# Step 3: Verify backup exists
git log --oneline -1
```

---

### 📁 Next.js Route Naming Rules (CRITICAL)

**Next.js FORBIDS different dynamic segment names at same level:**

```typescript
// ❌ FORBIDDEN - Will crash dev server:
src/app/api/bids/[leadId]/route.ts      // Uses [leadId]
src/app/api/bids/[bidId]/route.ts       // Uses [bidId] - CONFLICT!

// ✅ CORRECT - Consistent naming:
src/app/api/bids/[bidId]/route.ts
src/app/api/bids/[bidId]/select/route.ts
src/app/api/bids/[bidId]/purchase/route.ts

// ✅ ALSO CORRECT - Different levels can have different names:
src/app/api/leads/[leadId]/bids/[bidId]/route.ts  // OK: different levels
```

**Route Planning Protocol:**
```markdown
BEFORE creating any API route:
1. [ ] Map existing routes in same directory
2. [ ] Check dynamic segment names ([id], [leadId], etc.)
3. [ ] Use SAME name for all routes at same level
4. [ ] Document route structure in plan.md
5. [ ] Test dev server starts after creating EACH route
```

**Verification Command:**
```powershell
# After creating routes, verify no conflicts:
npm run dev
# If server starts → No conflicts ✅
# If "different slug names" error → Fix naming IMMEDIATELY ❌
```

---

### 🗄️ Prisma Workflow (MANDATORY)

**Every schema change REQUIRES this sequence:**

```powershell
# 1. After ANY prisma/schema.prisma edit:
npx prisma format          # Format schema file
npx prisma validate        # Check for errors

# 2. Generate Prisma Client (CRITICAL):
npx prisma generate        # TypeScript types updated

# 3. Verify in IDE:
# - Open file using Prisma Client
# - Check autocomplete shows new fields/models
# - No TypeScript errors

# 4. Create/apply migration (if in dev):
npx prisma migrate dev --name feature_name

# 5. Test in code:
# - Import and use new model
# - Run dev server
# - Verify database operations work
```

**Common Prisma Errors & Fixes:**
```typescript
// ❌ ERROR: "Cannot read properties of undefined (reading 'MODELNAME')"
// CAUSE: Forgot to run npx prisma generate
// FIX: Run npx prisma generate, restart dev server

// ❌ ERROR: "Type 'X' is not assignable to type 'Y'"
// CAUSE: Schema changed but types not regenerated
// FIX: Delete node_modules/.prisma, run npx prisma generate

// ❌ ERROR: Migration fails
// CAUSE: Database state doesn't match schema
// FIX: Try npx prisma migrate resolve, or write manual migration to fix data
```

---

### 🚨 DATABASE RESET POLICY (CRITICAL - READ CAREFULLY)

**⛔ ABSOLUTELY NEVER USE `npx prisma migrate reset` OR `npx prisma db push --force-reset`**
**⛔ ABSOLUTELY NEVER USE ANY COMMAND THAT WIPES DATABASE DATA**

**ZERO TOLERANCE POLICY - NO EXCEPTIONS, NOT EVEN IN DEV MODE**

**Why This Is Permanently Forbidden:**
- `npx prisma migrate reset` and `npx prisma db push --force-reset` **DESTROY ALL DATABASE DATA** permanently
- Even in dev mode, **REAL USER DATA EXISTS** - every user account, lead, bid, and setting is production-grade data
- Losing data wastes hours of development time, breaks user workflows, destroys trust
- Requires re-creating all user accounts, re-testing all features, re-establishing all relationships
- **USER EXPLICITLY FORBIDS DATA LOSS IN ANY ENVIRONMENT** - development, staging, or production
- There is ALWAYS a migration-based solution that preserves data

**✅ CORRECT APPROACH - Incremental Migrations (Preserves All Data):**

```powershell
# 1. Make schema changes in prisma/schema.prisma
# 2. Generate Prisma Client (updates types only, no DB changes yet):
npx prisma generate

# 3. Create migration (applies changes incrementally, preserves existing data):
npx prisma migrate dev --name descriptive_migration_name
# Examples:
# npx prisma migrate dev --name add_notification_types
# npx prisma migrate dev --name add_user_preferences_field
# npx prisma migrate dev --name update_lead_status_enum

# 4. Verify migration worked:
npx prisma studio
# Check that:
# - New fields/tables exist
# - Existing data is still there
# - No data loss occurred
```

**When Migration Conflicts Occur (Use These Steps BEFORE Considering Reset):**

```powershell
# STEP 1: Check migration status
npx prisma migrate status
# Shows: applied migrations, pending migrations, drift detected

# STEP 2: Try to resolve drift/conflicts without reset:
npx prisma migrate resolve --applied "migration_name"
# OR
npx prisma migrate resolve --rolled-back "migration_name"

# STEP 3: If conflicts persist, try push (forces schema sync):
npx prisma db push --accept-data-loss
# Use ONLY if you understand what data will be lost

# STEP 4: If specific migration is broken, delete it and recreate:
# - Delete the problematic migration folder from prisma/migrations/
# - Run: npx prisma migrate dev --name new_migration_name
# - This creates a new migration without destroying existing data
```

**✅ MANDATORY WORKFLOW - Database Changes With Zero Data Loss:**

**STEP 1: ALWAYS TAKE BACKUP FIRST (NON-NEGOTIABLE):**

```powershell
# Create timestamped backup BEFORE any schema change:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_pre_migration.sql"

# Verify backup was created and has content:
Get-Item "backup/backup_${timestamp}_pre_migration.sql" | Select-Object Name, Length
# Should show file size > 0 bytes
```

**STEP 2: MAKE SCHEMA CHANGES (Never Touch Data):**

```powershell
# Edit prisma/schema.prisma with your changes

# Generate Prisma Client (updates TypeScript types only):
npx prisma generate

# Create migration (applies schema changes, preserves all data):
npx prisma migrate dev --name descriptive_name
# Examples:
# npx prisma migrate dev --name add_written_quote_fields
# npx prisma migrate dev --name add_user_preferences
# npx prisma migrate dev --name update_notification_types
```

**STEP 3: VERIFY DATA INTEGRITY:**

```powershell
# Open Prisma Studio and verify:
npx prisma studio

# Checklist:
# ✅ New fields/tables exist
# ✅ ALL existing data is still present
# ✅ User accounts unchanged
# ✅ Leads/Bids/Settings intact
# ✅ Relationships preserved

# If data is missing → RESTORE IMMEDIATELY (see STEP 4)
```

**STEP 4: IF ANYTHING GOES WRONG - RESTORE FROM BACKUP:**

```powershell
# Stop any running migrations:
# Ctrl+C any active processes

# Restore database from backup:
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS solarmatch;"
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "CREATE DATABASE solarmatch;"
Get-Content "backup/backup_${timestamp}_pre_migration.sql" | docker exec -i solarmatch-db-1 psql -U postgres -d solarmatch

# Verify restore worked:
npx prisma studio
# Check that all data is back

# Fix the migration issue (not the data):
# - Review what went wrong
# - Adjust schema.prisma correctly
# - Try migration again with new backup
```

**STEP 5: TAKE POST-MIGRATION BACKUP (RECOMMENDED):**

```powershell
# After successful migration, create new backup:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_post_migration.sql"

# Label it clearly (rename if needed) to indicate what it includes:
# Example: backup_20251222_153045_with_written_quote_schema.sql
```

**Summary - Migration Decision Tree (ZERO DATA LOSS):**

```
Need to change schema?
├─ STEP 1: Take backup FIRST (MANDATORY)
│   └─ docker exec ... pg_dump > backup/backup_[timestamp]_pre_migration.sql
├─ STEP 2: Make change in schema.prisma
│   └─ Run: npx prisma generate
│   └─ Run: npx prisma migrate dev --name change_description
├─ STEP 3: Verify in Prisma Studio (ALL data must still exist)
│   └─ If data missing → RESTORE from backup immediately
├─ STEP 4: Take post-migration backup (optional but recommended)
│   └─ docker exec ... pg_dump > backup/backup_[timestamp]_post_migration.sql

Migration has conflicts?
├─ STEP 1: Check status
│   └─ npx prisma migrate status
├─ STEP 2: Try resolve (no data loss)
│   └─ npx prisma migrate resolve --applied "migration_name"
│   └─ npx prisma migrate resolve --rolled-back "migration_name"
├─ STEP 3: If broken, delete migration file and recreate
│   └─ Delete: prisma/migrations/[broken_migration]/
│   └─ Run: npx prisma migrate dev --name new_migration_name
├─ STEP 4: If all else fails, restore from backup
│   └─ See "STEP 4: IF ANYTHING GOES WRONG" above

⛔ NEVER ALLOWED (PERMANENTLY BANNED):
├─ npx prisma migrate reset (DESTROYS ALL DATA)
├─ npx prisma db push --force-reset (DESTROYS ALL DATA)
├─ DROP DATABASE commands (unless part of restore procedure)
└─ Any command that wipes data without backup-restore workflow
```

**When Restoring Old Backup With New Schema Requirements:**

```powershell
# Scenario: You have old backup (missing new fields) and need current schema

# STEP 1: Take backup of CURRENT database state (has new schema):
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_current_schema.sql"

# STEP 2: Restore old backup (has real user data, old schema):
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS solarmatch;"
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "CREATE DATABASE solarmatch;"
Get-Content "backup/backup_old_data.sql" | docker exec -i solarmatch-db-1 psql -U postgres -d solarmatch

# STEP 3: Apply migrations to update schema (preserves restored data):
npx prisma migrate deploy
# This applies all pending migrations to bring old schema up to date

# STEP 4: Verify all data + new schema exist:
npx prisma studio
# Check:
# ✅ Old user accounts present
# ✅ Old leads/bids present
# ✅ New fields exist (with NULL or default values)
# ✅ New tables exist (empty, ready for use)

# STEP 5: Update specific records if needed (e.g., admin credentials):
docker exec -it solarmatch-db-1 psql -U postgres -d solarmatch -c "
  UPDATE users 
  SET email = 'desired@email.com', password = 'bcrypt_hash_here' 
  WHERE role = 'ADMIN';
"

# STEP 6: Take new backup of merged state:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_merged_data_and_schema.sql"
```

```
Need to change schema?
├─ STEP 1: Take backup FIRST (MANDATORY)
│   └─ docker exec ... pg_dump > backup/backup_[timestamp]_pre_migration.sql
├─ STEP 2: Make change in schema.prisma
│   └─ Run: npx prisma generate
│   └─ Run: npx prisma migrate dev --name change_description
│       ├─ Success? → ✅ Done! Data preserved.
│       └─ Conflict/Error?
│           ├─ Try: npx prisma migrate resolve
│           ├─ Try: npx prisma db push
│           ├─ Try: Delete bad migration folder, recreate
│           └─ ALL FAILED? → Consider reset (LAST RESORT)
│               └─ Document reason, run seeds, test everything
└─ NO → Just run: npx prisma generate (updates types only)
```

**Key Takeaway:**
- **Default approach**: `npx prisma migrate dev` (preserves data)
- **Problem approach**: `npx prisma migrate resolve` or manual fix (still preserves data)
- **Nuclear option**: `npx prisma migrate reset` (destroys everything - avoid unless truly necessary)

---

### 📦 Dependency Management Protocol

**BEFORE using any import:**
```markdown
1. [ ] Check if package is in package.json dependencies
2. [ ] If NOT in package.json:
   - [ ] Run: npm install <package-name>
   - [ ] Verify: Check package.json updated
   - [ ] Test: Import in code, check no TypeScript errors
3. [ ] If in package.json but import fails:
   - [ ] CRITICAL: Verify physical files exist:
     ```powershell
     Test-Path "node_modules\<package-name>\index.js"
     # OR check main file from package.json
     ```
   - [ ] If False (files missing): Run npm install <package-name> to actually download files
   - [ ] If True (files exist): Clear cache and restart:
     ```powershell
     Remove-Item -Path ".next" -Recurse -Force
     Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
     npm run dev
     ```
4. [ ] Document which packages were added in implementation notes
```

**Common Package Errors:**
```typescript
// ❌ ERROR: "Module not found: Can't resolve 'package-name'"
// CAUSE 1: Used import without installing package
// FIX: npm install package-name

// ❌ ERROR: "Module not found..." but package IS in package.json
// CAUSE 2: Package listed but files not actually in node_modules (corrupted install)
// FIX: 
//   1. Verify: Test-Path "node_modules\package-name\index.js"
//   2. If False: npm install package-name (actually downloads files)
//   3. Clear cache: Remove-Item ".next" -Recurse -Force
//   4. Restart: npm run dev
// REAL EXAMPLE: date-fns was in package.json but node_modules/date-fns/index.js didn't exist

// ❌ ERROR: "Cannot find module 'package-name' or its corresponding type declarations"
// CAUSE: Types not installed (@types/package-name)
// FIX: npm install --save-dev @types/package-name
```

---

### Standard API Route Pattern:
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // 2. Authorization Check
    if (session.user.role !== 'REQUIRED_ROLE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    // 3. Input Validation (use zod schema)
    const body = await request.json();
    
    // 4. Business Logic
    const result = await prisma.model.operation({ /* ... */ });
    
    // 5. Audit Logging (for sensitive operations)
    await logAudit({ action: 'ACTION', userId: session.user.id });
    
    // 6. Response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API_ERROR]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database Operation Principles:
1. **Include relations**: Specify `include` for related data
2. **Use transactions**: Multi-step operations need `prisma.$transaction`
3. **Handle not found**: Check if result exists before using
4. **Select specific fields**: Don't fetch unnecessary data

---

## 🧪 BACKEND API TESTING WORKFLOW (MANDATORY)

**Test EACH endpoint IMMEDIATELY after creation. Never create multiple endpoints then test later.**

### Step-by-Step Testing Protocol:

#### Phase 1: Endpoint Creation
```markdown
1. [ ] Create route file (e.g., src/app/api/bids/route.ts)
2. [ ] Write endpoint handler code
3. [ ] Save file
4. [ ] Check terminal - does dev server auto-reload? (should see "Compiled...")
5. [ ] Check for compilation errors - fix IMMEDIATELY if any
```

#### Phase 2: Basic Verification
```powershell
# 1. Dev server must compile successfully
# Check terminal output - should see:
✓ Compiled /api/your-endpoint in X.Xs

# 2. No TypeScript errors
npx tsc --noEmit  # Must return 0 errors
```

#### Phase 3: API Testing (Use Browser DevTools)
```markdown
1. [ ] Open Browser DevTools (F12)
2. [ ] Go to Network Tab
3. [ ] Trigger API call (click button, submit form, or use curl/Postman)
4. [ ] Check Network Tab:
   - [ ] Request sent? (should see API call listed)
   - [ ] Status code? (200 = success, 4xx = client error, 5xx = server error)
   - [ ] Response body? (click request → Preview tab → verify data structure)
   - [ ] Response time? (should be < 5 seconds, if slower investigate)
5. [ ] Check Browser Console:
   - [ ] Any red errors? Fix immediately
   - [ ] Any warnings? Investigate if related to feature
```

#### Phase 4: Database Verification
```powershell
# After API call that modifies database:

# Option 1: Prisma Studio (Visual)
npx prisma studio
# Open http://localhost:5555
# Navigate to affected table
# Verify data was created/updated/deleted correctly

# Option 2: Direct Query (Quick Check)
# In terminal:
npx prisma db seed  # If using seed file with test data
# Or create quick test script
```

#### Phase 5: Error Case Testing
```markdown
Test THESE scenarios for EVERY endpoint:

1. [ ] **No Auth**: Call without session → Should return 401
2. [ ] **Wrong Role**: Installer calls admin endpoint → Should return 403
3. [ ] **Missing Fields**: Omit required body field → Should return 400 with clear error
4. [ ] **Invalid ID**: Use non-existent ID → Should return 404
5. [ ] **Duplicate**: Create same resource twice (if applicable) → Handle appropriately
6. [ ] **Large Payload**: Send 10x normal data → Should handle or return 413
```

**Use curl or API client for quick testing:**
```powershell
# Test GET endpoint:
curl http://localhost:3000/api/bids?leadId=test123

# Test POST endpoint:
curl -X POST http://localhost:3000/api/bids `
  -H "Content-Type: application/json" `
  -d '{"leadId":"test","amount":100}'

# Check response in terminal
```

#### Phase 6: Integration Testing
```markdown
After all endpoints created:

1. [ ] **Full Flow Test**: User creates → reads → updates → deletes
2. [ ] **Multi-User Test**: Admin creates, Installer reads, Homeowner updates
3. [ ] **Concurrent Test**: Multiple requests at same time (open multiple tabs)
4. [ ] **Edge Cases**: Empty arrays, null values, very long strings
5. [ ] **Performance**: Check slow queries (> 1 second) in Network tab
```

### API Testing Checklist (Before Marking Complete):
```markdown
- [ ] All endpoints compile without errors
- [ ] All endpoints tested in browser (Network tab shows 200 responses)
- [ ] Database changes verified (Prisma Studio confirms data)
- [ ] Error cases handled (401, 403, 404, 400 tested)
- [ ] Frontend integration tested (if applicable)
- [ ] Console has no errors
- [ ] No breaking changes to existing APIs
- [ ] API documented (if creating new patterns)
```

### Common API Errors & Solutions:
```typescript
// ❌ ERROR: "Error: You cannot use different slug names..."
// CAUSE: Conflicting dynamic route names ([id] vs [bidId])
// FIX: Rename folders to use consistent dynamic segment name
// VERIFY: Run npm run dev, should start without errors

// ❌ ERROR: "Module not found: Can't resolve..."
// CAUSE: Missing npm package (e.g., date-fns, zod)
// FIX: npm install <package-name>
// VERIFY: Check package.json, restart dev server

// ❌ ERROR: "Cannot read properties of undefined..."
// CAUSE: Prisma Client not regenerated after schema change
// FIX: npx prisma generate
// VERIFY: Check types in IDE, restart dev server

// ❌ ERROR: "PrismaClientKnownRequestError: Record not found"
// CAUSE: Querying non-existent record without null check
// FIX: Add null check: if (!result) return NextResponse.json(...)
// VERIFY: Test with invalid ID, should return 404

// ❌ ERROR: Network tab shows CORS error
// CAUSE: Missing CORS headers or wrong origin
// FIX: Check next.config.js headers configuration
// VERIFY: Check Network tab, preflight (OPTIONS) should succeed
```

---

## 🚫 COMMON MISTAKE PATTERNS (Learn from These)

### Mistake 1: Assuming Code Works Without Testing
**Wrong Approach**: Write code → Report "fixed" → User finds it broken
**Correct Approach**: Write code → Test in browser → Verify user's exact action works → Then report

### Mistake 2: Fixing Wrong Layer
**Pattern**: User can't type comma in field
- AI fixes: Validation regex, placeholder text, backend validation
- Actual problem: Input element `type="number"` blocks commas
**Lesson**: When repeated fixes don't work, audit the LAYER you're fixing (HTML vs JS vs CSS)

### Mistake 3: Partial Implementation
**Pattern**: Fix name and phone unlock, forget email unlock
**Lesson**: List ALL fields affected before implementing. Check EACH one.

### Mistake 4: Ignoring Component Dependencies
**Pattern**: Migrate parent file, report complete, child components still broken
**Lesson**: Map complete component tree FIRST. Migrate ALL files in tree. Verify ALL before reporting complete.

### Mistake 5: False Success Messages
**Pattern**: Frontend shows "success" but backend failed, database unchanged
**Lesson**: Never trust success messages. Verify: Network tab (API response) → Database (Prisma Studio) → UI reflects change

### Mistake 6: Repeating Failed Approaches
**Pattern**: Try approach 1 → Fails → Try same approach again → Fails → Repeat 5 times
**Lesson**: Failed twice? STOP. Switch tools/approach. Don't repeat same failure.

### Mistake 7: Skipping Audit Phase
**Pattern**: User requests feature → AI starts coding immediately → Gets requirements wrong
**Lesson**: ALWAYS audit first. Understand current state, data flows, dependencies BEFORE coding.

### Mistake 8: Vague Testing Instructions
**Pattern**: "Test the feature" → User confused what to test
**Lesson**: Numbered steps, clear actions, expected results. Test instructions should be followable by someone who doesn't know the feature.

### Mistake 9: Creating Multiple API Routes Without Testing (CATASTROPHIC)
**Pattern**: Create 5 API endpoints → Test none → All have errors → Dev server won't start
**Lesson**: Create ONE route → Test IMMEDIATELY → Verify works → Only then create next route
**Real Example**: Created `/api/bids/[leadId]` and `/api/bids/[bidId]` simultaneously → Conflicting names crashed entire dev server

### Mistake 10: Not Testing Each Endpoint Individually
**Wrong Approach**: 
```
1. Create POST /api/bids
2. Create GET /api/bids/[bidId]
3. Create POST /api/bids/[bidId]/purchase
4. Run dev server → See errors → Don't know which endpoint is broken
```
**Correct Approach**:
```
1. Create POST /api/bids
2. Test in browser (Network tab, verify 200 response)
3. Check database (Prisma Studio, verify data created)
4. Only then create next endpoint
```

### Mistake 11: Using Imports Without Installing Packages
**Pattern**: Add `import { format } from 'date-fns'` → Don't run npm install → Build fails
**Lesson**: EVERY new import MUST check package.json first. If not there, run npm install immediately
**Real Example**: Used `date-fns` in `AssignmentHistoryTable.tsx` without installing → Module not found error

### Mistake 12: Forgetting to Regenerate Prisma Client
**Pattern**: Add field to schema.prisma → Use field in code → TypeScript error "Property doesn't exist"
**Lesson**: ALWAYS run `npx prisma generate` after schema changes. No exceptions.
**Real Example**: Schema had `LeadStatus.DRAFT` but Prisma Client wasn't regenerated → Runtime error "Cannot read properties of undefined"

### Mistake 13: Conflicting Dynamic Route Names (CATASTROPHIC)
**Pattern**: Create folders with different dynamic segment names at same level
**Wrong**:
```
src/app/api/bids/[leadId]/route.ts      // ❌
src/app/api/bids/[bidId]/route.ts       // ❌ Different name, same level
```
**Lesson**: All dynamic segments at same level MUST use same name
**Real Example**: This exact mistake crashed the entire dev server, unable to recover without folder deletion

### Mistake 14: Deleting Critical Files/Folders (CATASTROPHIC)
**Pattern**: Use broad wildcards in delete commands → Accidentally delete `.git` folder → Lose entire project history
**Wrong Commands**:
```powershell
Remove-Item -Path ".*" -Recurse          # ❌ Deletes .git!
Remove-Item -Path "src/*" -Recurse       # ❌ Too broad!
rm -rf .*                                 # ❌ DANGEROUS!
```
**Lesson**: ALWAYS use specific paths. NEVER use wildcards that could match hidden folders.
**Real Example**: Project lost entire git history, required 1+ hour recovery time

### Mistake 15: No Backup Before Major Changes (CATASTROPHIC)
**Pattern**: Start backend implementation → Make breaking changes → No way to rollback
**Lesson**: ALWAYS commit current state before major refactoring: `git add . && git commit -m "backup before feature"`
**Real Example**: Had to re-clone repository and manually restore files after catastrophic deletion

### Mistake 16: Testing Backend Without Browser DevTools
**Pattern**: Write API endpoint → Assume it works → User finds it returns wrong data
**Lesson**: ALWAYS test in browser with DevTools open:
- Network tab → Verify status code (200, 201, 404, etc.)
- Preview tab → Verify response structure matches expectation
- Console tab → Check for errors
**Real Example**: Would have caught routing conflict immediately if dev server tested after each route

### Mistake 17: Not Verifying Database Changes
**Pattern**: API returns success → Assume database updated → Database actually unchanged
**Lesson**: After EVERY API call that modifies data:
1. Open Prisma Studio (`npx prisma studio`)
2. Navigate to affected table
3. Verify record was created/updated/deleted
**Never trust "success" responses without database verification**

### Mistake 18: Creating All Routes Then Testing (WRONG WORKFLOW)
**Pattern**: Spend 2 hours creating 10 endpoints → Test after all done → 8 have errors → Can't remember what you did
**Correct Workflow**:
```
1. Create endpoint 1
2. Test endpoint 1 (dev server, browser, database)
3. If passes → Commit
4. Only then create endpoint 2
5. Repeat
```
**This way, if something breaks, you know EXACTLY which change caused it**

---

## ✅ FINAL CHECKLIST (Before Reporting Complete)

```markdown
### Pre-Implementation
- [ ] Current state audit completed
- [ ] Reference files read (DESIGN-SYSTEM-SOT.md, constitution.md, etc.)
- [ ] Implementation plan documented (tasks.md)
- [ ] Backup created: git add . && git commit -m "backup before [feature]"
- [ ] Dependencies checked (all imports have matching packages in package.json)

### Backend Specific (if applicable)
- [ ] Route naming verified (no conflicting dynamic segments)
- [ ] Prisma schema validated: npx prisma validate
- [ ] Prisma Client generated: npx prisma generate
- [ ] Each endpoint tested immediately after creation
- [ ] API tested in browser DevTools (Network + Console tabs)
- [ ] Database changes verified in Prisma Studio
- [ ] Error cases tested (401, 403, 404, 400 responses)
- [ ] No aggressive file deletions (no wildcards near .git)

### Frontend Specific (if applicable)
- [ ] Design system compliance (DESIGN-SYSTEM-SOT.md verification commands: 0/0/0/0/0/0)
- [ ] All 3 themes tested (Dark, Light, Purple)
- [ ] All breakpoints tested (320px, 768px, 1440px)
- [ ] Component dependencies identified and verified

### Final Validation
- [ ] GATE 0 checks passed
- [ ] TypeScript: 0 errors (npx tsc --noEmit)
- [ ] Build: Success (npm run build)
- [ ] Dev server: Starts without errors (npm run dev)
- [ ] Browser console: No errors
- [ ] Network tab: All API calls work correctly
- [ ] Manual testing: All features work as expected
- [ ] No existing functionality broken
- [ ] Git commit created with descriptive message
```

**Only after ALL checkboxes ticked can you report task complete.**

---

## 🚨 CATASTROPHIC FAILURE PREVENTION CHECKLIST

**Before ANY file deletion or major structural change:**

```markdown
### MANDATORY PRE-DELETION CHECKS (Breaking these = Project Loss)

1. [ ] **Git Safety Check**
   ```powershell
   # Verify what will be deleted BEFORE running command:
   Get-ChildItem -Path "target/path" -Recurse | Select-Object FullName
   # Check list carefully - is .git in there? STOP if yes!
   ```

2. [ ] **Backup Current State**
   ```powershell
   git add .
   git commit -m "backup: before deleting [what you're deleting]"
   git status  # Verify commit succeeded
   ```

3. [ ] **Verify Exact Path**
   ```markdown
   - [ ] Path uses absolute path OR specific relative path
   - [ ] Path does NOT use wildcards that could match .git
   - [ ] Path does NOT use .* pattern
   - [ ] Path does NOT delete from project root without specific target
   ```

4. [ ] **Double-Check Delete Command**
   ```powershell
   # ❌ FORBIDDEN patterns:
   Remove-Item -Path ".*"                    # Deletes .git!
   Remove-Item -Path "*"                     # Deletes everything!
   Remove-Item -Path "src/*"                 # Too broad!
   rm -rf .*                                  # DANGEROUS!
   
   # ✅ REQUIRED patterns:
   Remove-Item -Path ".next" -Recurse        # Specific folder
   Remove-Item -Path "node_modules" -Recurse # Specific folder
   Remove-Item -Path "src/app/api/specific-feature" -Recurse  # Exact path
   ```

5. [ ] **Test Delete Command (Dry Run)**
   ```powershell
   # Use -WhatIf to see what would be deleted:
   Remove-Item -Path "target" -Recurse -WhatIf
   # Review output carefully before running actual command
   ```

6. [ ] **Post-Delete Verification**
   ```powershell
   git status  # Should NOT show .git folder changes
   ls -Force   # Verify .git folder still exists
   git log     # Verify can still see history
   ```

### EMERGENCY RECOVERY (If .git deleted by mistake)

```markdown
1. [ ] STOP immediately - don't make more changes
2. [ ] Check if remote backup exists: git remote -v
3. [ ] If remote exists: 
   - [ ] Clone fresh copy: git clone <url> project-recovery
   - [ ] Copy .git folder to corrupted project
   - [ ] Run: git status (should show untracked files)
   - [ ] Commit all changes to recover state
4. [ ] If no remote:
   - [ ] Check backup folder (if created)
   - [ ] Check trash/recycle bin
   - [ ] Use file recovery software (last resort)
```

---

## 💡 KEY PRINCIPLES TO REMEMBER

> **"Never give false information. If you said the task is functional and fixed but in real it is not and there are a lot of issues, this destroys trust and wastes time."**

> **"Always test everything after making changes. Do not attempt blindly if you don't have clear picture."**

> **"Never implement anything without audit and clear understanding or without any audit report."**

> **"Each task/phase should be tested. If failed the test then stop and fix then again test. Move to the next phase only if it is passed."**

> **"You are overcomplicating it, giving fake information while it is not actually fixed" - Keep solutions simple and verify they actually work**

> **"I have been repeating some of these issues again and again. And you are not fixing them effectively. please focus on the main issues and fix them completely." - Listen to repeated feedback and fix root causes**

> **"CREATE ONE ENDPOINT → TEST IMMEDIATELY → VERIFY WORKS → THEN CREATE NEXT. Never batch-create backend routes without testing each one."**

> **"NEVER use Remove-Item with wildcards near project root. ALWAYS use exact paths. ALWAYS create git backup before deletions."**

> **"Every import needs a package. Check package.json BEFORE using any library. Run npm install immediately if missing."**

> **"Schema change = npx prisma generate. No exceptions. Verify types updated in IDE before continuing."**

> **"Dynamic route names MUST match at same level. [leadId] ≠ [bidId] will crash dev server. Plan route structure FIRST."**

---

## 🎯 SUCCESS CRITERIA

## 🧪 UI & E2E AUTOMATED TESTING (MANDATORY FROM DEC 1, 2025)

### Purpose
Eliminate "surprise" UI failures by enforcing deterministic, automated browser tests (Playwright) for every Bid Builder phase (import, STC auto-detection, tooltips, captions, budget hint, performance). Manual visual checks are STILL required, but automation becomes a gating signal before reporting completion.

### Framework Standard
- Preferred: Playwright + TypeScript (multi-browser, trace, screenshot, accessibility checks)
- Test Directory: `tests/e2e/`
- Config File: `playwright.config.ts`
- Base URL: `http://localhost:3000` (override with `E2E_BASE_URL`)
- Reports: HTML (`playwright-report/`) + traces on first retry
- Snapshots (visual): `tests/e2e/__screenshots__/` (baseline committed only after user approval)

### Minimum Required Test Suites (Bid Builder)
| Suite | Coverage |
|-------|----------|
| Import Workflow | Import button visibility, diff modal open, Accept action stamps meta.importedAt/importSource, prefilledFields populated |
| STC Auto-Zone | Postcode → zone populated, caption appears, manual override persists |
| Roof Tooltips | Hover/focus shows correct guidance for Orientation, Pitch, Shading (ARIA accessible) |
| Prefilled Captions | All expected fields show caption text when imported (system size, project type, roof fields, retail/FiT, STC postcode) |
| Budget Hint | Banner appears when total > max * 1.1; dismiss works; absent when below threshold |
| Regression / Smoke | Modal mounts without runtime errors, core summary numbers present, no console errors |

### Test Authoring Rules
1. One logical concern per `test()` block (avoid sprawling tests)
2. Use semantic locators (role, text) – NEVER brittle CSS selectors unless unavoidable.
3. After an action that mutates localStorage/state, assert resulting state AND UI.
4. If a feature depends on env/lead data, inject deterministic mock via dedicated test route (`/test/quote-builder`).
5. All newly added user-facing strings must appear in at least one assertion.
6. Every phase adds/updates tests BEFORE marking the phase complete.

### Gating Workflow Update
Replace former manual-only verification for UI work with:
```powershell
# Phase completion gate (ALL must pass):
npm run dev              # Ensure server running
npm run test:e2e         # Playwright test suite – MUST be green
npx tsc --noEmit         # 0 TypeScript errors
npm run build            # Production build succeeds
```
If any Playwright test fails → STOP → Fix → Re-run → Only proceed when green.

### New Mandatory Checklist Additions (Append to Step 5 VERIFY)
```markdown
- [ ] E2E tests added/updated for new UI behavior
- [ ] `npm run test:e2e` all green (no skipped critical tests)
- [ ] Playwright trace reviewed for flaky interactions (none)
- [ ] No unexpected console errors during test run
```

### Accessibility & Tooltip Standard
Tooltips must:
- Be reachable via keyboard focus (Info icon `tab` → tooltip visible)
- Contain descriptive text matching enhancement plan guidance
- Not rely solely on `hover` (Playwright uses `.hover()` + focus fallback)

### LocalStorage Verification Pattern
Use page evaluation to assert metadata after import:
```ts
const meta = await page.evaluate(() => {
   const raw = localStorage.getItem('quote:draft:TEST_LEAD_ID:installer-id');
   return raw ? JSON.parse(raw).meta : null;
});
expect(meta.importedAt).toBeTruthy();
expect(meta.importSource).toBe('instant-quote');
expect(meta.prefilledFields).toContain('pricing.stc.zone');
```

### Flakiness Prevention
- Avoid arbitrary `waitForTimeout`; prefer `await expect(locator).toBeVisible()`.
- Set deterministic mock data (no time-based random values)
- Never depend on external APIs in e2e tests (mock or isolate)

### CI Integration (Required Next Step)
- Add GitHub Action: `.github/workflows/e2e.yml` running `npm ci`, `npx playwright install --with-deps`, `npm run test:e2e`.
- Block merges if tests fail.

### Failure Reporting Format
```markdown
## E2E Test Failure Report
- Test: Import Workflow → should stamp metadata
- Failure: meta.importedAt undefined
- Root Cause: Accept handler missing timestamp assignment
- Fix: Add `importedAt = new Date().toISOString()` before save
- Status: FIXED → Re-run suite green
```

### Visual Regression (Phase 2 Optional Upgrade)
Introduce snapshot comparisons for key UI states (import modal open, post-import summary, budget banner). Baseline snapshots must be reviewed and explicitly approved before locking.

### Enforcement
ANY UI feature delivered without accompanying passing e2e test is considered INCOMPLETE.

### Transitional Exception (Current Work)
Initial Playwright suite may start with core Bid Builder flows; expand coverage each subsequent phase until full matrix achieved.

---

**A task is successful when:**

1. ✅ All tests pass (no failures)
2. ✅ No breaking changes to existing features
3. ✅ Code follows design system standards (verified via reference files)
4. ✅ All component dependencies verified
5. ✅ Honest, accurate reporting (no false "complete" claims)
6. ✅ User can verify results match expectations
7. ✅ System is in a deployable state

**If ANY criterion fails, task is NOT complete.**

---

**This guideline defines the universal process and principles for AI implementation. For detailed standards, always reference the appropriate documentation files listed in the "Reference Files" section.**
