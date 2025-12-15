# Purchased Leads Page - UI Enhancement Audit

**Date**: November 26, 2025  
**Status**: Audit Complete  
**Purpose**: Document current state, gaps, and implementation plan for purchased leads page enhancement  

---

## 1. CURRENT STATE ANALYSIS

### Current File Structure

```
src/app/installer/(dashboard)/purchased-leads/
└── page.tsx (326 lines)
```

### Current Features
✅ Fetches purchased leads from `/api/installer/leads/purchased`  
✅ Displays purchase stats (total, total spent, this month)  
✅ Shows purchased lead cards with contact details revealed  
✅ Contact actions: call, email, view details  
✅ Semantic classes used (bg-surface, text-foreground, etc.)  

### Current Lead Card Design
- Custom card design specific to purchased leads page
- Displays: quote type badge, purchased badge, contact information, lead details, actions
- Structure:
  - Header: Quote type + Purchased badge + Purchase date
  - Contact section: Green-highlighted unlocked contact details
  - Details section: Grid layout with location, property, roof, budget info
  - Actions section: Purchase price + 3 action buttons

### Data Flow
1. `useEffect` triggers on auth → `fetchPurchasedLeads()`
2. API call to `/api/installer/leads/purchased`
3. Returns array of `PurchasedLead[]` objects
4. Maps to component state
5. Renders single list of all purchased leads

---

## 2. REQUIREMENTS

### Requirement 1: Tab Navigation
**User Request**: "create tabs in the purchased leads page : Call/Visit, Written Quotes, Bidding"

**Implementation Needs**:
- Tab component with 3 tabs: Call/Visit, Written Quotes, Bidding
- Active tab indicator
- Tab click handlers
- Filter leads by `quoteType` field
- Show lead count per tab
- Default to first tab with leads

### Requirement 2: Lead Card Redesign
**User Request**: "The lead card in the purchased leads page should follow the same UI design as the lead feed lead card"

**SOT Reference**: `src/components/InstallerLeadFeed.tsx` LeadCard component (lines ~516-780)

**Implementation Needs**:
- Extract/reuse InstallerLeadFeed LeadCard design
- Adapt for purchased leads context (already unlocked)
- Remove unlock button (not needed for purchased leads)
- Maintain contact reveal functionality
- Keep semantic classes only

---

## 3. GAP ANALYSIS

### Gap 1: No Tab System
**Current**: Single flat list of all purchased leads  
**Required**: Three tabs filtering by lead type  
**Impact**: Medium - requires tab UI component + filtering logic  

### Gap 2: Different Card Design
**Current**: Custom purchased leads card design  
**Required**: InstallerLeadFeed LeadCard design (SOT)  
**Impact**: High - requires card component refactor  
**Files Affected**:
- `src/app/installer/(dashboard)/purchased-leads/page.tsx` (main file)

### Gap 3: Quote Type Filtering
**Current**: No filtering by quote type  
**Required**: Filter by CALL_VISIT, WRITTEN_QUOTE, BIDDING  
**Impact**: Low - add filter function  

---

## 4. COMPONENT TREE MAPPING

### Current Tree
```
PurchasedLeadsPage (page.tsx)
├── Stats Cards (3x neumorphic cards)
└── Lead Cards List (map over leads[])
    └── Custom Purchased Lead Card
        ├── Header (badges, date)
        ├── Contact Section (revealed)
        ├── Details Grid
        └── Actions (price + buttons)
```

### Required Tree
```
PurchasedLeadsPage (page.tsx)
├── Stats Cards (3x neumorphic cards) [KEEP AS-IS]
├── Tab Navigation [NEW]
│   ├── Call/Visit Tab
│   ├── Written Quotes Tab
│   └── Bidding Tab
└── Lead Cards List (filtered by active tab)
    └── InstallerLeadFeed-style Card [REPLACE]
        ├── Header (type badge, status, priority)
        ├── Location Info
        ├── System Details
        ├── Contact Info (revealed for purchased)
        ├── Countdown (if applicable)
        └── Actions (view details, contact)
```

---

## 5. IMPLEMENTATION PLAN

### Phase 0: Pre-Implementation
- [x] GATE 0 health check passed
- [x] Audit report created
- [ ] Read design system guidelines
- [ ] Map InstallerLeadFeed LeadCard structure

