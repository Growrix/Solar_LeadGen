# Phase 13E: Bid Selection Backend - Audit & Plan

**Date**: 2025-12-07  
**Status**: 🔍 Planning  
**Goal**: Complete backend integration for homeowner bid selection workflow

---

## 1. CURRENT STATE AUDIT

### Database Schema Status ✅ EXCELLENT

**Bid Model** (`prisma/schema.prisma` lines 339-387):
```prisma
model Bid {
  id                  String    @id @default(cuid())
  leadId              String    // ✅ Linked to Lead
  installerId         String    // ✅ Linked to User (installer)
  amount              Float
  finalTotal          Float
  status              String    @default("SUBMITTED")
  selectedAt          DateTime?
  purchasedAt         DateTime?
  rejectedAt          DateTime?
  
  // Phase 13 - Comprehensive JSON fields (8 columns)
  systemData          Json?
  productsData        Json?
  lineItems           Json?
  assumptions         Json?
  roofData            Json?
  calculations        Json?
  importMeta          Json?
  installerContact    Json?
  
  // Relations
  lead                Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  installer           User      @relation("installer_bids", fields: [installerId], references: [id])
  
  // Indexes
  @@unique([leadId, installerId])  // ✅ One bid per installer per lead
  @@index([leadId])
  @@index([installerId])
  @@index([status])
}
```

**Key Findings**:
- ✅ `leadId` and `installerId` already present with proper relations
- ✅ `status` field for tracking bid lifecycle (SUBMITTED, SELECTED, REJECTED)
- ✅ `selectedAt` timestamp for audit trail
- ✅ Unique constraint prevents duplicate bids from same installer
- ✅ Cascade delete on lead deletion
- ✅ All Phase 13 JSON fields present

**Lead Model** (`prisma/schema.prisma` lines 162-218):
```prisma
model Lead {
  id                    String            @id @default(cuid())
  homeownerId           String            // ✅ Owner identification
  status                LeadStatus        @default(DRAFT)
  purchasedAt           DateTime?         // ✅ Winner selection timestamp
  expiresAt             DateTime?         // ✅ Countdown expiry
  
  // Relations
  homeowner             User              @relation("homeowner_leads", fields: [homeownerId], references: [id])
  bids                  Bid[]             // ✅ One-to-many relationship
}
```

**Key Findings**:
- ✅ `homeownerId` for ownership validation
- ✅ `status` enum for lead lifecycle
- ✅ `purchasedAt` for tracking winner selection
- ✅ `expiresAt` for countdown validation
- ✅ One-to-many relationship with bids

**Status**: ✅ **NO SCHEMA CHANGES NEEDED**

---

### API Endpoints Status

#### ✅ EXISTING ENDPOINTS (Phase 13B/13C)

**1. POST /api/bids** (`src/app/api/bids/route.ts` lines 1-181)
- **Purpose**: Installer submits bid
- **Status**: ✅ Complete with Phase 13 JSON fields
- **Access**: INSTALLER only
- **Validations**: leadId, amount required; lead exists; no duplicate bid

**2. GET /api/bids?leadId={leadId}** (`src/app/api/bids/route.ts` lines 186-309)
- **Purpose**: Fetch all bids for a lead
- **Status**: ✅ Complete with full data
- **Access**: HOMEOWNER (own leads) or ADMIN
- **Returns**: Array of bids with installer details + Phase 13 data
- **Used By**: HomeownerBiddingReviewModal (Phase 13D)

**3. POST /api/bids/[bidId]/select** (`src/app/api/bids/[bidId]/select/route.ts`)
- **Purpose**: Homeowner selects winning bid
- **Status**: ✅ Complete with transaction
- **Access**: HOMEOWNER only (must own lead)
- **Validations**: 
  - ✅ Countdown expired (expiresAt check)
  - ✅ Bid status is SUBMITTED
  - ✅ No existing winner
  - ✅ Homeowner owns lead
- **Actions**:
  - ✅ Set bid status to SELECTED
  - ✅ Set selectedAt timestamp
  - ✅ Reject all other bids (status = REJECTED)
  - ✅ Atomic transaction

**Gap**: Does NOT update lead status to PURCHASED or send notifications

**4. POST /api/bids/[bidId]/purchase** (`src/app/api/bids/[bidId]/purchase/route.ts`)
- **Purpose**: Unknown (needs investigation)
- **Status**: ⚠️ Needs review

