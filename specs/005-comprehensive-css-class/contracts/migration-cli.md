# Migration CLI Contract

**Feature**: 005-comprehensive-css-class  
**Component**: Migration Script (scripts/migrate-component.ts)

---

## Overview

CLI tool for migrating components to shadcn/ui with AST-based logic preservation.

---

## Command Signatures

### 1. Audit Component

Analyzes component logic before migration (FR-001b to FR-001f).

```bash
npm run migrate:audit <component-path>
```

**Arguments**:
- `<component-path>`: Relative path to component file (e.g., `src/components/Button.tsx`)

**Options**:
- `--output <path>`: Output file for audit report (default: `specs/005-comprehensive-css-class/logic-audit/[ComponentName].md`)
- `--format <type>`: Output format: `markdown` | `json` (default: `markdown`)

**Output**:
```markdown
# Component Logic Audit: Button

**File**: src/components/Button.tsx  
**Audit Date**: 2025-11-01 10:30:00  
**Risk Level**: Medium

## Props Interface
```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}
```

## State Variables
- `isHovered: boolean = false`
- `isFocused: boolean = false`

## Event Handlers
- `onClick: (e: React.MouseEvent) => void` (line 25)
- `onMouseEnter: () => void` (line 30)
- `onMouseLeave: () => void` (line 35)

## Effects
None detected

## API Calls
None detected

## Router Usage
None detected

## Conditional Rendering
- Line 45: `{loading ? <Spinner /> : children}` (ternary)
- Line 50: `{disabled && <DisabledOverlay />}` (logical-and)

## Preservation Checklist
- [ ] Preserve onClick handler
- [ ] Preserve onMouseEnter/onMouseLeave handlers
- [ ] Preserve loading state (isLoading)
- [ ] Preserve disabled prop logic
- [ ] Preserve variant styling logic
- [ ] Preserve size prop logic
- [ ] Test hover/focus states after migration
```

**Exit Codes**:
- `0`: Audit completed successfully
- `1`: Component file not found
- `2`: Parsing error (invalid TypeScript)

---

### 2. Migrate Component

Migrates component to shadcn/ui (FR-020 to FR-024).

```bash
npm run migrate:component <component-path>
```

**Arguments**:
- `<component-path>`: Relative path to component file (e.g., `src/components/Button.tsx`)

**Options**:
- `--dry-run`: Preview changes without writing to disk
- `--skip-backup`: Skip creating backup file (not recommended)
- `--auto-fix`: Automatically apply safe fixes (e.g., replace `bg-teal-600` with `bg-primary`)
- `--force`: Skip interactive prompts (for CI/CD)

**Interactive Prompts** (unless `--force`):
1. "Replace 15 instances of `bg-teal-600` with `bg-primary`? [Y/n]"
2. "Replace 8 instances of `text-2xl` with `text-heading-2`? [Y/n]"
3. "Replace 5 instances of `h-5 w-5` with `icon-md`? [Y/n]"
4. "Create backup at `src/components/Button.backup.tsx`? [Y/n]"

**Output**:
```
🔍 Analyzing src/components/Button.tsx...
✅ Logic audit completed (risk level: medium)

📋 Migration Plan:
  - Replace 15 instances of bg-teal-600 → bg-primary
  - Replace 8 instances of text-2xl → text-heading-2
  - Replace 5 instances of h-5 w-5 → icon-md
  - Preserve 3 event handlers (onClick, onMouseEnter, onMouseLeave)
  - Preserve 2 state variables (isHovered, isFocused)

💾 Creating backup at src/components/Button.backup.tsx...
✍️ Applying transformations...
✅ Migration completed!

📝 Next Steps:
  1. Run visual regression tests: npm run test:visual Button
  2. Run accessibility tests: npm run test:a11y Button
  3. Verify in Storybook: npm run storybook
  4. Update migration status: npm run migrate:track Button completed
```

**Exit Codes**:
- `0`: Migration completed successfully
- `1`: Component file not found
- `2`: Parsing error (invalid TypeScript)
- `3`: User cancelled migration
- `4`: Migration failed (backup restored)

---

### 3. Track Migration Status

Updates migration status in `migration-status.json` (FR-044).

```bash
npm run migrate:track <component-name> <status> [--verified-by <name>]
```

**Arguments**:
- `<component-name>`: Component name (e.g., `Button`)
- `<status>`: Status to set: `not-started` | `in-progress` | `completed` | `verified` | `exception`

**Options**:
- `--verified-by <name>`: Developer who verified the migration (required if status = "verified")
- `--notes <text>`: Additional notes (e.g., "Requires manual QA for hover states")

