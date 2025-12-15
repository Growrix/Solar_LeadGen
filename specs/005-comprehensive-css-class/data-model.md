# Data Model: Comprehensive CSS Class Audit & Standardization

**Feature**: 005-comprehensive-css-class  
**Date**: 2025-10-30

---

## Overview

This feature does not introduce new database entities (UI-only migration). This document defines the data structures used for migration tracking, audit reporting, and configuration management.

---

## 1. Migration Status Tracking

### MigrationStatus

Tracks the migration state of each component (file-based or in-memory).

```typescript
interface MigrationStatus {
  componentName: string; // e.g., "Button", "SignInModal"
  filePath: string; // Absolute path to component file
  status: "not-started" | "in-progress" | "completed" | "verified" | "exception";
  priority: "P0" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8" | "P9" | "P10";
  migrationDate?: Date; // When migration was completed
  migratedBy?: string; // Developer who migrated
  logicPreservationChecklist: LogicChecklistItem[];
  testingStatus: {
    visualRegression: "pending" | "passed" | "failed";
    accessibility: "pending" | "passed" | "failed";
    interaction: "pending" | "passed" | "failed";
  };
  notes?: string; // Any special considerations
}

interface LogicChecklistItem {
  item: string; // e.g., "Preserve onClick handler"
  verified: boolean; // Has developer confirmed this works?
  verifiedDate?: Date;
  verifiedBy?: string;
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/migration-status.json`

**Example**:
```json
{
  "components": [
    {
      "componentName": "Button",
      "filePath": "src/components/Button.tsx",
      "status": "completed",
      "priority": "P3",
      "migrationDate": "2025-11-01T10:30:00Z",
      "migratedBy": "john.doe",
      "logicPreservationChecklist": [
        { "item": "Preserve onClick handler", "verified": true, "verifiedDate": "2025-11-01T11:00:00Z" },
        { "item": "Preserve loading state", "verified": true, "verifiedDate": "2025-11-01T11:00:00Z" },
        { "item": "Preserve disabled condition", "verified": true, "verifiedDate": "2025-11-01T11:00:00Z" }
      ],
      "testingStatus": {
        "visualRegression": "passed",
        "accessibility": "passed",
        "interaction": "passed"
      }
    }
  ]
}
```

---

## 2. Audit Report Structures

### CSSClassAudit

Result of scanning codebase for className usage (FR-001 to FR-009).

```typescript
interface CSSClassAudit {
  scanDate: Date;
  filesScanned: number;
  totalClassNames: number;
  uniqueClassNames: number;
  categories: ClassCategory[];
}

interface ClassCategory {
  name: "button" | "icon" | "form" | "card" | "typography" | "layout" | "utility";
  classes: CSSClassPattern[];
}

interface CSSClassPattern {
  className: string; // e.g., "bg-teal-600", "text-2xl"
  usageCount: number; // How many times it appears
  fileLocations: FileLocation[]; // Where it's used
  consistencyStatus: "consistent" | "inconsistent" | "industry-standard-violation";
  explanation: string; // Why it's flagged
  recommendedReplacement: string; // e.g., "bg-primary", "text-heading-2"
}

interface FileLocation {
  filePath: string;
  lineNumber: number;
  context: string; // 50 chars before/after for context
}
```

**Storage**: Markdown file at `specs/005-comprehensive-css-class/audit-report.md`

**Example**:
```markdown
## Button Classes (23 unique classes found)

### ❌ Inconsistent: `bg-teal-600`
- **Usage Count**: 15
- **Status**: Industry Standard Violation (hardcoded color)
- **Explanation**: Hardcoded Tailwind color bypasses design token system
- **Recommended Replacement**: `bg-primary`
- **File Locations**:
  - `src/components/Button.tsx:15` - `<button className="bg-teal-600 hover:bg-teal-700">`
  - `src/components/CTAButton.tsx:8` - `<div className="bg-teal-600 rounded-lg">`
  - ... (13 more)
```

---

### ComponentLogicAudit

Result of AST-based component analysis (FR-001b to FR-001f).