---

## 2. GAP ANALYSIS

### Original Backend Plan Review

| Requirement | Current Status | Gap | Priority |
|-------------|----------------|-----|----------|
| GET /api/bids/lead/[leadId] | ✅ Exists as GET /api/bids?leadId | ✅ Complete | - |
| POST /api/bids/[bidId]/select-winner | ✅ Exists as POST /api/bids/[bidId]/select | ⚠️ Partial | P1 |
| Lead status → PURCHASED | ❌ Not implemented | **MISSING** | P1 |
| Unlock contact details | ✅ Already accessible via installerContact JSON | ✅ Complete | - |
| Notify winning installer | ❌ Not implemented | **MISSING** | P2 |
| Notify other installers | ❌ Not implemented | **MISSING** | P3 |
| Security & validation | ✅ Complete (homeowner auth, lead ownership, countdown) | ✅ Complete | - |
| Audit logging | ⚠️ Console logs only | **NEEDS AuditLog table** | P2 |

### Missing Features

**P1 - CRITICAL (Blocking Phase 13E completion)**:
1. **Lead Status Update**: POST /api/bids/[bidId]/select does NOT update lead status to PURCHASED
2. **Frontend Integration**: HomeownerBiddingReviewModal needs to call select endpoint

**P2 - IMPORTANT (User experience)**:
3. **Notification System**: No emails sent to installers
4. **Audit Logging**: Should use AuditLog table, not just console.log

**P3 - NICE TO HAVE (Future enhancement)**:
5. **Rejected Installer Notifications**: Inform losing bidders

---

## 3. ROOT CAUSE ANALYSIS

**Why are features missing?**

1. **Lead Status Update**: Oversight in Phase 13B/13C - focus was on bid status, forgot lead status
2. **Notifications**: Deferred intentionally - notification system not yet built
3. **Frontend Integration**: Phase 13D was UI-only, Phase 13E is integration phase
4. **Audit Logging**: Exists in schema but not utilized in bid selection flow

**Impact Assessment**:
- **High**: Without lead status update, homeowner dashboard won't reflect "purchased" state
- **Medium**: Without notifications, installers have no visibility into outcome
- **Low**: Without audit logs, harder to debug/compliance issues

---

## 4. IMPROVED BACKEND PLAN

### Changes from Original Plan

**Improvements**:
1. ✅ **Use Existing Endpoints**: No need for new /api/bids/lead/[leadId] - already have GET /api/bids?leadId
2. ✅ **Rename Endpoint**: Use existing /select instead of creating /select-winner
3. ✅ **Fix Lead Status**: Add lead status update to transaction
4. ⚠️ **Defer Notifications**: Phase 13E focuses on core workflow, notifications = Phase 13F
5. ✅ **Add Audit Logging**: Use AuditLog table for bid selection events

**Route Structure Decision**:
- ✅ Keep: POST /api/bids/[bidId]/select (already exists, good design)
- ❌ Avoid: Creating /api/bids/lead/[leadId] (would conflict with [bidId] dynamic segment)
- ✅ Solution: Use query parameter pattern /api/bids?leadId={id} (already implemented)

---

## 5. IMPLEMENTATION PLAN

### Phase 13E - Bid Selection Backend Integration

**Goal**: Enable homeowners to select winning bids with proper state management

#### PHASE 0: Pre-Flight Checks (GATE 0)

**T001 [Setup]**: System health validation
```powershell
# Check 1: TypeScript compiles
npx tsc --noEmit

# Check 2: Build succeeds
npm run build

# Check 3: Dev server starts
npm run dev

# Check 4: Prisma schema valid
npx prisma validate

# Check 5: Git status clean
git status

# Check 6: .git folder exists
Test-Path ".git"
```
**Stop Criteria**: If ANY check fails, fix before proceeding

---

#### PHASE 1: Fix POST /api/bids/[bidId]/select Endpoint

**T002 [Backend][P1]**: Add lead status update to transaction
- **File**: `src/app/api/bids/[bidId]/select/route.ts`
- **Action**: Update transaction to set lead status to PURCHASED and purchasedAt timestamp
- **Testing**: 
  ```powershell
  # After code change, immediately test:
  npm run dev
  # Check terminal: Should compile without errors
  
  # Test endpoint with curl or browser:
  # POST http://localhost:3000/api/bids/{bidId}/select
  # Body: { "leadId": "..." }
  
  # Verify in Prisma Studio:
  npx prisma studio
  # Check: bid.status = SELECTED, bid.selectedAt set, lead.status = PURCHASED, lead.purchasedAt set
  ```
