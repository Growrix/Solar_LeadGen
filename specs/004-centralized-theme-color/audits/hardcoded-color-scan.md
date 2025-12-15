# Hardcoded Color Scan Report

**Date**: 2025-10-28  
**Phase**: 12 (US5 - Legacy Color Migration)  
**Scanner**: Automated grep search for `#hex`, `rgb()`, `rgba()`, `hsl()`, `hsla()` patterns

---

## Executive Summary

**Total Matches**: 200+ hardcoded color values found in `src/` directory  
**Primary Categories**:
1. ✅ **Design Tokens** (src/design-tokens/) - 150+ matches - **KEEP AS-IS** (hex values in primitives are intentional)
2. ⚠️ **Legacy Theme File** (src/lib/theme/colors.ts) - 50+ matches - **HIGH PRIORITY** for migration (duplicate of design tokens)
3. 🔴 **Application Code** (components/, hooks/, services/) - **CRITICAL** for migration:
   - Email templates (notification-service.ts, sendgrid.ts)
   - Chart components (SavingsChart.tsx, useChartColors.ts)
   - Navigation bars with hardcoded shadows
   - Google OAuth icon with brand colors

---

## Category 1: Design Tokens (✅ KEEP AS-IS)

### Files: src/design-tokens/**
- **primitives/colors.ts**: 100+ hex values (white, black, gray[50-950], teal[50-950], amber[50-950], green[50-950], yellow[50-950], red[50-950], blue[50-950])
- **semantic/shadows.ts**: 20+ rgba values for shadow definitions (intentional)
- **themes/index.ts**: 40+ hex values in defaultTheme comments
- **themes/client-blue.ts**: 10+ hex values in clientBlueTheme comments
- **types.ts**: Documentation examples with hex values

**Decision**: ✅ **NO ACTION REQUIRED** - These are the *source of truth* for color values. Hex codes here are intentional and necessary.

---

## Category 2: Legacy Theme File (⚠️ HIGH PRIORITY)

### File: `src/lib/theme/colors.ts` (~180 lines)

**Issue**: This file is a **DUPLICATE** of the new design token system. It defines:
- `brand.primary` (teal-500, teal-600, teal-700) - DUPLICATES `primitives.teal`
- `brand.secondary` (amber-300, amber-400, amber-500) - DUPLICATES `primitives.amber`
- `semantic` colors (success, warning, error, info) - DUPLICATES `semantic/colors.ts`
- `charts` colors (savings, cost, roi, loss, projection) - DUPLICATES `semantic/colors.ts`
- `slate` scale - DUPLICATES `primitives.gray`
- WCAG contrast ratios - Documented separately in validation reports

**Hardcoded Values Found**:
```typescript
// Brand colors (lines 24-31)
light: '#14b8a6',    // teal-500
DEFAULT: '#0d9488',  // teal-600
dark: '#0f766e',     // teal-700
light: '#fcd34d',    // amber-300
DEFAULT: '#fbbf24',  // amber-400
dark: '#f59e0b',     // amber-500

// Semantic colors (lines 41-58)
success.light: '#34d399',    // green-400
success.DEFAULT: '#10b981',  // green-500
success.dark: '#059669',     // green-600
warning.light: '#fbbf24',    // amber-400
warning.DEFAULT: '#f59e0b',  // amber-500
warning.dark: '#d97706',     // amber-600
error.light: '#f87171',      // red-400
error.DEFAULT: '#ef4444',    // red-500
error.dark: '#dc2626',       // red-600
info.light: '#60a5fa',       // blue-400
info.DEFAULT: '#3b82f6',     // blue-500
info.dark: '#2563eb',        // blue-600

// Chart colors (lines 67-71)
savings: '#10b981',    // green-500
cost: '#0D9488',       // teal-600
roi: '#14b8a6',        // teal-500
loss: '#ef4444',       // red-500
projection: '#94a3b8', // slate-400

// Slate scale (lines 80-90)
50: '#f8fafc',
100: '#f1f5f9',
200: '#e2e8f0',
300: '#cbd5e1',
400: '#94a3b8',
500: '#64748b',
600: '#475569',
700: '#334155',
800: '#1e293b',
900: '#0f172a',
950: '#020617',

// WCAG contrast ratios (lines 168-176)
primary: { text: '#0d9488', bg: '#ffffff' },      // 4.8:1
text: { text: '#0F172A', bg: '#ffffff' },         // 14.3:1
secondary: { text: '#f59e0b', bg: '#ffffff' },    // 3.2:1
primary: { text: '#14b8a6', bg: '#0f172a' },      // 5.1:1
text: { text: '#E2E8F0', bg: '#0f172a' },         // 12.1:1
secondary: { text: '#fbbf24', bg: '#0f172a' },    // 8.2:1
```