### Phase 1: Add Tab Navigation (UI Only)
**Files**: `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Tasks**:
1. Add state: `const [activeTab, setActiveTab] = useState<'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'>('CALL_VISIT')`
2. Create tab UI component (semantic classes only)
3. Calculate lead counts per tab
4. Add tab click handlers
5. Add filter function: `const filteredLeads = leads.filter(lead => lead.quoteType === activeTab)`

**Testing Checkpoint**:
- Visual: Tabs render correctly
- Functional: Tab switching works
- Data: Correct leads show per tab
- Theme: All 3 themes work (Dark, Light, Purple)

### Phase 2: Replace Lead Card Design
**Files**: `src/app/installer/(dashboard)/purchased-leads/page.tsx`

**Tasks**:
1. Study InstallerLeadFeed LeadCard structure (lines 516-780)
2. Identify reusable patterns
3. Replace purchased lead card with adapted InstallerLeadFeed design
4. Ensure contact details are always revealed (isPurchased state)
5. Remove unlock button (not applicable for purchased leads)
6. Keep view details, call, email buttons
7. Verify semantic classes only (no hardcoded colors)

**Testing Checkpoint**:
- Visual: Cards match InstallerLeadFeed design
- Functional: All buttons work
- Data: Contact details revealed correctly
- Theme: All 3 themes work (Dark, Light, Purple)
- Responsive: Works on 320px, 768px, 1440px

### Phase 3: Verification
**Tasks**:
1. Run 6 verification commands (0/0/0/0/0/0 expected)
2. Test Dark, Light, Purple themes
3. Test breakpoints: 320px, 768px, 1440px
4. Browser console: No errors
5. Network tab: API calls work
6. Manual testing: All features work

---

## 6. VERIFICATION STRATEGY

### Verification Commands (PowerShell)
```powershell
# Command 1: Hardcoded gray/slate colors
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"

# Command 2: Dark mode classes
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "dark:"

# Command 3: RGB/HEX colors
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"

# Command 4: Hardcoded white/black
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Command 5: Hardcoded typography
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"

# Command 6: Manual responsive classes
Select-String -Path "src\app\installer\(dashboard)\purchased-leads\page.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Expected Result**: 0/0/0/0/0/0

### Test Cases

**TC1: Tab Navigation**
1. Open purchased leads page
2. Verify 3 tabs visible: Call/Visit, Written Quotes, Bidding
3. Click each tab → Verify only matching leads show
4. Verify lead count badges on tabs
5. Verify active tab styling

**TC2: Lead Card Design**
1. Compare purchased lead card with InstallerLeadFeed lead card
2. Verify same layout structure
3. Verify same neumorphic styling
4. Verify contact details always visible (no locks)
5. Verify no unlock button present

**TC3: Multi-Theme**
1. Switch to Dark theme → Verify tabs and cards render correctly
2. Switch to Light theme → Verify neumorphic effects work
3. Switch to Purple theme → Verify purple accent colors applied

**TC4: Responsive**
1. Resize to 320px → Verify tabs stack/scroll, cards adjust
2. Resize to 768px → Verify tablet layout
3. Resize to 1440px → Verify desktop layout

---

## 7. ROOT CAUSE ANALYSIS

### Why Current Implementation Differs

**Historical Context**:
- Purchased leads page was built separately from lead feed
- Different use case: purchased leads don't need unlock functionality
- No requirement for tabs at initial build
- Custom design made sense at the time

**Why Change is Needed**:
- User feedback: inconsistent UX between pages
- Design system: single SOT for lead cards
- Maintenance: easier to maintain one card design
- Tabs: better organization for multiple lead types

---

## 8. RISK ASSESSMENT

### Low Risk
- Adding tabs (pure UI addition)
- Filtering logic (simple array filter)

### Medium Risk
- Card redesign (structural changes)
- Ensuring all data fields map correctly
- Maintaining semantic classes

### Mitigation
- Test after each phase
- Use existing InstallerLeadFeed as reference
- Verify on all themes and breakpoints
- No backend changes (data structure unchanged)

---

## 9. ROLLBACK PROCEDURE

If issues arise:
1. Current file is 326 lines - easy to restore
2. No database changes
3. No API changes
4. Git commit before starting work

Rollback command:
```bash
git checkout HEAD -- src/app/installer/(dashboard)/purchased-leads/page.tsx
```

---

## 10. SUCCESS CRITERIA

✅ Purchased leads page has 3 working tabs  
✅ Leads filtered correctly by quote type  
✅ Lead card design matches InstallerLeadFeed (SOT)  
✅ Contact details always revealed (no locks)  
✅ No hardcoded colors (verified via 6 commands)  
✅ All 3 themes work (Dark, Light, Purple)  
✅ All breakpoints work (320px, 768px, 1440px)  
✅ No TypeScript errors  
✅ No console errors  
✅ All existing functionality preserved  

---

## 11. FILES TO MODIFY

| File | Lines | Changes | Risk |
|------|-------|---------|------|
| `src/app/installer/(dashboard)/purchased-leads/page.tsx` | 326 | Add tabs, replace card design | Medium |

**Total Files**: 1  
**Estimated Changes**: ~150-200 lines  

---

## 12. DEPENDENCIES

### Component Dependencies
- InstallerLeadFeed LeadCard (reference only, not importing)
- No new npm packages required
- No API changes required

### Design System Dependencies
- Semantic classes from global CSS
- Neumorphic shadows: `shadow-neu-outset`, `shadow-neu-inset`
- Color tokens: `bg-surface`, `text-foreground`, `border-border`
- Typography: `text-heading-1`, `text-body`, `text-caption`
- Buttons: `btn-primary`, `btn-secondary`, `btn-success`

---

## AUDIT COMPLETE ✅

**Next Step**: Create implementation plan in `specs/007-call-visit-lead/tasks.md` and begin Phase 1.
