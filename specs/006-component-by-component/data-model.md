# Data Model: Component-by-Component Migration

**Feature**: Component-by-Component Migration to Neumorphic Design System  
**Date**: 2025-11-01  
**Status**: Complete

---

## Overview

This is a **pure frontend refactoring feature** - no database models, API contracts, or backend changes required.

The "entities" in this feature are **tracking records** and **audit reports** (documentation artifacts, not database models).

---

## Entity 1: Component Audit Report

**Purpose**: Document all component logic before migration to ensure preservation

**Type**: Markdown documentation artifact (not stored in database)

**Location**: `specs/006-component-by-component/audits/[component-name]-logic.md`

### Fields/Sections

| Section | Type | Required | Description |
|---------|------|----------|-------------|
| **Component Name** | String | Yes | e.g., "InstantQuoteForm" |
| **File Path** | String | Yes | e.g., "src/components/InstantQuoteForm.tsx" |
| **Lines of Code** | Integer | Yes | Total LOC for scope estimation |
| **Violations Count** | Integer | Yes | Number of hardcoded classes found |
| **Risk Level** | Enum | Yes | HIGH / MEDIUM / LOW |
| **State Management** | List | Yes | All useState, useReducer, useContext calls |
| **Props Interface** | Object | Yes | TypeScript interface definition |
| **Event Handlers** | List | Yes | onClick, onChange, onSubmit, etc. |
| **Side Effects** | List | Yes | useEffect hooks, API calls, cleanup |
| **Conditional Logic** | List | Yes | if/else, ternary, && chains |
| **Form Validation** | Object | Optional | Validation rules, error handling (if form) |
| **Navigation** | List | Optional | router.push, Link components (if applicable) |
| **Logic Preservation Checklist** | List | Yes | Items marked ✅ Preserve or ❌ Replace |

### Example

```markdown
# Component Logic Audit: InstantQuoteForm

**File**: `src/components/InstantQuoteForm.tsx`  
**Lines**: 450  
**Violations**: 50+  
**Risk Level**: HIGH (complex form with validation + API calls)

## State Management

1. `email` (string) - User email input
2. `phone` (string) - User phone input
3. `address` (string) - Installation address
4. `systemSize` (number) - kW system size
5. `isLoading` (boolean) - Form submission state
6. `errors` (object) - Validation errors

## Event Handlers

- `handleInputChange(field, value)` - Updates state on input change
- `handleSubmit(e)` - Form submission, calls API
- `validateEmail(email)` - Email format validation
- `validatePhone(phone)` - Phone format validation

## Side Effects

- `useEffect` - Loads saved draft from localStorage on mount
- API Call: `POST /api/instant-quote` - Submits quote request

## Logic Preservation Checklist

- ✅ PRESERVE: All state variables
- ✅ PRESERVE: Form validation logic
- ✅ PRESERVE: API submission logic
- ✅ PRESERVE: Error handling
- ❌ REPLACE: className strings only
```

### Validation Rules

- **Must be created** before starting component migration
- **Must document** ALL functionality (not just some)
- **Must include** logic preservation checklist
- **Must be reviewed** before migration approval

---

## Entity 2: Migration Tracker Record

**Purpose**: Track status of each component migration

**Type**: Markdown table row (not stored in database)

**Location**: `specs/006-component-by-component/migration-tracker.md`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Component Name** | String | Yes | e.g., "InstantQuoteForm" |
| **Status** | Enum | Yes | ⏳ Not Started / 🚧 In Progress / ✅ Complete / ❌ Blocked |
| **Violations Before** | Integer | Yes | Count before migration |
| **Violations After** | Integer | Conditional | Count after migration (only when complete) |
| **Date Completed** | Date | Conditional | ISO date (only when complete) |
| **Commit Hash** | String | Conditional | Git commit SHA (only when complete) |
| **Notes** | String | Optional | Blockers, issues, special cases |

### Example

```markdown
| Component | Status | Violations Before | Violations After | Date | Commit | Notes |
|-----------|--------|-------------------|------------------|------|--------|-------|
| InstantQuoteForm | ✅ Complete | 50 | 0 | 2025-11-02 | abc123f | Used AuthInput for all fields |
| Hero | ✅ Complete | 6 | 0 | 2025-11-03 | def456a | Typography migration only |
| QuoteOptionsModal | 🚧 In Progress | 10 | - | - | - | Waiting for AuthButton variant |
| SimplifiedQuoteForm | ⏳ Not Started | 35 | - | - | - | - |
```

### Aggregations

**Overall Progress**:
- Components Migrated: `COUNT(Status = ✅ Complete) / TOTAL`
- Design System Compliance: `100% - (SUM(Violations After) / 285) * 100%`
- Total Violations Fixed: `SUM(Violations Before - Violations After WHERE Status = ✅)`

