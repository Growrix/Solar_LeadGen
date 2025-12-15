# Installer Dashboard Navigation Fix - Implementation Audit
**Date**: November 6, 2025  
**Phase**: 13 - URGENT Navigation Fix  
**Backup**: `backup/installer-nav-fix-20251106-183630`

## Current State Analysis

### Files to Modify
1. `src/app/installer/dashboard/page.tsx` (383 lines) - **CONVERT TO LAYOUT**
2. `src/components/installer/InstallerSidebar.tsx` (243 lines) - **UPDATE TO USE ROUTES**
3. `src/components/installer/InstallerDashboardHeader.tsx` - **VERIFY COMPATIBILITY**

### Components to Preserve (KEEP AS-IS)
- `src/components/InstallerLeadFeed.tsx` - Lead Feed component ✅
- `src/components/QuoteBuilderModal.tsx` - Quote modal ✅
- `src/components/InstallerMessagingModal.tsx` - Messaging modal ✅
- All child components of Lead Feed ✅

### Functionality to Preserve

#### Handler Functions (MUST KEEP)
```typescript
const handleUnlockLead = async (leadId: number): Promise<boolean>
const handleSubmitQuote = async (leadId: number, quoteData: any): Promise<boolean>
const handleStartChat = (leadId: number): void
```

#### Mock Data (MUST KEEP)
```typescript
const mockInstaller = {
  id: 1,
  companyName: "Solar Experts Inc.",
  credits: 150,
  tier: "Premium"
}
```

#### Components to Keep
- `InstallerLeadFeed` component with all props
- `InstallerMessagingModal` component
- `InstallerSidebar` component (modify for routes)
- `InstallerDashboardHeader` component (reuse as-is)
- `InstallerBottomNavBar` component (modify for routes)
- `InstallerMobileSidebarMenu` component (modify for routes)

### Components to Remove (Demo Content)
- `PlaceholderContent` component
- Demo tabs: Dashboard Overview, Marketplace, My Purchased Leads, Assigned Leads, Active Bids
- Related components: `InstallerMarketplace`, `InstallerPurchasedLeads`, `InstallerAssignedLeads`

## Target Structure

### New File Structure
```
src/app/installer/
├── layout.tsx (NEW)
│   ├── Sidebar (desktop)
│   ├── Header
│   ├── Mobile Sidebar Menu
│   └── Bottom Nav Bar (mobile)
└── leads/
    └── page.tsx (NEW)
        ├── InstallerLeadFeed component
        ├── Handler functions
        └── Mock data
```

### Navigation Routes
- `/installer` → Redirect to `/installer/leads` (or show default dashboard)
- `/installer/leads` → Lead Feed page (main content)

## Implementation Plan

### Step 1: Create Installer Layout (T303)
**File**: `src/app/installer/layout.tsx`

**Source**: Copy from `src/app/admin/layout.tsx` and adapt:
- Replace `AdminSidebar` with `InstallerSidebar`
- Replace `AdminHeader` with `InstallerDashboardHeader`
- Replace `AdminBottomNavBar` with `InstallerBottomNavBar`
- Replace `AdminMobileSidebarMenu` with `InstallerMobileSidebarMenu`
- Use pathname-based active page detection
- Remove state management (no useState)

**Key Changes**:
```typescript
const getActivePage = () => {
  if (pathname.includes('/leads')) return 'Lead Feed';
  return 'Dashboard';
};
```

### Step 2: Update InstallerSidebar (T304)
**File**: `src/components/installer/InstallerSidebar.tsx`

**Changes**:
1. Import `Link` from `next/navigation` and `usePathname`
2. Remove props: `activePage`, `setActivePage`
3. Add prop: `activePage` (derived from pathname in layout)
4. Replace NavItem buttons with Link components
5. Keep only "Lead Feed" navigation item
6. Update active state detection to use pathname

**Before**:
```typescript
<NavItem
  icon={<ZapIcon />}
  title="Lead Feed"
  isActive={activePage === 'Lead Feed'}
  onClick={() => setActivePage('Lead Feed')}
  badgeCount={5}
  isCollapsed={isCollapsed}
/>
```

**After**:
```typescript
<Link href="/installer/leads">
  <NavItem
    icon={<ZapIcon />}
    title="Lead Feed"
    isActive={activePage === 'Lead Feed'}
    badgeCount={5}
    isCollapsed={isCollapsed}
  />
</Link>
```

### Step 3: Create Lead Feed Route (T305)
**File**: `src/app/installer/leads/page.tsx`

**Content**:
```typescript
'use client';

import { useState } from 'react';
import InstallerLeadFeed from '@/components/InstallerLeadFeed';
import InstallerMessagingModal from '@/components/InstallerMessagingModal';

export default function InstallerLeadsPage() {
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  
  const mockInstaller = {
    id: 1,
    companyName: "Solar Experts Inc.",
    credits: 150,
    tier: "Premium"
  };

  const handleUnlockLead = async (leadId: number): Promise<boolean> => {
    console.log('Unlock lead:', leadId);
    return true;
  };

  const handleSubmitQuote = async (leadId: number, quoteData: any): Promise<boolean> => {
    console.log('Submit quote for lead:', leadId, quoteData);
    return true;
  };

  const handleStartChat = (leadId: number): void => {
    console.log('Start chat with lead:', leadId);
  };

  return (
    <>
      <InstallerLeadFeed
        installer={mockInstaller}
        onUnlockLead={handleUnlockLead}
        onSubmitQuote={handleSubmitQuote}
        onStartChat={handleStartChat}
      />
      <InstallerMessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
      />
    </>
  );
}
```

## Verification Checklist

### Functional Testing
- [ ] Navigation: `/installer` loads correctly
- [ ] Navigation: `/installer/leads` shows Lead Feed
- [ ] Sidebar: Click "Lead Feed" navigates to `/installer/leads`
- [ ] Sidebar: Active state highlights correctly
- [ ] Sidebar: Collapse/expand works
- [ ] Mobile: Bottom nav bar works
- [ ] Mobile: Mobile sidebar menu works
- [ ] Lead Feed: Unlock button works
- [ ] Lead Feed: Submit Quote modal opens
- [ ] Lead Feed: Start Chat works
- [ ] Lead Feed: All filters work
- [ ] Lead Feed: Pagination works

### Build Validation
- [ ] TypeScript: `npx tsc --noEmit` passes (0 errors)
- [ ] Build: `npm run build` succeeds
- [ ] Lint: No critical warnings

## Rollback Plan

If issues occur:
1. Stop dev server
2. Restore from backup: `backup/installer-nav-fix-20251106-183630`
3. Run `npm install` (if needed)
4. Restart dev server

## Success Criteria

✅ Route-based navigation (no useState for activePage)  
✅ Matches Admin dashboard pattern  
✅ All Lead Feed functionality preserved  
✅ Zero functional changes to Lead Feed components  
✅ TypeScript compilation passes  
✅ Production build succeeds  
✅ Mobile and desktop navigation work  
✅ Clean, maintainable code structure  

## Notes

- Keep InstallerLeadFeed component exactly as-is (no refactoring)
- Remove all demo tab logic and components
- Follow Admin dashboard as source of truth
- Test thoroughly after each step
- Full backup available for rollback
