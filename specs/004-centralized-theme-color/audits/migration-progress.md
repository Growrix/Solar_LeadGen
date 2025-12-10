# Migration Progress Dashboard

**Feature**: Centralized Design Token System (004-centralized-theme-color)  
**Last Updated**: 2025-10-29  
**Status**: Phase 12 - Legacy Migration IN PROGRESS

---

## 🎯 Migration Goals

- **Target**: Migrate 40-50 pages to use design tokens
- **Hardcoded Value Reduction**: 98% (from 11,046 → <220 remaining)
- **Timeframe**: 3 weeks (2-3 pages per day, ~80 hours total)
- **Quality**: Zero visual regressions, maintain WCAG AA compliance

---

## 📊 Overall Progress

### Initial Scan Results (2025-10-29)

- **Total Hardcoded Values**: 11,046
- **Files with Issues**: 77
- **Breakdown by Type**:
  - Colors: 5,376 (48.7%)
  - Spacing: 3,290 (29.8%)
  - Typography: 1,332 (12.1%)
  - Border Radius: 819 (7.4%)
  - Shadows: 119 (1.1%)
  - Animations: 110 (1.0%)

### Current Status

- **Pages Migrated**: 0 / 50 (0%)
- **Hardcoded Values Eliminated**: 0 / 11,046 (0%)
- **Files Completed**: 0 / 77 (0%)
- **Chromatic Snapshots**: 133 baseline (Build 3)

---

## 📅 Migration Schedule

### Week 1: High-Priority Pages (10-15 pages)

**Target**: Core user journeys - Homepage, Quote Forms, Dashboards, Auth Pages

| Task ID | Page | File | Issues | Status | Completed Date | PR Link |
|---------|------|------|--------|--------|----------------|---------|
| T098-T104 | Dashboard | `src/app/dashboard/page.tsx` | TBD | ⏳ Not Started | - | - |
| T105-T111 | Homepage | `src/app/page.tsx` | TBD | ⏳ Not Started | - | - |
| T112-T118 | Instant Quote Form | `src/components/InstantQuoteForm.tsx` | 840 | ⏳ Not Started | - | - |
| T119-T125 | Guest Quote Request | `src/components/homeowner/SimplifiedQuoteForm.tsx` | 808 | ⏳ Not Started | - | - |
| T126-T132 | Login Page | `src/app/login/page.tsx` | TBD | ⏳ Not Started | - | - |
| T133-T139 | Register Page | `src/app/register/page.tsx` | TBD | ⏳ Not Started | - | - |
| T140-T146 | Homeowner Dashboard | `src/app/homeowner/dashboard/page.tsx` | 330 | ⏳ Not Started | - | - |
| T147-T153 | Installer Dashboard | `src/app/installer/dashboard/page.tsx` | TBD | ⏳ Not Started | - | - |
| T154-T160 | Lead Details Page | `src/app/admin/leads/[id]/page.tsx` | 477 | ⏳ Not Started | - | - |
| T161-T167 | Settings Page | `src/app/settings/page.tsx` | TBD | ⏳ Not Started | - | - |
| T168-T174 | Profile Page | `src/components/ProfileManagement.tsx` | 287 | ⏳ Not Started | - | - |

**Week 1 Totals**: 0 / 11+ pages (0%)

### Week 2: Secondary Pages (15-20 pages)

**Target**: Admin tools, Modals, Reports, Notifications

| Task ID | Page | File | Issues | Status | Completed Date | PR Link |
|---------|------|------|--------|--------|----------------|---------|
| T175-T181 | Admin Dashboard | `src/app/admin/dashboard/page.tsx` | TBD | ⏳ Not Started | - | - |
| T182-T188 | Admin Users Page | `src/components/AdminHomeownersList.tsx` | 378 | ⏳ Not Started | - | - |
| T189-T195 | Admin Settings | `src/app/admin/settings/page.tsx` | TBD | ⏳ Not Started | - | - |
| T196-T202 | Instant Quotes Admin | `src/app/admin/instant-quotes/page.tsx` | 1,089 | ⏳ Not Started | - | - |
| T203-T209 | Installer Lead Feed | `src/components/InstallerLeadFeed.tsx` | 323 | ⏳ Not Started | - | - |
| T210-T216 | Lead Preview Modal | `src/components/homeowner/LeadPreviewModal.tsx` | 308 | ⏳ Not Started | - | - |
| T217-T223 | Messaging Modal | `src/components/MessagingModal.tsx` | 257 | ⏳ Not Started | - | - |
| T224-T230 | Admin Leads Page | `src/app/admin/leads/page.tsx` | 236 | ⏳ Not Started | - | - |
| T231-T237 | Installers Table | `src/components/admin/InstallersTable.tsx` | 289 | ⏳ Not Started | - | - |
| T238-T244 | Quote Data Display | `src/components/admin/QuoteDataDisplay.tsx` | 237 | ⏳ Not Started | - | - |
| T245-T251 | Rebate Calculator | `src/components/RebateCalculatorForm.tsx` | 203 | ⏳ Not Started | - | - |
| T252-T258 | Homeowners Analytics | `src/components/AdminHomeownersAnalytics.tsx` | 198 | ⏳ Not Started | - | - |
| T259-T265 | Installer Messaging | `src/components/InstallerMessagingModal.tsx` | 195 | ⏳ Not Started | - | - |
| T266-T272 | Purchased Leads | `src/app/installer/purchased-leads/page.tsx` | 186 | ⏳ Not Started | - | - |
| T273-T279 | Quote Distribution | `src/components/homeowner/QuoteTypeDistributionModal.tsx` | 183 | ⏳ Not Started | - | - |
| T280-T286 | Quote Builder Modal | `src/components/QuoteBuilderModal.tsx` | 179 | ⏳ Not Started | - | - |