```typescript
interface ComponentLogicAudit {
  componentName: string;
  filePath: string;
  auditDate: Date;
  propsInterface?: string; // TypeScript interface as string
  stateVariables: StateVariable[];
  eventHandlers: EventHandler[];
  effects: Effect[];
  apiCalls: APICall[];
  routerUsage: RouterUsage[];
  conditionalRendering: ConditionalRender[];
  riskLevel: "low" | "medium" | "high";
  preservationChecklist: string[]; // Generated checklist items
}

interface StateVariable {
  name: string; // e.g., "isLoading"
  type: string; // e.g., "boolean"
  initialValue?: string; // e.g., "false"
}

interface EventHandler {
  name: string; // e.g., "onClick", "onChange"
  type: string; // e.g., "() => void", "(e: ChangeEvent) => void"
  lineNumber: number;
}

interface Effect {
  dependencies: string[]; // e.g., ["userId", "isAuthenticated"]
  hasCleanup: boolean; // Does it return a cleanup function?
  lineNumber: number;
}

interface APICall {
  method: string; // e.g., "fetch", "axios.post"
  endpoint: string; // e.g., "/api/users"
  lineNumber: number;
}

interface RouterUsage {
  method: string; // e.g., "router.push", "useRouter"
  path?: string; // e.g., "/dashboard"
  lineNumber: number;
}

interface ConditionalRender {
  condition: string; // First 100 chars of condition
  lineNumber: number;
  type: "ternary" | "logical-and" | "if-statement";
}
```

**Storage**: Markdown files at `specs/005-comprehensive-css-class/logic-audit/[ComponentName].md`

---

## 3. Exception Records

### ComponentException

Documents components that cannot be migrated to shadcn/ui (FR-045, FR-063).

```typescript
interface ComponentException {
  componentName: string;
  filePath: string;
  reason: "third-party" | "custom-animation" | "performance" | "design-requirement" | "other";
  justification: string; // Detailed explanation
  workaround?: string; // How to style it (wrapper, etc.)
  approvedBy: string; // Design lead, tech lead
  approvalDate: Date;
  revisitDate?: Date; // When to reconsider migration
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/exceptions.json`

**Example**:
```json
{
  "exceptions": [
    {
      "componentName": "ReactSelect",
      "filePath": "node_modules/react-select",
      "reason": "third-party",
      "justification": "React Select is a third-party library that cannot be replaced with shadcn/ui. Provides multi-select, async search, and custom rendering that shadcn Select doesn't support.",
      "workaround": "Wrap with custom styling using shadcn design tokens: <div className='[&_.react-select\_\_control]:bg-card [&_.react-select\_\_control]:border-border'>",
      "approvedBy": "tech-lead@example.com",
      "approvalDate": "2025-11-05T14:00:00Z"
    }
  ]
}
```

---

## 4. Configuration Entities

### NamingConventionRule

Defines allowed className patterns (FR-010 to FR-019).

```typescript
interface NamingConventionRule {
  category: "color" | "spacing" | "typography" | "shadow" | "border" | "animation";
  rule: string; // Description of the rule
  allowedPatterns: string[]; // Regex patterns for valid classes
  forbiddenPatterns: string[]; // Regex patterns for invalid classes
  examples: {
    correct: string[];
    incorrect: string[];
  };
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/naming-convention.json`

**Example**:
```json
{
  "rules": [
    {
      "category": "color",
      "rule": "Use semantic color tokens only (bg-primary, text-foreground)",
      "allowedPatterns": [
        "^bg-(primary|secondary|destructive|muted|accent|card|background)$",
        "^text-(foreground|muted-foreground|primary-foreground)$",
        "^border-(border|input|ring)$"
      ],
      "forbiddenPatterns": [
        "^bg-(red|blue|green|teal|slate)-(\\d{3})$",
        "^text-(red|blue|green|teal|slate)-(\\d{3})$"
      ],
      "examples": {
        "correct": ["bg-primary", "text-foreground", "border-border"],
        "incorrect": ["bg-teal-600", "text-blue-500", "border-slate-700"]
      }
    },
    {
      "category": "typography",
      "rule": "Use semantic typography tokens (text-heading-1, text-body)",
      "allowedPatterns": [
        "^text-heading-[1-4]$",
        "^text-(body|body-large|body-small|caption|label|button)$"
      ],
      "forbiddenPatterns": [
        "^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$",
        "^font-(normal|medium|semibold|bold)$",
        "^leading-(none|tight|snug|normal|relaxed|loose)$"
      ],
      "examples": {
        "correct": ["text-heading-1", "text-body", "text-caption"],
        "incorrect": ["text-2xl", "font-bold", "leading-relaxed"]
      }
    }
  ]
}
```