**Migration Strategy**:
1. **Search for imports**: Find all files importing from `src/lib/theme/colors.ts`
2. **Replace imports**: Change to `@/design-tokens` (primitives or semantic)
3. **Update references**: 
   - `colors.brand.primary` → `primitives.teal[600]` or `semantic.primary`
   - `colors.semantic.success` → `semantic.success`
   - `colors.charts.savings` → `semantic.chart.savings`
4. **Delete file**: Remove `src/lib/theme/colors.ts` after all migrations complete

**Priority**: 🔴 **HIGH** - This file creates confusion and duplicates design tokens

---

## Category 3: Application Code (🔴 CRITICAL)

### 3.1 Email Templates

#### File: `src/lib/services/notification-service.ts` (lines 126-134)

**Hardcoded Colors**:
```typescript
<h2 style="color: #2563eb;">${data.title}</h2>
<p style="color: #374151; line-height: 1.6;">${data.message}</p>
<a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
```

**Migration Plan**:
- **Issue**: Inline styles in email HTML (can't use Tailwind classes)
- **Solution**: Create email template constants in `src/design-tokens/email-styles.ts`
```typescript
export const emailStyles = {
  heading: (theme: 'light' | 'dark') => `color: ${theme === 'light' ? primitives.blue[600] : primitives.blue[400]};`,
  body: (theme: 'light' | 'dark') => `color: ${theme === 'light' ? primitives.gray[700] : primitives.gray[300]}; line-height: 1.6;`,
  button: (theme: 'light' | 'dark') => `background-color: ${theme === 'light' ? primitives.blue[600] : primitives.blue[500]}; color: white;`,
  divider: (theme: 'light' | 'dark') => `border-top: 1px solid ${theme === 'light' ? primitives.gray[200] : primitives.gray[700]};`,
  footer: (theme: 'light' | 'dark') => `color: ${theme === 'light' ? primitives.gray[600] : primitives.gray[400]}; font-size: 14px;`,
};
```

**Priority**: 🟡 **MEDIUM** - Emails work but don't rebrand with theme changes

---

#### File: `src/lib/sendgrid.ts` (line 251)

**Hardcoded Colors**:
```typescript
<blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0;">
```

**Migration Plan**: Use `primitives.gray[300]` or `semantic.border`

**Priority**: 🟢 **LOW** - Single hardcoded value in blockquote style

---

### 3.2 Chart Components

#### File: `src/components/SavingsChart.tsx` (lines 114-125, 141, 145)

**Hardcoded Colors**:
```typescript
// Gradient definitions (lines 114-115)
<stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
<stop offset="95%" stopColor="#10b981" stopOpacity={0}/>

// Grid and reference lines (lines 118, 123-124)
<CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
<ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
<ReferenceLine x={`Year ${breakEvenYear}`} stroke="#0D9488" label={{ value: 'Break-even Point', position: 'insideTopLeft', fill: '#0D9488' }} />

// Area/Bar fills (lines 125, 141, 145)
<Area type="monotone" dataKey="Net Savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" />
<CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
<Bar dataKey="Annual Cost" fill="#0D9488" radius={[4, 4, 0, 0]} />
```

**Migration Plan**:
1. Import `useChartColors()` hook (already exists!)
2. Replace hardcoded values:
   - `#10b981` → `chartColors.savings` (green-500)
   - `#0D9488` → `chartColors.cost` (teal-600)
   - `rgba(100, 116, 139, 0.2)` → `chartColors.grid` (slate-400 with opacity)
   - `#64748b` → `chartColors.gridLine` (slate-500)

**Priority**: 🔴 **HIGH** - Charts are critical UI components, visible on dashboards

---

#### File: `src/hooks/useChartColors.ts` (line 59)

**Hardcoded Colors**:
```typescript
end: isDark ? 'rgba(13, 148, 136, 0.1)' : 'rgba(13, 148, 136, 0.05)', // Faded primary
```

**Migration Plan**: Use `semantic.primary` with opacity utility
```typescript
import { primitives } from '@/design-tokens';
end: isDark ? `${primitives.teal[600]}1A` : `${primitives.teal[600]}0D`, // 10% and 5% opacity
```

**Priority**: 🟡 **MEDIUM** - Hook already imported in charts, fix will propagate automatically

---

### 3.3 Navigation Bars

#### Files:
- `src/components/InstallerBottomNavBar.tsx` (line 102)
- `src/components/HomeownerBottomNavBar.tsx` (line 49)
- `src/components/GuestBottomNavBar.tsx` (line 76)

**Hardcoded Colors** (all 3 files have identical shadow):
```typescript
shadow-[0_-2px_10px_rgba(0,0,0,0.1)]
```

**Migration Plan**:
1. Add `shadow-modal` to semantic shadows (already exists as `modal` shadow)
2. Replace with: `shadow-modal` or create custom `shadow-bottom-nav` semantic token
3. Alternative: Use arbitrary value with semantic reference: `shadow-[0_-2px_10px_rgba(var(--shadow-color-modal))]`

**Priority**: 🟡 **MEDIUM** - Minor shadow styling, but used in 3 components (update all 3 for consistency)

---

### 3.4 Google OAuth Icon

#### File: `src/components/HomeownerSignInModal.tsx` (line 11)

**Hardcoded Colors** (Google brand colors in SVG):
```typescript
fill="#4285F4"  // Google Blue
fill="#34A853"  // Google Green
fill="#FBBC05"  // Google Yellow/Orange
fill="#EA4335"  // Google Red
```

**Migration Plan**: ❌ **NO ACTION** - These are **Google's official brand colors**. Do NOT change to match SolarMatch theme. OAuth buttons must use provider's exact colors for brand recognition and user trust.

**Priority**: ✅ **IGNORE** - Intentional third-party brand colors

---

## Migration Priority Matrix

### Priority 1 (🔴 HIGH - Week 1, Days 1-3)
1. **src/lib/theme/colors.ts** - Find all imports, migrate to design tokens, delete file
2. **src/components/SavingsChart.tsx** - Migrate chart colors to `useChartColors()` hook
3. **src/hooks/useChartColors.ts** - Fix hardcoded teal rgba values

### Priority 2 (🟡 MEDIUM - Week 1, Days 4-5)
4. **src/lib/services/notification-service.ts** - Create email template styles, migrate inline styles
5. **Navigation bars** (3 files) - Migrate shadow to semantic token

### Priority 3 (🟢 LOW - Week 2, Day 1)
6. **src/lib/sendgrid.ts** - Migrate blockquote border color

### Excluded (✅ NO ACTION)
- **Design token files** (src/design-tokens/**) - Intentional hex values
- **Google OAuth icon** (src/components/HomeownerSignInModal.tsx) - Third-party brand colors

---

## File Dependency Analysis

### Files Importing `src/lib/theme/colors.ts`

**Need to run search**:
```bash
grep -r "from.*lib/theme/colors" src/
grep -r "import.*colors.*from.*theme" src/
```

**Expected imports**:
- Chart components (SavingsChart.tsx, CostAnalysisChart.tsx, ROIChart.tsx, etc.)
- Dashboard pages (admin/dashboard, homeowner/dashboard, installer/dashboard)
- Utility functions (color-utils.ts, theme-utils.ts)
- Hook files (useChartColors.ts, useThemeColors.ts)

**Migration Steps** (for each file):
1. Find import statement: `import { colors } from '@/lib/theme/colors'`
2. Replace with design token imports:
   ```typescript
   import { primitives, semantic } from '@/design-tokens'
   ```
3. Update references:
   - `colors.brand.primary` → `primitives.teal[600]` or `semantic.primary`
   - `colors.semantic.success` → `semantic.success`
   - `colors.charts.savings` → `semantic.chart.savings` (if exists) or `primitives.green[500]`
4. Test component in Storybook
5. Verify Light/Dark theme switching works
6. Commit with message: "Migrate [ComponentName] from legacy colors to design tokens"

---

## Automated Migration Script (Optional)

### Tool: `scripts/migrate-colors.ts`

**Purpose**: Automate find-and-replace for common patterns

```typescript
const migrations = [
  // Legacy theme colors → Primitives
  { from: /colors\.brand\.primary\.DEFAULT/g, to: 'primitives.teal[600]' },
  { from: /colors\.brand\.secondary\.DEFAULT/g, to: 'primitives.amber[400]' },
  { from: /colors\.semantic\.success\.DEFAULT/g, to: 'semantic.success' },
  { from: /colors\.semantic\.error\.DEFAULT/g, to: 'semantic.error' },
  { from: /colors\.semantic\.warning\.DEFAULT/g, to: 'semantic.warning' },
  { from: /colors\.semantic\.info\.DEFAULT/g, to: 'semantic.info' },
  
  // Chart colors
  { from: /colors\.charts\.savings/g, to: 'semantic.chart.savings' },
  { from: /colors\.charts\.cost/g, to: 'semantic.chart.cost' },
  { from: /colors\.charts\.roi/g, to: 'semantic.chart.roi' },
  { from: /colors\.charts\.loss/g, to: 'semantic.chart.loss' },
  
  // Hardcoded hex → Primitives
  { from: /#0d9488/gi, to: 'primitives.teal[600]' },
  { from: /#10b981/gi, to: 'primitives.green[500]' },
  { from: /#ef4444/gi, to: 'primitives.red[500]' },
  { from: /#2563eb/gi, to: 'primitives.blue[600]' },
  { from: /#fbbf24/gi, to: 'primitives.amber[400]' },
];

// Run: ts-node scripts/migrate-colors.ts src/components/SavingsChart.tsx
```

**Risk**: May break some edge cases. Use with **manual review** after.

---

## Testing Checklist (Per Component)

After migrating each component:

- [ ] **TypeScript compiles**: `npx tsc --noEmit`
- [ ] **Component renders**: Visual inspection in dev mode
- [ ] **Light theme works**: No broken colors, correct contrast
- [ ] **Dark theme works**: No broken colors, correct contrast
- [ ] **Storybook story**: Create or update story for component
- [ ] **Chromatic snapshot**: Visual regression test (if Chromatic available)
- [ ] **Cross-browser**: Test in Chrome, Firefox, Safari (sample pages)
- [ ] **Mobile responsive**: Test on mobile viewport (320px, 768px, 1024px)
- [ ] **Git commit**: Descriptive message with before/after counts

---

## Phase 12 Progress Tracking

**Total Files to Migrate**: 8 files (excluding design tokens and Google icon)

| File | Priority | Status | Hardcoded Before | Hardcoded After | Date | Developer |
|------|----------|--------|------------------|-----------------|------|-----------|
| src/lib/theme/colors.ts | P0 | Not Started | 50+ | 0 (delete file) | - | - |
| src/components/SavingsChart.tsx | P0 | Not Started | 10 | 0 | - | - |
| src/hooks/useChartColors.ts | P0 | Not Started | 1 | 0 | - | - |
| src/lib/services/notification-service.ts | P1 | Not Started | 5 | 0 | - | - |
| src/components/InstallerBottomNavBar.tsx | P1 | Not Started | 1 | 0 | - | - |
| src/components/HomeownerBottomNavBar.tsx | P1 | Not Started | 1 | 0 | - | - |
| src/components/GuestBottomNavBar.tsx | P1 | Not Started | 1 | 0 | - | - |
| src/lib/sendgrid.ts | P2 | Not Started | 1 | 0 | - | - |

**Goal**: 70+ hardcoded values → 0 (98% reduction, excluding intentional hex in design tokens)

---

## Next Steps

1. **T096 Complete**: ✅ Hardcoded color scan complete
2. **T097**: Create migration tracking dashboard (this document serves as initial tracker)
3. **T098-T318**: Page-by-page migrations (40-50 pages, 223 tasks)
4. **T315**: Full codebase scan (verify <10 hardcoded values remaining)
5. **T318**: Update migration dashboard with final counts

---

## Notes

- **Design token hex values**: Intentional and necessary - do NOT migrate
- **Third-party brand colors** (Google, Facebook, etc.): Keep as-is for brand recognition
- **Email inline styles**: Require separate strategy (can't use Tailwind classes)
- **Legacy colors.ts file**: High priority - creates confusion and duplication
- **Chart components**: Critical for dashboards - high visibility
- **Shadow values**: Low priority but affects 3 navigation components

**Estimated Time** (for above 8 files):
- P0 (3 files): 4 hours (complex chart logic + finding all imports)
- P1 (4 files): 3 hours (email templates + navigation bars)
- P2 (1 file): 0.5 hours (single blockquote border)
- **Total**: ~7.5 hours for core application code

**Remaining Phase 12**: 40-50 pages × 2-3 hours each = 80-150 hours (page-by-page UI migration)
