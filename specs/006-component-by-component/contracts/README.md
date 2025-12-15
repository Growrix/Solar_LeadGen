# API Contracts

**Feature**: Component-by-Component Migration to Neumorphic Design System  
**Date**: 2025-11-01

---

## No API Contracts Required

This feature is a **pure frontend refactoring** with zero backend changes.

### Why No Contracts?

- **No New Endpoints**: Not creating any API routes
- **No Modified Endpoints**: Not changing existing API contracts
- **No Data Models**: Not touching database schema
- **No External APIs**: Not integrating with third-party services

### What Changes?

**Frontend Only**:
- Component className strings (`bg-slate-700` → `bg-surface`)
- Component imports (inline styles → centralized components)
- CSS class usage (hardcoded → design tokens)

**Unchanged**:
- ✅ API request/response formats
- ✅ Database queries
- ✅ Authentication flows
- ✅ Data validation
- ✅ Business logic

---

## Component "Contracts" (Internal)

While there are no API contracts, components do have **internal contracts** (props interfaces) that must be preserved:

### Example: InstantQuoteForm

**Current Props** (MUST preserve):
```typescript
interface InstantQuoteFormProps {
  onSubmit?: (data: QuoteData) => void;
  initialValues?: Partial<QuoteData>;
  className?: string;
}
```

**Migration Rule**: Props interfaces MUST NOT change during className migration.

---

## Verification "Contract"

The verification script has an implicit contract:

### Input
- File path to component (string)

### Output
```typescript
interface VerificationResult {
  componentName: string;
  filePath: string;
  totalViolations: number;
  violationsByType: {
    hardcodedColors: number;
    manualDarkMode: number;
    rawTypography: number;
    hardcodedSpacing: number;
  };
  lineNumbers: number[];
  patternsMatched: string[];
  exitCode: 0 | 1;  // 0 = passed, 1 = failed
  timestamp: string; // ISO 8601
  message: string;
}
```

### Exit Codes
- `0`: Component fully migrated (zero violations found)
- `1`: Component has violations (migration incomplete)

---

**Phase 1 Contracts Complete** ✅ (N/A documented)  
**Next**: Quickstart Guide