- **Stop Criteria**: If TypeScript error or dev server crash, fix immediately

**T003 [Backend][P2]**: Add audit logging
- **File**: `src/app/api/bids/[bidId]/select/route.ts`
- **Action**: Create AuditLog entry for bid selection event
- **Testing**: Verify AuditLog table has new entry with correct metadata

**T004 [Backend]**: Test endpoint edge cases
- **Actions**:
  - Test unauthorized access (non-homeowner)
  - Test selecting bid for different homeowner's lead
  - Test selecting already-selected bid
  - Test selecting bid before countdown expires
- **Expected**: All return appropriate 400/403 errors

**Checkpoint**: Run `npx tsc --noEmit` → 0 errors, test endpoint → 200 response, Prisma Studio → data correct

---

#### PHASE 2: Frontend Integration

**T005 [Frontend][P1]**: Connect HomeownerBiddingReviewModal to backend
- **File**: `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
- **Actions**:
  1. Replace onSelectWinner placeholder with actual API call
  2. Call POST /api/bids/[bidId]/select on confirmation
  3. Handle success/error responses
  4. Show loading state during request
  5. Redirect or update UI on success
- **Testing**: 
  ```powershell
  # Open browser, DevTools → Network tab
  # Navigate to homeowner dashboard
  # Click "View Bids" on a lead
  # Select a bid, confirm selection
  # Verify: POST request sent, 200 response, modal closes, dashboard updates
  ```

**T006 [Frontend]**: Error handling
- **Actions**:
  - Handle network errors gracefully
  - Show error toast/message on failure
  - Prevent double-submission with disabled button
- **Testing**: Disconnect internet, try selecting bid → see error message

**Checkpoint**: Manual browser test → can select winner → dashboard reflects purchase → no console errors

---

#### PHASE 3: Integration Testing

**T007 [Testing]**: End-to-end workflow validation
- **Scenario 1**: Homeowner selects winner
  1. Navigate to dashboard
  2. Click "View Bids" on lead with multiple bids
  3. Switch between bids using dropdown
  4. Click "Select as Winner" on preferred bid
  5. Confirm in modal
  6. Verify: Success message, modal closes, lead status changes to PURCHASED
  7. Verify in Prisma Studio: bid.status = SELECTED, other bids = REJECTED, lead.purchasedAt set

- **Scenario 2**: Countdown validation
  1. Try selecting bid before expiresAt
  2. Verify: 403 error shown

- **Scenario 3**: Duplicate selection prevention
  1. Select winner for lead
  2. Try selecting different bid
  3. Verify: 409 error shown

**T008 [Testing]**: Multi-theme testing
- **Actions**: Test bid review modal in Dark, Light, Purple themes
- **Expected**: No visual breaks, colors correct

**T009 [Testing]**: Responsive testing
- **Actions**: Test at 320px, 768px, 1440px widths
- **Expected**: 2-column layout responsive, no horizontal scroll

**Checkpoint**: All manual tests pass → ready for user acceptance

---

#### PHASE 4: Documentation & Cleanup

**T010 [Docs]**: Update Phase 13E plan document
- **File**: `DOC/PHASE-13E-BID-SELECTION-PLAN.md` (to be created)
- **Content**: Implementation summary, API contracts, testing results

**T011 [Docs]**: Update tasks.md
- **File**: `specs/008-description-enhance-existing/tasks.md`
- **Action**: Add Phase 13E section with task breakdown

**T012 [Git]**: Create completion commit
- **Message**: "feat(backend): Phase 13E complete - bid selection with lead status update and audit logging"

---

## 6. VERIFICATION STRATEGY

### Post-Implementation Checks

**TypeScript Validation**:
```powershell
npx tsc --noEmit
# Expected: 0 errors
```

**Build Validation**:
```powershell
npm run build
# Expected: ✓ Compiled successfully
```

**API Endpoint Tests**:
```powershell
# Test 1: Fetch bids for lead
curl http://localhost:3000/api/bids?leadId={leadId}
# Expected: 200 OK + array of bids

# Test 2: Select winner
curl -X POST http://localhost:3000/api/bids/{bidId}/select \
  -H "Content-Type: application/json" \
  -d '{"leadId":"{leadId}"}'
