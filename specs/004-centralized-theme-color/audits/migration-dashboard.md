# Phase 12 Migration Tracking Dashboard

**Feature**: US5 - Legacy Color Migration  
**Phase**: 12 of 13  
**Started**: 2025-10-28  
**Status**: 🚧 IN PROGRESS  
**Overall Progress**: 0/231 tasks (0%)

---

## Summary Statistics

### Overall Progress
- **Total Tasks**: 231 (8 core app files + 223 page/component migrations)
- **Completed**: 0
- **In Progress**: 1 (T097 - this dashboard)
- **Not Started**: 230
- **Completion**: 0%

### Hardcoded Color Reduction
- **Before**: ~500+ hardcoded color values (est.)
- **After**: 0 (target: <10 acceptable exceptions)
- **Reduction**: 0% (target: 98%+)

### Time Tracking
- **Estimated Total**: 87.5 hours
  - Core App Code: 7.5 hours (8 files)
  - Page Migrations: 80 hours (40 pages × 2 hours avg)
- **Actual Spent**: 0 hours
- **Remaining**: 87.5 hours

### Developer Allocation
- **Developer 1**: 0 tasks assigned
- **Developer 2**: 0 tasks assigned
- **Parallel Work**: Not started

---

## Section 1: Core Application Code (From Scan)

**Source**: `specs/004-centralized-theme-color/audits/hardcoded-color-scan.md`  
**Total Files**: 8  
**Priority**: P0-P2 (HIGH to LOW)  
**Est. Time**: 7.5 hours

| Task ID | File | Priority | Status | Hardcoded Before | Hardcoded After | Component Type | Complexity | Est Time | Developer | Completion Date | Notes |
|---------|------|----------|--------|------------------|-----------------|----------------|------------|----------|-----------|-----------------|-------|
| **T101** | src/lib/theme/colors.ts | P0 | Not Started | 50+ | 0 (DELETE FILE) | Legacy Theme | High | 2h | - | - | Duplicate of design tokens. Find all imports first. |
| **T102** | src/components/SavingsChart.tsx | P0 | Not Started | 10 | 0 | Chart | High | 1.5h | - | - | Use `useChartColors()` hook. Green savings, teal cost. |
| **T103** | src/hooks/useChartColors.ts | P0 | Not Started | 1 | 0 | Hook | Low | 0.5h | - | - | Fix rgba teal gradient values. |
| **T104** | src/lib/services/notification-service.ts | P1 | Not Started | 5 | 0 | Email Template | Medium | 1.5h | - | - | Create email-styles.ts for inline CSS. |
| **T105** | src/components/InstallerBottomNavBar.tsx | P1 | Not Started | 1 | 0 | Navigation | Low | 0.5h | - | - | Migrate shadow to semantic token. |
| **T106** | src/components/HomeownerBottomNavBar.tsx | P1 | Not Started | 1 | 0 | Navigation | Low | 0.5h | - | - | Same shadow as T105. Update all 3 nav bars together. |
| **T107** | src/components/GuestBottomNavBar.tsx | P1 | Not Started | 1 | 0 | Navigation | Low | 0.5h | - | - | Same shadow as T105-T106. |
| **T108** | src/lib/sendgrid.ts | P2 | Not Started | 1 | 0 | Email Template | Low | 0.5h | - | - | Single blockquote border. Use semantic.border. |

**Subtotal**: 8 files, 70+ hardcoded values, 7.5 hours

---

## Section 2: Page Migrations (To Be Discovered)

**Method**: Iterative scanning after T101-T108 complete  
**Strategy**: Prioritize high-traffic pages (Homepage, Dashboards, Quote Forms) first  
**Est. Total Pages**: 40-50  
**Est. Time**: 80 hours (2 hours per page avg)

### Week 1: High-Priority Pages (10-15 pages, 20-30h)