**Example**:
```bash
npm run migrate:track Button completed
npm run migrate:track Button verified --verified-by john.doe
npm run migrate:track ReactSelect exception --notes "Third-party library, cannot migrate"
```

**Output**:
```
✅ Updated migration status for Button: not-started → completed
📊 Overall progress: 15/33 components completed (45%)
```

**Exit Codes**:
- `0`: Status updated successfully
- `1`: Invalid status value
- `2`: Component not found in migration-status.json

---

### 4. Generate Progress Report

Generates migration progress report (FR-044).

```bash
npm run migrate:report
```

**Options**:
- `--format <type>`: Output format: `markdown` | `json` (default: `markdown`)
- `--output <path>`: Output file (default: `specs/005-comprehensive-css-class/progress-report.md`)

**Output**: See `data-model.md` > MigrationProgress example

**Exit Codes**:
- `0`: Report generated successfully
- `1`: No migration status data found

---

### 5. Rollback Migration

Restores component from backup (FR-024).

```bash
npm run migrate:rollback <component-path>
```

**Arguments**:
- `<component-path>`: Relative path to component file (e.g., `src/components/Button.tsx`)

**Interactive Prompt**:
```
⚠️ This will restore Button.tsx from Button.backup.tsx.
   Any changes made after migration will be lost.
   Continue? [y/N]
```

**Output**:
```
📂 Found backup: src/components/Button.backup.tsx (created 2025-11-01 10:30:00)
↩️ Restoring backup...
✅ Rollback completed!
🗑️ Backup file retained for manual review
```

**Exit Codes**:
- `0`: Rollback completed successfully
- `1`: Component file not found
- `2`: Backup file not found
- `3`: User cancelled rollback

---

### 6. Validate Classes

Checks for hardcoded/non-semantic classes (FR-040, FR-061).

```bash
npm run migrate:validate [component-path]
```

**Arguments**:
- `[component-path]`: Optional. If omitted, validates entire codebase

**Options**:
- `--fix`: Automatically fix safe violations (e.g., `bg-teal-600` → `bg-primary`)
- `--ci`: Exit with error code if violations found (for CI/CD)

**Output**:
```
🔍 Scanning src/components/ for className violations...

❌ Found 12 violations:

src/components/Button.tsx:15
  ❌ bg-teal-600 (hardcoded color)
  ✅ Suggested fix: bg-primary

src/components/Card.tsx:23
  ❌ text-2xl font-bold (raw typography)
  ✅ Suggested fix: text-heading-2

src/components/Icon.tsx:8
  ❌ h-5 w-5 (hardcoded size)
  ✅ Suggested fix: icon-md

✅ Auto-fixable: 10/12
⚠️ Manual review required: 2/12
```

**Exit Codes**:
- `0`: No violations found (or all fixed with `--fix`)
- `1`: Violations found (in CI mode with `--ci`)
- `2`: Invalid component path

---

## TypeScript API

For programmatic usage in other scripts:

```typescript
import { auditComponent, migrateComponent, validateClasses } from "./scripts/migrate-component";

// Audit
const audit = await auditComponent("src/components/Button.tsx");
console.log(audit.riskLevel); // "low" | "medium" | "high"

// Migrate
await migrateComponent("src/components/Button.tsx", {
  dryRun: false,
  skipBackup: false,
  autoFix: true,
  force: false
});

// Validate
const violations = await validateClasses("src/components/Button.tsx");
console.log(`Found ${violations.length} violations`);
```

---

## Error Handling

All commands output errors to stderr and return appropriate exit codes:

```typescript
// Example error output
process.stderr.write("❌ Error: Component file not found: src/components/Missing.tsx\n");
process.exit(1);
```

**Error Categories**:
1. **File Not Found** (exit code 1): Component file doesn't exist
2. **Parse Error** (exit code 2): Invalid TypeScript syntax
3. **User Cancelled** (exit code 3): User aborted interactive prompt
4. **Migration Failed** (exit code 4): AST transformation failed, backup restored

---

## Pre-Commit Hook Integration

Pre-commit hook validates className usage (FR-061):

```json
// .husky/pre-commit
npm run migrate:validate --ci
```

If violations found, commit is blocked:
```
❌ Pre-commit validation failed!
   Found 3 className violations in staged files.
   Run 'npm run migrate:validate --fix' to auto-fix.
```

**Performance**: Validation must complete in <3 seconds (SC-027).

---

## CI/CD Integration

GitHub Actions workflow for automated validation:

```yaml
# .github/workflows/css-audit.yml
name: CSS Class Validation
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run migrate:validate --ci
```

---

**Contract Status**: ✅ Complete  
**Next**: Generate shadcn component API documentation