### Validation Rules

- Status MUST be updated after each component
- Violations After MUST be 0 (verified by script)
- Date and Commit MUST be filled when Status = ✅

---

## Entity 3: Verification Result

**Purpose**: Output from verification script checking for hardcoded classes

**Type**: Command-line output / JSON (not stored in database)

**Generated By**: Verification script (User Story 7)

### Fields

| Field | Type | Description |
|-------|------|-------------|
| **Component Name** | String | Component being verified |
| **File Path** | String | Full path to component file |
| **Total Violations** | Integer | Count of hardcoded classes found |
| **Violations by Type** | Object | Breakdown (colors, typography, spacing, etc.) |
| **Line Numbers** | Array | Lines where violations found |
| **Patterns Matched** | Array | Which regex patterns triggered |
| **Exit Code** | Integer | 0 = PASSED, 1 = FAILED |
| **Timestamp** | ISO DateTime | When verification ran |

### Example (PASSED)

```json
{
  "componentName": "InstantQuoteForm",
  "filePath": "src/components/InstantQuoteForm.tsx",
  "totalViolations": 0,
  "violationsByType": {
    "hardcodedColors": 0,
    "manualDarkMode": 0,
    "rawTypography": 0,
    "hardcodedSpacing": 0
  },
  "lineNumbers": [],
  "patternsMatched": [],
  "exitCode": 0,
  "timestamp": "2025-11-02T14:30:00Z",
  "message": "✅ PASSED: Zero hardcoded classes found"
}
```

### Example (FAILED)

```json
{
  "componentName": "QuoteOptionsModal",
  "filePath": "src/components/QuoteOptionsModal.tsx",
  "totalViolations": 3,
  "violationsByType": {
    "hardcodedColors": 2,
    "manualDarkMode": 1,
    "rawTypography": 0,
    "hardcodedSpacing": 0
  },
  "lineNumbers": [45, 67, 89],
  "patternsMatched": [
    "bg-slate-700 (line 45)",
    "text-slate-400 (line 67)",
    "dark:text-white (line 89)"
  ],
  "exitCode": 1,
  "timestamp": "2025-11-02T14:25:00Z",
  "message": "❌ FAILED: 3 hardcoded classes found"
}
```

### Usage

```bash
# Run verification on specific component
node scripts/verify-component.js src/components/InstantQuoteForm.tsx

# Exit code 0 = component passed (fully migrated)
# Exit code 1 = component failed (still has violations)
```

---

## State Transitions

### Component Migration Lifecycle

```
⏳ Not Started
    ↓
    [Create audit report]
    ↓
🚧 In Progress (audit complete, migration started)
    ↓
    [Complete migration]
    ↓
    [Run verification script]
    ↓
    ├─ EXIT CODE 0 (passed)
    │   ↓
    │   [Commit changes]
    │   ↓
    │   ✅ Complete
    │
    └─ EXIT CODE 1 (failed)
        ↓
        [Fix remaining violations]
        ↓
        [Re-run verification]
        ↓
        (loop until passed)
```

### Tracker Status Rules

1. **⏳ Not Started** → **🚧 In Progress**
   - Trigger: Audit report created
   - Requirement: audit exists in `audits/[component-name]-logic.md`

2. **🚧 In Progress** → **✅ Complete**
   - Trigger: Verification script returns exit code 0
   - Requirements:
     - Violations After = 0
     - Manual QA checklist passed
     - TypeScript validation passed
     - Build passed
     - Committed to git

3. **Any Status** → **❌ Blocked**
   - Trigger: Dependency or issue found
   - Requirement: Note must explain blocker

---

## Relationships

```
Component Audit Report (1) ─── migrates ──→ (1) Component File
                                                    │
                                                    │ verified by
                                                    ↓
                                            Verification Result
                                                    │
                                                    │ updates
                                                    ↓
                                            Migration Tracker Record
```

---

## No Database Schema Required

This feature does NOT require:
- ❌ Prisma schema changes
- ❌ Database migrations
- ❌ API endpoints
- ❌ Backend models

All entities are **documentation artifacts** stored in the spec folder or generated at runtime by scripts.

---

## Data Sources

### Input Data
- **Component Files**: `src/components/*.tsx` (existing React components)
- **Design System SOT**: `DOC/DESIGN-SYSTEM-SOT.md` (token reference)
- **Audit Report**: `DOC/DESIGN-SYSTEM-AUDIT-REPORT.md` (violation inventory)

### Output Data
- **Audit Reports**: `specs/006-component-by-component/audits/*.md` (generated)
- **Migration Tracker**: `specs/006-component-by-component/migration-tracker.md` (manually updated)
- **Verification Results**: Terminal output + optional JSON log (generated)

---

**Phase 1 Data Model Complete** ✅  
**Next**: Contracts (N/A for this feature) → Quickstart