| Task ID | Page | Route | Priority | Status | Hardcoded Before | Hardcoded After | Component Type | Complexity | Est Time | Developer | Completion Date | Notes |
|---------|------|-------|----------|--------|------------------|-----------------|----------------|------------|----------|-----------|-----------------|-------|
| **T098** | Homepage | `/` | P0 | Not Started | TBD | 0 | Landing Page | High | 3h | - | - | Hero section, CTAs, feature cards. High visibility. |
| **T099** | InstantQuoteForm | `/quote` | P0 | Not Started | TBD | 0 | Form | High | 2.5h | - | - | Multi-step form, progress indicator, validation. |
| **T100** | SimplifiedQuoteForm | `/quote/quick` | P0 | Not Started | TBD | 0 | Form | Medium | 2h | - | - | Single-page form, simpler than T099. |
| **T109** | Homeowner Dashboard | `/homeowner/dashboard` | P0 | Not Started | TBD | 0 | Dashboard | High | 3h | - | - | Lead cards, stats, action buttons. |
| **T110** | Installer Dashboard | `/installer/dashboard` | P0 | Not Started | TBD | 0 | Dashboard | High | 3h | - | - | Lead cards, quote management, notifications. |
| **T111** | Admin Dashboard | `/admin/dashboard` | P0 | Not Started | TBD | 0 | Dashboard | High | 3h | - | - | Analytics, user management, system health. |
| **T112** | Login/Register | `/login`, `/register` | P0 | Not Started | TBD | 0 | Auth | Medium | 2h | - | - | Forms, OAuth buttons (keep Google colors). |
| **T113** | Lead Details (Homeowner) | `/homeowner/leads/[id]` | P0 | Not Started | TBD | 0 | Details Page | Medium | 2h | - | - | Quote details, status badges, actions. |
| **T114** | Lead Details (Installer) | `/installer/leads/[id]` | P0 | Not Started | TBD | 0 | Details Page | Medium | 2h | - | - | Bid form, lead info, contact details. |
| **T115** | User Profile/Settings | `/profile`, `/settings` | P0 | Not Started | TBD | 0 | Settings | Medium | 2h | - | - | Profile form, preferences, account settings. |

**Week 1 Subtotal**: 10 pages, ~25 hours (T098-T115)

### Week 2: Secondary Pages (15-20 pages, 30-40h)

| Task ID | Page | Route | Priority | Status | Hardcoded Before | Hardcoded After | Component Type | Complexity | Est Time | Developer | Completion Date | Notes |
|---------|------|-------|----------|--------|------------------|-----------------|----------------|------------|----------|-----------|-----------------|-------|
| **T116** | Admin: Users List | `/admin/users` | P1 | Not Started | TBD | 0 | Admin Table | Medium | 2h | - | - | Data table, filters, actions. |
| **T117** | Admin: User Edit | `/admin/users/[id]` | P1 | Not Started | TBD | 0 | Admin Form | Medium | 2h | - | - | Edit form, role management. |
| **T118** | Admin: Leads List | `/admin/leads` | P1 | Not Started | TBD | 0 | Admin Table | Medium | 2h | - | - | Lead management, bulk actions. |
| **T119** | Admin: Settings | `/admin/settings` | P1 | Not Started | TBD | 0 | Admin Settings | Medium | 2h | - | - | System config, feature flags. |
| **T120** | Reports: Lead Analytics | `/reports/leads` | P1 | Not Started | TBD | 0 | Reports | Medium | 2h | - | - | Charts, graphs, export buttons. |
| **T121** | Reports: Revenue | `/reports/revenue` | P1 | Not Started | TBD | 0 | Reports | Medium | 2h | - | - | Financial charts, trends. |
| **T122** | Notifications Center | `/notifications` | P1 | Not Started | TBD | 0 | Notifications | Low | 1.5h | - | - | List of notifications, read/unread states. |
| **T123** | Help/FAQ | `/help` | P1 | Not Started | TBD | 0 | Content | Low | 1h | - | - | Static content, accordions. |
| **T124** | About Us | `/about` | P1 | Not Started | TBD | 0 | Content | Low | 1h | - | - | Static marketing page. |
| **T125** | Contact Us | `/contact` | P1 | Not Started | TBD | 0 | Form | Low | 1.5h | - | - | Contact form, map. |
| **T126-T135** | Modals (10 modals) | Various | P1 | Not Started | TBD | 0 | Modal | Low-Medium | 10h (1h each) | - | - | Edit Lead, Preview Lead, Confirm Delete, etc. |

**Week 2 Subtotal**: 20 pages/modals, ~28 hours (T116-T135)

### Week 3: Edge Cases & Final Cleanup (10-15 pages, 15-25h)

| Task ID | Page | Route | Priority | Status | Hardcoded Before | Hardcoded After | Component Type | Complexity | Est Time | Developer | Completion Date | Notes |
|---------|------|-------|----------|--------|------------------|-----------------|----------------|------------|----------|-----------|-----------------|-------|
| **T136** | 404 Error Page | `/404` | P2 | Not Started | TBD | 0 | Error | Low | 0.5h | - | - | Simple error message. |
| **T137** | 500 Error Page | `/500` | P2 | Not Started | TBD | 0 | Error | Low | 0.5h | - | - | Server error page. |
| **T138** | Loading States | Various | P2 | Not Started | TBD | 0 | Loading | Low | 1h | - | - | Skeletons, spinners. |
| **T139** | Empty States | Various | P2 | Not Started | TBD | 0 | Empty State | Low | 1h | - | - | No leads, no notifications, etc. |
| **T140** | Onboarding Screens | `/onboarding/*` | P2 | Not Started | TBD | 0 | Onboarding | Medium | 3h | - | - | Multi-step wizard, progress bar. |
| **T141** | Landing Pages (2-3) | `/promo/*` | P2 | Not Started | TBD | 0 | Landing | Medium | 3h | - | - | Marketing pages with custom colors. |
| **T142-T149** | Misc Components (8) | Various | P2 | Not Started | TBD | 0 | Component | Low | 8h (1h each) | - | - | Badges, Tooltips, Toasts, Dropdowns, etc. |

