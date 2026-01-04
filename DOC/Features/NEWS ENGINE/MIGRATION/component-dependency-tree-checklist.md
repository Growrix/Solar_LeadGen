# News Engine — Component Dependency Tree Checklist

Purpose: prevent false “done” claims by listing the route → component tree that must be scanned/verified (especially for Phase 6 token compliance).

## Public Routes

### `/news`
- [ ] Route entry: `src/app/news/page.tsx`
- [ ] Child components used directly:
  - [ ] `src/components/Footer.tsx`
- [ ] Data/state helpers:
  - [ ] `src/lib/ui-stubs/news-engine.ts`

### `/news/[slug]`
- [ ] Route entry: `src/app/news/[slug]/page.tsx`
- [ ] Child components used directly:
  - [ ] `src/components/Footer.tsx`
  - [ ] `src/components/ui/button.tsx`
  - [ ] Share modal is inline (declared inside the route file)
- [ ] Data/state helpers:
  - [ ] `src/lib/ui-stubs/news-engine.ts`

## Admin Routes

### `/admin/news-engine`
- [ ] Route entry: `src/app/admin/news-engine/page.tsx`
  - [ ] Hub: `src/components/news-engine/AdminNewsEngineHub.tsx`

#### Hub → V6 tabs (mirrored structure)
- [ ] `src/components/news-engine/v6/tabs/DashboardTab.tsx` (`DashboardTabV6`)
- [ ] `src/components/news-engine/v6/tabs/DraftsReviewsTab.tsx` (`DraftsReviewsTabV6`)
- [ ] `src/components/news-engine/v6/tabs/AuditLogsTab.tsx` (`AuditLogsTabV6`)
- [ ] `src/components/news-engine/v6/tabs/MasterControlTab.tsx` (`MasterControlTabV6`)
- [ ] `src/components/news-engine/v6/tabs/AutomationLogicTab.tsx` (`AutomationLogicTabV6`)
- [ ] `src/components/news-engine/v6/tabs/SourcesTab.tsx` (`SourcesTabV6`)
- [ ] `src/components/news-engine/v6/tabs/SettingsTab.tsx` (`SettingsTabV6`)

#### Hub → V6 modals (mirrored structure)
- [ ] `src/components/news-engine/v6/modals/ReviewModal.tsx` (`ReviewModalV6`)
- [ ] `src/components/news-engine/v6/modals/ManualDraftModal.tsx` (`ManualDraftModalV6`)
- [ ] `src/components/news-engine/v6/modals/ScheduleModal.tsx` (`ScheduleModal`)
- [ ] `src/components/news-engine/v6/modals/RewriteModal.tsx` (`RewriteModal`)
- [ ] `src/components/news-engine/v6/modals/RejectModal.tsx` (`RejectModal`)
- [ ] `src/components/news-engine/v6/modals/TestPreviewModal.tsx` (`TestPreviewModal`)
- [ ] `src/components/news-engine/v6/modals/AddEditSourceModal.tsx` (`AddEditSourceModal`)
- [ ] `src/components/news-engine/v6/modals/PromptDetailsModal.tsx` (`PromptDetailsModal`)
- [ ] `src/components/news-engine/v6/modals/ConfirmationModal.tsx` (`ConfirmationModal`)

#### Shared primitives/utilities
- [ ] `src/components/news-engine/v6/shared.tsx`

#### Shared app components used by the hub/tabs/modals
- [ ] `src/components/Button.tsx`

#### Data/state helpers
- [ ] `src/lib/ui-stubs/news-engine.ts`

## Notes
- Phase 6 (T029/T030) should be run against every file in this checklist that renders UI.
- Shared, non-feature components (like `src/components/Button.tsx`) may already be globally compliant, but are listed here so the tree is explicit.