---

### TypographyTokenMapping

Maps semantic typography tokens to Tailwind utilities (FR-026 to FR-031).

```typescript
interface TypographyToken {
  tokenName: string; // e.g., "text-heading-1"
  semanticHTML: string[]; // e.g., ["h1"]
  fontSize: {
    mobile: string; // e.g., "24px"
    tablet: string; // e.g., "30px"
    desktop: string; // e.g., "36px"
  };
  fontWeight: string; // e.g., "700" (bold)
  lineHeight: string; // e.g., "1.25"
  letterSpacing: string; // e.g., "-0.025em"
  usage: string; // When to use this token
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/typography-tokens.json`

**Example**:
```json
{
  "tokens": [
    {
      "tokenName": "text-heading-1",
      "semanticHTML": ["h1"],
      "fontSize": {
        "mobile": "24px",
        "tablet": "30px",
        "desktop": "36px"
      },
      "fontWeight": "700",
      "lineHeight": "1.25",
      "letterSpacing": "-0.025em",
      "usage": "Primary page headings (h1). Largest text on page."
    },
    {
      "tokenName": "text-body",
      "semanticHTML": ["p", "div", "span"],
      "fontSize": {
        "mobile": "14px",
        "tablet": "16px",
        "desktop": "16px"
      },
      "fontWeight": "400",
      "lineHeight": "1.5",
      "letterSpacing": "0",
      "usage": "Default body text. Most common text style."
    }
  ]
}
```

---

### IconSizeScale

Defines semantic icon sizes (FR-037).

```typescript
interface IconSize {
  name: string; // e.g., "icon-sm", "icon-md"
  className: string; // e.g., "h-4 w-4"
  pixelSize: string; // e.g., "16px"
  usage: string; // When to use this size
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/icon-sizes.json`

**Example**:
```json
{
  "sizes": [
    { "name": "icon-xs", "className": "h-3 w-3", "pixelSize": "12px", "usage": "Badge icons" },
    { "name": "icon-sm", "className": "h-4 w-4", "pixelSize": "16px", "usage": "Button icons" },
    { "name": "icon-md", "className": "h-5 w-5", "pixelSize": "20px", "usage": "Card icons" },
    { "name": "icon-lg", "className": "h-6 w-6", "pixelSize": "24px", "usage": "Header icons" },
    { "name": "icon-xl", "className": "h-8 w-8", "pixelSize": "32px", "usage": "Hero icons" }
  ]
}
```

---

### AnimationTokens

Defines animation duration tokens (FR-038, User Story 9).

```typescript
interface AnimationToken {
  name: string; // e.g., "duration-fast"
  className: string; // e.g., "duration-150"
  milliseconds: number; // e.g., 150
  usage: string; // When to use this duration
}
```

**Storage**: JSON file at `specs/005-comprehensive-css-class/animation-tokens.json`

**Example**:
```json
{
  "durations": [
    { "name": "duration-fast", "className": "duration-150", "milliseconds": 150, "usage": "Quick feedback (hover, focus)" },
    { "name": "duration-normal", "className": "duration-200", "milliseconds": 200, "usage": "Standard transitions (buttons, cards)" },
    { "name": "duration-slow", "className": "duration-300", "milliseconds": 300, "usage": "Complex animations (modals, accordions)" }
  ],
  "transitions": [
    { "name": "transition-colors", "usage": "Color changes (hover states)" },
    { "name": "transition-shadow", "usage": "Shadow changes (elevation)" },
    { "name": "transition-transform", "usage": "Position/scale changes (modals)" },
    { "name": "transition-opacity", "usage": "Fade in/out effects" }
  ]
}
```

---

## 5. Progress Tracking

### MigrationProgress

Aggregated view of migration status (FR-044).

```typescript
interface MigrationProgress {
  generatedDate: Date;
  totalComponents: number;
  componentsByStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
    verified: number;
    exception: number;
  };
  componentsByPriority: {
    [key: string]: { // "P0", "P1", etc.
      total: number;
      completed: number;
      percentComplete: number;
    };
  };
  hardcodedClassesRemaining: number; // From validation script
  filesPendingReview: string[]; // List of file paths
  estimatedCompletionDate?: Date; // Based on current velocity
}
```