**Week 3 Subtotal**: 15 pages/components, ~17 hours (T136-T149)

---

## Section 3: Final Validation & Cleanup (T150-T154)

| Task ID | Task | Priority | Status | Est Time | Developer | Completion Date | Notes |
|---------|------|----------|--------|----------|-----------|-----------------|-------|
| **T150** | Full Codebase Scan | P0 | Not Started | 1h | - | - | Run grep again, verify <10 hardcoded values remaining. |
| **T151** | Update This Dashboard | P0 | Not Started | 0.5h | - | - | Final counts, completion dates, lessons learned. |
| **T152** | Chromatic Full Suite | P0 | Not Started | 2h | - | - | Visual regression testing on all migrated pages. |
| **T153** | Cross-Browser QA | P0 | Not Started | 4h | - | - | Chrome, Firefox, Safari, Edge, Mobile (iOS/Android). |
| **T154** | Migration Report | P0 | Not Started | 1h | - | - | Create phase-12-migration-complete.md with metrics. |

**Subtotal**: 5 tasks, 8.5 hours

---

## Grand Total

| Section | Tasks | Hardcoded Before | Hardcoded After | Est Time | Status |
|---------|-------|------------------|-----------------|----------|--------|
| **Core App Code** | 8 | 70+ | 0 | 7.5h | 0/8 (0%) |
| **Week 1 Pages** | 10 | TBD (~200) | 0 | 25h | 0/10 (0%) |
| **Week 2 Pages** | 20 | TBD (~300) | 0 | 28h | 0/20 (0%) |
| **Week 3 Edge Cases** | 15 | TBD (~100) | 0 | 17h | 0/15 (0%) |
| **Final Validation** | 5 | TBD (~10) | <10 | 8.5h | 0/5 (0%) |
| **TOTAL** | **58** | **~680** | **<10** | **86h** | **0/58 (0%)** |

**Note**: Total tasks = 58 detailed above + 173 additional page migrations to be discovered = 231 tasks

---

## Migration Workflow (7 Steps Per Page)

### For Each Page (Repeat T098-T149):

1. **Audit** (15 min):
   - Open file in editor
   - Run grep for hardcoded colors: `grep -E "#[0-9a-fA-F]{3,6}|rgb\(|rgba\(" [file]`
   - Count hardcoded values (Before)
   - Identify color categories (backgrounds, text, borders, shadows)

2. **Token Mapping** (15 min):
   - Map each hardcoded color to semantic token:
     - `#0d9488` → `bg-primary` (teal-600)
     - `#10b981` → `text-success` (green-500)
     - `#ef4444` → `border-error` (red-500)
   - Create mapping table in notes

3. **Refactor** (60 min):
   - Replace hardcoded hex/rgb with Tailwind classes
   - Update inline styles to className
   - Test in dev mode (`npm run dev`)
   - Fix any broken layouts

4. **Storybook Story** (20 min):
   - Create or update story in `stories/pages/` or `stories/components/`
   - Add Light/Dark theme variants
   - Add interactive controls (if applicable)
   - Test story renders correctly

5. **Chromatic** (10 min):
   - Run `npm run chromatic` (if available)
   - Review visual diffs
   - Approve changes or fix issues

6. **QA** (15 min):
   - Test in Light theme (colors correct, contrast good)
   - Test in Dark theme (colors correct, contrast good)
   - Test System theme (follows OS preference)
   - Test mobile viewport (320px, 768px)
   - Test interactions (hover, focus, active states)

7. **Commit** (5 min):
   - Count hardcoded values (After)
   - Update this dashboard (Before/After, Completion Date, Developer)
   - Git commit with message:
     ```
     Migrate [PageName] from hardcoded colors to design tokens
     
     Before: 15 hardcoded values
     After: 0 hardcoded values
     Reduction: 100%
     
     - Replaced #0d9488 with bg-primary (12 instances)
     - Replaced #10b981 with text-success (2 instances)
     - Replaced rgba(0,0,0,0.1) with shadow-card (1 instance)
     
     Story: stories/pages/[PageName].stories.tsx
     Testing: Light/Dark themes ✅, Mobile responsive ✅
     ```