**Week 2 Totals**: 0 / 16+ pages (0%)

### Week 3: Edge Cases & Cleanup (10-15 pages)

**Target**: Error pages, Empty states, Remaining components

| Task ID | Page | File | Issues | Status | Completed Date | PR Link |
|---------|------|------|--------|--------|----------------|---------|
| T287-T293 | 404 Error Page | `src/app/not-found.tsx` | TBD | ⏳ Not Started | - | - |
| T294-T300 | 500 Error Page | `src/app/error.tsx` | TBD | ⏳ Not Started | - | - |
| T301-T307 | Loading States | Various skeleton components | TBD | ⏳ Not Started | - | - |
| T308-T314 | Empty States | Various empty state components | TBD | ⏳ Not Started | - | - |
| ... | (Additional pages TBD based on scan results) | - | TBD | ⏳ Not Started | - | - |

**Week 3 Totals**: 0 / 10+ pages (0%)

---

## 🔥 Top Priority Files (Highest Issue Count)

These files should be migrated first due to high hardcoded value count:

1. ✅ **Instant Quotes Admin** (`src/app/admin/instant-quotes/page.tsx`) - **1,089 issues** - ⏳ Not Started
2. ✅ **Instant Quote Form** (`src/components/InstantQuoteForm.tsx`) - **840 issues** - ⏳ Not Started
3. ✅ **Guest Quote Form** (`src/components/homeowner/SimplifiedQuoteForm.tsx`) - **808 issues** - ⏳ Not Started
4. ✅ **Admin Lead Details** (`src/app/admin/leads/[id]/page.tsx`) - **477 issues** - ⏳ Not Started
5. ✅ **Admin Homeowners List** (`src/components/AdminHomeownersList.tsx`) - **378 issues** - ⏳ Not Started
6. ✅ **Installer Lead Details** (`src/app/installer/leads/[id]/page.tsx`) - **345 issues** - ⏳ Not Started
7. ✅ **Homeowner Dashboard** (`src/app/homeowner/dashboard/page.tsx`) - **330 issues** - ⏳ Not Started
8. ✅ **Installer Lead Feed** (`src/components/InstallerLeadFeed.tsx`) - **323 issues** - ⏳ Not Started
9. ✅ **Lead Preview Modal** (`src/components/homeowner/LeadPreviewModal.tsx`) - **308 issues** - ⏳ Not Started
10. ✅ **Admin Installers Table** (`src/components/admin/InstallersTable.tsx`) - **289 issues** - ⏳ Not Started

---

## 📈 Progress Charts

### Hardcoded Values Eliminated

```
Initial: 11,046 ████████████████████████████████████████ 100%
Current: 11,046 ████████████████████████████████████████ 100%
Target:    220 ██ 2%
```

### Pages Migrated

```
Week 1:  0 / 11 [          ] 0%
Week 2:  0 / 16 [          ] 0%
Week 3:  0 / 10 [          ] 0%
Total:   0 / 37 [          ] 0%
```

---

## 🎯 7-Step Migration Workflow

For each page migration task (e.g., T098-T104):

### Step 1: Audit (T0X8) - 15-30 min
- Run hardcoded value scanner on specific file
- Document all hardcoded values in `audits/[page-name]-audit.md`
- Group by type: colors, spacing, typography, shadows, radius, animations
- Identify components that need refactoring

### Step 2: Token Mapping (T0X9) - 15-30 min
- Create token mapping table in audit file
- Map each hardcoded value → design token
- Examples:
  - `bg-teal-600` → `bg-primary`
  - `text-gray-700` → `text-foreground`
  - `p-4` → `p-card-padding`
  - `text-lg` → `text-body-large`
  - `shadow-md` → `shadow-card`
  - `rounded-lg` → `rounded-card`