# Expected: 200 OK + selected bid ID

# Test 3: Verify duplicate prevention
# Repeat Test 2 with same bidId
# Expected: 409 Conflict
```

**Database Verification**:
```powershell
npx prisma studio
# Check:
# - Bid table: Selected bid has status=SELECTED, selectedAt timestamp
# - Bid table: Other bids have status=REJECTED
# - Lead table: Lead has status=PURCHASED, purchasedAt timestamp
# - AuditLog table: Entry exists for bid selection event
```

**Browser Manual Test**:
1. Open http://localhost:3000
2. Login as homeowner
3. Navigate to dashboard
4. Open lead with multiple bids
5. Click "View Bids"
6. Switch between bids in dropdown
7. Click "Select as Winner"
8. Confirm selection
9. Verify: Success message, modal closes, dashboard updates
10. Open DevTools Console: No errors
11. Open DevTools Network tab: POST request shows 200 response

---

## 7. RISK ASSESSMENT

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking existing bid submission | High | Low | Transaction ensures atomicity, existing tests |
| Race condition (simultaneous selection) | Medium | Low | Unique constraint + transaction prevent duplicates |
| Frontend integration bugs | Medium | Medium | Incremental testing after each change |
| Missing error handling | Low | Medium | Comprehensive error messages in API responses |
| Notification system scope creep | High | High | **DEFER to Phase 13F** - keep scope focused |

---

## 8. SUCCESS CRITERIA

Phase 13E is complete when:

✅ **Backend**:
- [ ] POST /api/bids/[bidId]/select updates lead status to PURCHASED
- [ ] POST /api/bids/[bidId]/select creates AuditLog entry
- [ ] All edge case validations work (unauthorized, countdown, duplicates)
- [ ] TypeScript compiles with 0 errors
- [ ] Build succeeds
- [ ] All API tests pass

✅ **Frontend**:
- [ ] HomeownerBiddingReviewModal calls select endpoint on confirmation
- [ ] Loading state shown during API call
- [ ] Success/error messages displayed appropriately
- [ ] Dashboard reflects "purchased" state after selection
- [ ] No console errors

✅ **Integration**:
- [ ] End-to-end workflow works in browser
- [ ] All themes tested (Dark, Light, Purple)
- [ ] All breakpoints tested (320px, 768px, 1440px)
- [ ] Prisma Studio shows correct database state

✅ **Documentation**:
- [ ] Phase 13E plan document created
- [ ] tasks.md updated with Phase 13E
- [ ] Completion commit created

---

## 9. OUT OF SCOPE (Phase 13F - Future)

**Deferred Features**:
1. ❌ Email notifications to winning installer
2. ❌ Email notifications to rejected installers
3. ❌ In-app notification system
4. ❌ SMS notifications
5. ❌ Webhook integrations
6. ❌ Advanced analytics/reporting

**Reasoning**: Keep Phase 13E focused on core workflow. Notifications require:
- Email service setup (SendGrid/AWS SES)
- Email template system
- Notification preferences
- Rate limiting
- Retry logic
- This is a separate feature deserving its own phase

---

## 10. ROLLBACK PROCEDURE

If Phase 13E implementation fails:

**Step 1**: Identify failure point
```powershell
git log --oneline -10
# Find last working commit
```

**Step 2**: Rollback code
```powershell
git reset --hard {commit-hash}
```

**Step 3**: Verify rollback
```powershell
npx tsc --noEmit
npm run build
npm run dev
```

**Step 4**: Document failure
- Create issue in GitHub
- Note what broke and why
- Update audit document with lessons learned

---

## SUMMARY

**Current State**: 
- ✅ Database schema complete (no changes needed)
- ✅ GET /api/bids?leadId endpoint complete
- ⚠️ POST /api/bids/[bidId]/select exists but missing lead status update
- ❌ Frontend integration placeholder only

**Required Work**:
- **P1**: Update select endpoint to set lead.status = PURCHASED
- **P1**: Connect modal to select endpoint
- **P2**: Add audit logging
- **P2**: Comprehensive testing

**Estimated Effort**: 2-3 hours
**Risk Level**: Low (incremental changes, good existing foundation)
**Dependencies**: None (all prerequisites complete)

**Ready to Proceed**: ✅ YES - All audit complete, plan detailed, guidelines understood