**Storage**: Markdown report at `specs/005-comprehensive-css-class/progress-report.md`

**Example**:
```markdown
# Migration Progress Report

**Generated**: 2025-11-15 14:30:00  
**Overall Progress**: 45% (15/33 components completed)

## Status Breakdown
- ✅ Completed: 15 (45%)
- 🚧 In Progress: 5 (15%)
- ⏸️ Not Started: 10 (30%)
- ✓ Verified: 2 (6%)
- ⚠️ Exception: 1 (3%)

## Priority Breakdown
| Priority | Total | Completed | % Complete |
|----------|-------|-----------|------------|
| P0 (Foundation) | 1 | 1 | 100% ✅ |
| P1 (MVP) | 1 | 1 | 100% ✅ |
| P2 (Convention) | 1 | 1 | 100% ✅ |
| P3 (Buttons) | 3 | 3 | 100% ✅ |
| P4 (Icons) | 5 | 4 | 80% 🚧 |
| P5 (Forms) | 8 | 3 | 38% 🚧 |
| P6 (Cards) | 6 | 2 | 33% ⏸️ |
| P7 (Modals) | 4 | 0 | 0% ⏸️ |
| P8 (Typography) | 2 | 0 | 0% ⏸️ |
| P9 (Animations) | 1 | 0 | 0% ⏸️ |
| P10 (Tracking) | 1 | 0 | 0% ⏸️ |

## Remaining Work
- **Hardcoded classes**: 47 instances remaining (down from 215)
- **Files pending review**: 18 files need code review before merge
- **Estimated completion**: 2025-12-01 (2 weeks at current velocity)
```

---

## 6. Relationships

```
MigrationStatus (per component)
  ├── LogicChecklistItem[] (what to preserve)
  ├── TestingStatus (visual/a11y/interaction)
  └── References ComponentLogicAudit

ComponentLogicAudit (per component)
  ├── StateVariable[]
  ├── EventHandler[]
  ├── Effect[]
  ├── APICall[]
  ├── RouterUsage[]
  └── ConditionalRender[]

CSSClassAudit (codebase-wide)
  └── ClassCategory[]
      └── CSSClassPattern[]
          └── FileLocation[]

ComponentException (per exception)
  └── Referenced by MigrationStatus (if status = "exception")

NamingConventionRule (shared config)
  └── Used by ValidationScript to check classes

TypographyTokenMapping (shared config)
  └── Referenced by MigrationScript to replace typography classes

IconSizeScale (shared config)
  └── Referenced by MigrationScript to standardize icon sizes

AnimationTokens (shared config)
  └── Referenced by MigrationScript to replace transition-all

MigrationProgress (aggregated report)
  └── Aggregates data from MigrationStatus[]
```

---

## Storage Strategy

### File-Based Storage
- **Migration Status**: `migration-status.json` (single file, all components)
- **CSS Class Audit**: `audit-report.md` (markdown for readability)
- **Component Logic Audits**: `logic-audit/[ComponentName].md` (one file per component)
- **Exceptions**: `exceptions.json` (single file, all exceptions)
- **Progress Reports**: `progress-report.md` (regenerated on demand)

### Configuration Files
- **Naming Convention**: `naming-convention.json`
- **Typography Tokens**: `typography-tokens.json`
- **Icon Sizes**: `icon-sizes.json`
- **Animation Tokens**: `animation-tokens.json`

All files stored in `specs/005-comprehensive-css-class/` directory for feature isolation.

---

## Validation Rules

1. **MigrationStatus**: Component cannot be marked "completed" until all LogicChecklistItems are verified
2. **MigrationStatus**: Component cannot be marked "verified" until all testingStatus items are "passed"
3. **ComponentException**: Must have approvedBy and approvalDate before marking as "exception"
4. **CSSClassPattern**: recommendedReplacement must be in NamingConventionRule allowedPatterns
5. **TypographyToken**: semanticHTML must match tokenName (e.g., h1 → text-heading-1)

---

**Data Model Status**: ✅ Complete  
**Next**: Generate API contracts in `contracts/` directory