### Step 3: Refactor (T1X0) - 60-90 min
- Replace hardcoded values with design tokens
- Test in browser: `npm run dev`
- Verify all themes: Light/Dark/System
- Verify all breakpoints: 320px/768px/1024px
- Fix any layout issues

### Step 4: Storybook Story (T1X1) - 30-45 min
- Create Storybook story for page: `stories/pages/[PageName].stories.tsx`
- Include theme switcher
- Include all component states
- Document token usage

### Step 5: Chromatic (T1X2) - 15-30 min
- Run Chromatic: `npm run chromatic`
- Review visual diffs
- Accept changes if intentional
- Fix unintended regressions

### Step 6: QA Checklist (T1X3) - 30-45 min
- Complete manual QA checklist (see templates in tasks.md)
- Test all themes
- Test all breakpoints
- Test all interactive states
- Document any issues found

### Step 7: Commit (T1X4) - 15-30 min
- Create clear commit message with before/after stats
- Include hardcoded value count reduction
- Include file changes summary
- Update `DOC/gitstatus.md`
- Push to feature branch

**Total Time per Page**: 3-4 hours (with practice, can reduce to 2-3 hours)

---

## 🚀 Quick Commands

```bash
# Run hardcoded value scanner
npx ts-node scripts/scan-hardcoded-values.ts

# Check TypeScript
npx tsc --noEmit

# Build for production
npm run build

# Run Storybook
npm run storybook

# Run Chromatic
npm run chromatic

# Scan specific file
npx ts-node scripts/scan-hardcoded-values.ts --file src/app/dashboard/page.tsx
```

---

## 📚 Resources

- **Design Token Docs**: `specs/004-centralized-theme-color/quickstart.md`
- **Constitution Workflow**: `.specify/memory/constitution.md` (Section 0, VI)
- **Hardcoded Value Scan**: `specs/004-centralized-theme-color/audits/hardcoded-values-scan.md`
- **Color Change Guide**: `specs/004-centralized-theme-color/audits/color-change-guide.md`
- **Typography Guide**: `specs/004-centralized-theme-color/audits/typography-change-guide.md`
- **Spacing Patterns**: `specs/004-centralized-theme-color/audits/spacing-patterns.md`
- **Elevation Guide**: `specs/004-centralized-theme-color/audits/elevation-system-guide.md`
- **Theme Testing Workflow**: `specs/004-centralized-theme-color/audits/theme-testing-workflow.md`

---

## 🎨 Design Token Quick Reference

### Colors
- **Brand**: `bg-primary`, `text-primary`, `border-primary`, `bg-secondary`, `text-secondary`
- **Status**: `bg-success`, `bg-warning`, `bg-error`, `bg-info`
- **UI**: `bg-background`, `text-foreground`, `bg-muted`, `text-muted`, `border-border`

### Typography
- **Headings**: `text-heading-1`, `text-heading-2`, `text-heading-3`, `text-heading-4`
- **Body**: `text-body`, `text-body-large`, `text-body-small`
- **Utility**: `text-caption`, `text-label`, `text-button`

### Spacing
- **Card**: `p-card-padding`, `gap-card-gap`
- **Form**: `space-y-form-gap`, `p-input-padding`
- **Section**: `mt-section-margin`, `mb-section-margin`
- **Button**: `px-button-padding-x`, `py-button-padding-y`

### Shadows
- **Elevation**: `shadow-button`, `shadow-card`, `shadow-dropdown`, `shadow-modal`, `shadow-focus`

### Border Radius
- **Components**: `rounded-button`, `rounded-input`, `rounded-card`, `rounded-modal`, `rounded-badge`

### Animations
- **Durations**: `duration-fast`, `duration-normal`, `duration-slow`
- **Easing**: `ease-smooth`, `ease-bounce`
- **Transitions**: `transition-colors`, `transition-transform`, `transition-all`

---

## ✅ Completion Criteria

### Phase 12 Complete When:
- [ ] 40-50 pages migrated (100%)
- [ ] <220 hardcoded values remaining (98% reduction)
- [ ] All high-priority files (top 20) migrated
- [ ] Full Chromatic regression suite passed (zero unintended diffs)
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Mobile Safari)
- [ ] All themes working (Light/Dark/System)
- [ ] All breakpoints tested (320px/768px/1024px)
- [ ] Final migration report published
- [ ] User approval received
- [ ] Committed to `On-going-State` branch
- [ ] `DOC/gitstatus.md` updated

---

## 📝 Notes & Learnings

*(This section will be updated throughout the migration process with insights, common patterns, and lessons learned)*

### Migration Patterns Discovered
- (To be filled as we migrate pages)

### Common Issues & Solutions
- (To be filled as we encounter challenges)

### Time-Saving Tips
- (To be filled as we optimize the workflow)