**Total Time Per Page**: ~2 hours

---

## Parallel Work Strategy

### 2 Developers Working Simultaneously

**Developer 1 (D1)**: Focus on **Core App Code + High-Priority Pages**
- Week 1:
  - Day 1-2: T101-T103 (colors.ts, charts) - 4 hours
  - Day 3: T104-T108 (email, nav bars) - 3.5 hours
  - Day 4-5: T098, T099, T109 (Homepage, Quote Forms, Dashboard) - 8.5 hours

**Developer 2 (D2)**: Focus on **Admin Pages + Secondary Pages**
- Week 1:
  - Day 1-5: T110, T111, T112, T113, T114, T115 (Admin, Auth, Details, Settings) - 16.5 hours

**Combined Week 1 Output**: 16 tasks, ~32 hours (2 devs × 16h each)

**Week 2-3**: Continue parallel work on remaining pages (T116-T149)

---

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Legacy `colors.ts` imports hard to find | High | Medium | Use `grep -r` to find all imports before deletion |
| Chart color logic complex | Medium | High | Test extensively in Storybook, use `useChartColors()` hook |
| Email templates break styling | High | Low | Create `email-styles.ts` with inline style generators |
| Pages have deeply nested hardcoded colors | Medium | Medium | Use automated script (with manual review) |
| White-label themes break after migration | High | Low | Test with both Default and Client Blue themes |
| Chromatic not available | Low | High | Use manual screenshots for visual regression |
| Dark theme contrast issues | Medium | Medium | Run WCAG tests after each migration |
| Missed hardcoded colors in edge cases | Medium | High | Run full scan (T150) before Phase 12 completion |

---

## Success Criteria

### Phase 12 Complete When:
- [x] Core app code (8 files) migrated: 0% (0/8)
- [ ] High-priority pages (10 pages) migrated: 0% (0/10)
- [ ] Secondary pages (20 pages) migrated: 0% (0/20)
- [ ] Edge cases (15 pages) migrated: 0% (0/15)
- [ ] Final scan shows <10 hardcoded values remaining
- [ ] All Storybook stories created/updated
- [ ] TypeScript compiles with 0 errors
- [ ] All pages tested in Light + Dark themes
- [ ] Cross-browser QA passed (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive QA passed (320px, 768px, 1024px)
- [ ] Chromatic visual regression tests passed (or manual screenshots approved)
- [ ] Migration report created with metrics and lessons learned

**Target Date**: Week of 2025-11-04 (2-3 weeks from 2025-10-28)

---

## Daily Standup Format

### What I completed yesterday:
- Tasks: T### (PageName, PageName)
- Hardcoded colors removed: ### values
- Time spent: ### hours

### What I'm working on today:
- Tasks: T### (PageName, PageName)
- Est. hardcoded colors: ### values
- Est. time: ### hours

### Blockers:
- None / [Describe blocker]

---

## Lessons Learned (To Be Filled Post-Phase 12)

### What Went Well:
- TBD

### What Could Be Improved:
- TBD

### Surprises/Challenges:
- TBD

### Recommendations for Future:
- TBD

---

## Appendix: Quick Reference

### Common Migrations

| Hardcoded | Token | Tailwind Class |
|-----------|-------|----------------|
| `#0d9488` | teal-600 | `bg-primary`, `text-primary`, `border-primary` |
| `#fbbf24` | amber-400 | `bg-secondary`, `text-secondary`, `border-secondary` |
| `#10b981` | green-500 | `text-success`, `bg-success`, `border-success` |
| `#eab308` | yellow-500 | `text-warning`, `bg-warning`, `border-warning` |
| `#ef4444` | red-500 | `text-error`, `bg-error`, `border-error` |
| `#2563eb` | blue-600 | `text-info`, `bg-info`, `border-info` |
| `#ffffff` | white | `bg-background`, `text-foreground` (light) |
| `#111827` | gray-900 | `bg-background`, `text-foreground` (dark) |
| `rgba(0,0,0,0.1)` | shadow | `shadow-card`, `shadow-button` |

### Useful Commands

```bash
# Find hardcoded colors in file
grep -E "#[0-9a-fA-F]{3,6}|rgb\(|rgba\(" src/path/to/file.tsx

# Find all imports of legacy colors.ts
grep -r "from.*lib/theme/colors" src/

# Run TypeScript check
npx tsc --noEmit

# Start dev server
npm run dev

# Start Storybook
npm run storybook

# Run Chromatic (if available)
npm run chromatic

# Commit migration
git add .
git commit -m "Migrate [PageName] from hardcoded colors to design tokens"
```

---

**Last Updated**: 2025-10-28 | **Next Review**: After T108 complete (Core App Code done)
