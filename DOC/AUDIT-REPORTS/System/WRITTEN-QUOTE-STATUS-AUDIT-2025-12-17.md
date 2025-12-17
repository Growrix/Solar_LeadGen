# Written Quote Feature - Implementation Status Audit
**Date:** December 17, 2025  
**Status:** PARTIALLY COMPLETE - Database Not Migrated  
**Priority:** P1 (High - Feature non-functional)

---

## Executive Summary

The Written Quote feature is **85% complete in code but 0% functional** because database tables don't exist. All UI components, API routes, and Prisma models are implemented but **migrations were never run**.

**Critical Finding:** WrittenQuote and WrittenQuoteEvent tables DO NOT EXIST in the database despite Prisma schema definitions existing.

---

## Implementation Status by Component

### ✅ UI Components (100% Complete)

#### 1. WrittenQuoteNegotiationPanel
- **File:** `src/components/written-quote/WrittenQuoteNegotiationPanel.tsx` (300 lines)
- **Status:** COMPLETE
- **Features:**
  - Role-aware UI (installer/homeowner)
  - Status badges (draft, pending, installer_turn, homeowner_turn, accepted, rejected)
  - Price display with formatting
  - History timeline with collapsible view
  - Action buttons (offer, counter, accept, reject)
  - Form validation
  - Loading states
- **Design System:** 100% semantic tokens (verified)
- **Issues:** None

#### 2. QuoteBuilderModal Extension
- **File:** `src/components/QuoteBuilderModal.tsx`
- **Status:** COMPLETE
- **Changes:**
  - Mode prop extended: `'quote' | 'bid' | 'written-quote'`
  - Button text changes based on mode
  - WrittenQuoteNegotiationPanel integrated in right column
  - API submission route changes to `/api/written-quotes/start`
- **Issues:** None

#### 3. HomeownerBiddingReviewModal Extension
- **File:** `src/components/homeowner/HomeownerBiddingReviewModal.tsx`
- **Status:** COMPLETE (as of build fix)
- **Changes:**
  - Tab switcher added (Marketplace Bids | Written Quote)
  - activeTab state management
  - Written quote data fetching
  - WrittenQuoteNegotiationPanel integration
  - Action handlers wired
- **Issues:** Notifications commented out (technical debt)

---

### ✅ Prisma Models (100% Complete - Code Only)

#### WrittenQuote Model
- **File:** `prisma/schema.prisma` lines 391-427
- **Status:** DEFINED but NOT MIGRATED
- **Fields:**
  - Core: id, leadId, installerId, homeownerId
  - Negotiation: currentPrice, currentStatus, lastActionBy, lastActionAt
  - Timestamps: createdAt, updatedAt, acceptedAt, rejectedAt
  - Quote Data: 8 JSON fields (systemData, productsData, lineItems, assumptions, roofData, calculations, importMeta, installerContact)
  - Relations: lead, installer, homeowner, events
- **Indexes:** leadId, installerId, homeownerId, currentStatus, createdAt
- **Constraints:** Unique constraint on [leadId, installerId]
- **Issues:** ❌ **MIGRATION NEVER RUN - TABLE DOES NOT EXIST**

#### WrittenQuoteEvent Model
- **File:** `prisma/schema.prisma` lines 429-446
- **Status:** DEFINED but NOT MIGRATED
- **Fields:**
  - id, writtenQuoteId, actorId, actorRole, action
  - priceOffered, notes, timestamp
  - Relations: writtenQuote, actor
- **Indexes:** writtenQuoteId, actorId, timestamp
- **Issues:** ❌ **MIGRATION NEVER RUN - TABLE DOES NOT EXIST**

---

### ⚠️ API Endpoints (100% Complete - Non-functional)

#### 1. POST /api/written-quotes/start
- **File:** `src/app/api/written-quotes/start/route.ts` (199 lines)
- **Status:** COMPLETE but WILL CRASH
- **Features:**
  - Installer-only authorization
  - Lead validation
  - Creates WrittenQuote + WrittenQuoteEvent
  - Comprehensive logging
- **Issues:** 
  - ❌ Will fail with "Table 'written_quotes' doesn't exist"
  - ⚠️ Notification call commented out (technical debt)

#### 2. POST /api/written-quotes/[id]/offer
- **File:** `src/app/api/written-quotes/[id]/offer/route.ts` (163 lines)
- **Status:** COMPLETE but WILL CRASH
- **Features:**
  - Installer-only authorization
  - Price validation
  - Updates quote + creates event
- **Issues:** 
  - ❌ Will fail with "Table 'written_quotes' doesn't exist"
  - ⚠️ Notification call commented out

#### 3. POST /api/written-quotes/[id]/counter
- **File:** `src/app/api/written-quotes/[id]/counter/route.ts` (157 lines)
- **Status:** COMPLETE but WILL CRASH
- **Features:**
  - Homeowner-only authorization
  - Price validation
  - Updates quote + creates event
- **Issues:** 
  - ❌ Will fail with "Table 'written_quotes' doesn't exist"
  - ⚠️ Notification call commented out

#### 4. POST /api/written-quotes/[id]/done
- **File:** `src/app/api/written-quotes/[id]/done/route.ts` (180 lines)
- **Status:** COMPLETE but WILL CRASH
- **Features:**
  - Homeowner-only authorization
  - Action validation (accept/reject)
  - Finalizes quote + creates event
- **Issues:** 
  - ❌ Will fail with "Table 'written_quotes' doesn't exist"
  - ⚠️ Notification call commented out

#### 5. GET /api/written-quotes/get
- **File:** `src/app/api/written-quotes/get/route.ts` (128 lines)
- **Status:** COMPLETE but WILL CRASH
- **Features:**
  - Fetches quote with events
  - Role-based filtering
  - Comprehensive logging
- **Issues:** 
  - ❌ Will fail with "Table 'written_quotes' doesn't exist"

---

### ❌ Database Migrations (0% Complete)

#### Migration Status
- **Last Migration:** `20251214102204_add_bidding_leads_limit`
- **WrittenQuote Migration:** **NOT FOUND**
- **Search Results:** 0 matches for "WrittenQuote" in migrations folder

#### What's Missing
```sql
-- Required migration (NOT EXISTS):
CREATE TABLE "written_quotes" (
  "id" TEXT PRIMARY KEY,
  "leadId" TEXT NOT NULL,
  "installerId" TEXT NOT NULL,
  "homeownerId" TEXT NOT NULL,
  "currentPrice" DOUBLE PRECISION NOT NULL,
  "currentStatus" TEXT DEFAULT 'DRAFT',
  "lastActionBy" TEXT,
  "lastActionAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "systemData" JSONB,
  "productsData" JSONB,
  "lineItems" JSONB,
  "assumptions" JSONB,
  "roofData" JSONB,
  "calculations" JSONB,
  "importMeta" JSONB,
  "installerContact" JSONB,
  CONSTRAINT "written_quotes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE,
  CONSTRAINT "written_quotes_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "written_quotes_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "written_quotes_leadId_installerId_key" ON "written_quotes"("leadId", "installerId");
CREATE INDEX "written_quotes_leadId_idx" ON "written_quotes"("leadId");
CREATE INDEX "written_quotes_installerId_idx" ON "written_quotes"("installerId");
CREATE INDEX "written_quotes_homeownerId_idx" ON "written_quotes"("homeownerId");
CREATE INDEX "written_quotes_currentStatus_idx" ON "written_quotes"("currentStatus");
CREATE INDEX "written_quotes_createdAt_idx" ON "written_quotes"("createdAt");

CREATE TABLE "written_quote_events" (
  "id" TEXT PRIMARY KEY,
  "writtenQuoteId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "priceOffered" DOUBLE PRECISION,
  "notes" TEXT,
  "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "written_quote_events_writtenQuoteId_fkey" FOREIGN KEY ("writtenQuoteId") REFERENCES "written_quotes"("id") ON DELETE CASCADE,
  CONSTRAINT "written_quote_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "written_quote_events_writtenQuoteId_idx" ON "written_quote_events"("writtenQuoteId");
CREATE INDEX "written_quote_events_actorId_idx" ON "written_quote_events"("actorId");
CREATE INDEX "written_quote_events_timestamp_idx" ON "written_quote_events"("timestamp");
```

---

### ⚠️ Notifications (Technical Debt)

All 4 API routes have notification calls commented out:
- `src/app/api/written-quotes/start/route.ts` line 157
- `src/app/api/written-quotes/[id]/offer/route.ts` line 127
- `src/app/api/written-quotes/[id]/counter/route.ts` line 122
- `src/app/api/written-quotes/[id]/done/route.ts` line 143

**Issue:** Using old notification interface (`userId`, `type`, `title`, `message`) instead of new interface (`recipientUserId`, `role`, `actionType`, `messageKey`, `routeKey`)

**Impact:** Users won't receive email/push notifications for written quote events

---

## Completion Status Summary

| Component | Code Complete | Functional | Status |
|-----------|---------------|------------|--------|
| WrittenQuoteNegotiationPanel | ✅ 100% | ❌ No (no data) | Ready |
| QuoteBuilderModal Extension | ✅ 100% | ❌ No (API fails) | Ready |
| HomeownerBiddingReviewModal | ✅ 100% | ❌ No (API fails) | Ready |
| Prisma Models | ✅ 100% | ❌ No (not migrated) | Ready |
| API Routes | ✅ 100% | ❌ No (tables don't exist) | Ready |
| Database Tables | ❌ 0% | ❌ No | **BLOCKING** |
| Notifications | ⚠️ Commented | ❌ No | Debt |
| E2E Tests | ❌ 0% | ❌ No | Not started |

**Overall:** 85% code complete, 0% functional

---

## Fix Plan (Prioritized)

### 🔴 CRITICAL - P0 (Required for Feature to Work)

#### 1. Create and Run Database Migration
**Estimated Time:** 15 minutes  
**Risk:** Low (straightforward migration)

**Steps:**
```powershell
# Generate migration
npx prisma migrate dev --name add_written_quote_tables

# This will:
# 1. Read schema.prisma
# 2. Generate SQL migration
# 3. Apply to database
# 4. Regenerate Prisma Client
```

**Validation:**
```powershell
# Verify tables exist
npx prisma studio
# → Navigate to WrittenQuote and WrittenQuoteEvent tables
# → Should see empty tables with correct schema
```

**Success Criteria:**
- Migration file created in `prisma/migrations/`
- Tables `written_quotes` and `written_quote_events` exist in database
- Foreign keys and indexes created
- Unique constraint on [leadId, installerId] enforced
- Prisma Client regenerated with WrittenQuote types

---

### 🟡 HIGH PRIORITY - P1 (Required for Production)

#### 2. Fix Notification Calls
**Estimated Time:** 30 minutes  
**Risk:** Medium (requires understanding new notification service)

**Changes Required:**
For each of the 4 API routes, replace commented notification calls with proper implementation:

**Example (start route):**
```typescript
// OLD (commented out):
// await createNotification({
//   userId: lead.homeownerId,
//   type: NotificationType.LEAD_UPDATE,
//   title: 'New Written Quote Received',
//   ...
// });

// NEW (correct interface):
await createNotification({
  recipientUserId: lead.homeownerId,
  role: UserRole.HOMEOWNER,
  actionType: NotificationType.NEW_QUOTE, // Use appropriate type
  messageKey: 'homeowner.written_quote.received',
  routeKey: 'homeowner.leads',
  routeParams: { leadId: body.leadId },
  metadata: {
    writtenQuoteId: writtenQuote.id,
    installerId: auth.userId,
    price: body.initialPrice
  }
});
```

**Files to Update:**
1. `src/app/api/written-quotes/start/route.ts` - Homeowner receives "New quote received"
2. `src/app/api/written-quotes/[id]/offer/route.ts` - Homeowner receives "Counter-offer received"
3. `src/app/api/written-quotes/[id]/counter/route.ts` - Installer receives "Homeowner countered"
4. `src/app/api/written-quotes/[id]/done/route.ts` - Installer receives "Quote accepted/rejected"

**Additional Work:**
- Add message keys to `src/lib/notifications/message-catalog.ts`
- Add route mappings to `src/lib/notifications/route-resolver.ts`
- Test notifications in both Pusher (real-time) and SendGrid (email)

**Success Criteria:**
- All 4 routes send notifications
- Users receive real-time notifications
- Email notifications sent via SendGrid
- Notification text uses neutral language (not "lead/purchase" terminology)

---

#### 3. Create Playwright E2E Tests
**Estimated Time:** 2-3 hours  
**Risk:** Medium (requires test data setup)

**Test Files to Create:**

**3a. `tests/e2e/written-quote-installer.spec.ts`**
```typescript
test('Installer can submit written quote', async ({ page }) => {
  // Login as installer
  // Navigate to assigned lead
  // Open QuoteBuilderModal in 'written-quote' mode
  // Fill all required fields (system, pricing, etc.)
  // Click "Submit Quote"
  // Assert API call to POST /api/written-quotes/start
  // Assert success notification
  // Assert quote appears in database
});
```

**3b. `tests/e2e/written-quote-homeowner.spec.ts`**
```typescript
test('Homeowner can review and counter written quote', async ({ page }) => {
  // Setup: Create written quote via API
  // Login as homeowner
  // Navigate to lead
  // Open HomeownerBiddingReviewModal
  // Switch to "Written Quote" tab
  // Verify quote displays correctly
  // Click "Counter" and enter new price
  // Assert API call to POST /api/written-quotes/[id]/counter
  // Assert notification sent to installer
});

test('Homeowner can accept written quote', async ({ page }) => {
  // Setup: Create written quote via API
  // Login as homeowner
  // Navigate to lead
  // Open modal → Written Quote tab
  // Click "Accept Quote"
  // Assert API call to POST /api/written-quotes/[id]/done
  // Assert status = ACCEPTED
  // Assert notification sent to installer
});
```

**3c. `tests/e2e/written-quote-negotiation.spec.ts`**
```typescript
test('Full negotiation flow', async ({ page }) => {
  // Installer submits initial quote ($9000)
  // Homeowner counters ($8500)
  // Installer revises ($8750)
  // Homeowner accepts
  // Assert final price = $8750
  // Assert status = ACCEPTED
  // Assert 4 events logged (start, counter, offer, accept)
  // Assert all events visible in history
});
```

**Success Criteria:**
- All tests pass
- No flaky tests
- Tests run in under 2 minutes
- Tests clean up after themselves (delete test data)

---

### 🟢 MEDIUM PRIORITY - P2 (Nice to Have)

#### 4. Design System Verification
**Estimated Time:** 15 minutes  
**Risk:** Low (already done for WrittenQuoteNegotiationPanel)

Run all 6 verification commands on HomeownerBiddingReviewModal:
```powershell
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "dark:"
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "text-white|bg-white|text-black|bg-black"
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"
Select-String -Path "src\components\homeowner\HomeownerBiddingReviewModal.tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Success Criteria:** All 6 commands return 0 matches (0/0/0/0/0/0)

---

#### 5. Multi-Theme Testing
**Estimated Time:** 30 minutes  
**Risk:** Low

Test all 3 themes:
- Dark theme: Verify colors, shadows, contrast
- Light theme: Verify neumorphic styling
- Purple theme: Verify purple shadows and accent colors

Test all 5 breakpoints:
- 320px (mobile small)
- 375px (mobile medium)
- 768px (tablet)
- 1024px (desktop small)
- 1440px (desktop large)

**Success Criteria:** All themes and breakpoints render correctly

---

#### 6. Documentation Updates
**Estimated Time:** 15 minutes  
**Risk:** None

Update:
- `specs/008-description-enhance-existing/tasks.md`: Mark T-WQ-201 through T-WQ-222 complete
- `DOC/FEATURES/Written Quote/MODAL-REUSE-STRATEGY-2025-12-15.md`: Add "✅ Implementation Complete" badge
- Add implementation summary: LOC added, files modified, components created

---

## Recommended Execution Order

### Day 1 (2 hours)
1. ✅ **Create database migration** (15 min) - CRITICAL
2. ✅ **Verify tables exist** (5 min) - CRITICAL
3. ✅ **Test API endpoints manually** (30 min) - Verify no crashes
4. ✅ **Fix notification calls** (30 min) - HIGH
5. ✅ **Test notifications work** (15 min) - HIGH
6. ✅ **Manual UI testing** (30 min) - Both installer and homeowner flows

### Day 2 (3 hours)
7. ✅ **Create E2E tests** (2 hours) - HIGH
8. ✅ **Run tests and fix failures** (1 hour) - HIGH

### Day 3 (1 hour)
9. ✅ **Design system verification** (15 min) - MEDIUM
10. ✅ **Multi-theme testing** (30 min) - MEDIUM
11. ✅ **Update documentation** (15 min) - MEDIUM

**Total Estimated Time:** 6 hours  
**Risk Level:** Low (most work is straightforward)

---

## Success Criteria (Feature Complete)

### Code Quality
- [x] Build passes: `npm run build` succeeds
- [x] TypeScript check: `npx tsc --noEmit` returns 0 errors
- [ ] Design system verification: 0/0/0/0/0/0 on all files
- [ ] No ESLint warnings in written quote files

### Functionality
- [ ] Database tables created and migrated
- [ ] All 5 API endpoints functional
- [ ] UI components fetch and display data correctly
- [ ] Notifications sent for all events
- [ ] E2E tests pass (3 test files)

### User Experience
- [ ] Installer can submit written quote
- [ ] Homeowner can counter or accept
- [ ] Full negotiation flow works end-to-end
- [ ] History displays correctly
- [ ] All 3 themes work (Dark/Light/Purple)
- [ ] All 5 breakpoints work (responsive)
- [ ] WCAG 2.1 AA accessibility compliance

### Documentation
- [ ] All tasks marked complete in tasks.md
- [ ] Implementation summary documented
- [ ] MODAL-REUSE-STRATEGY marked complete

---

## Risk Assessment

### Low Risk Items ✅
- Database migration (straightforward)
- Design system verification (already done for main component)
- Documentation updates (no code changes)

### Medium Risk Items ⚠️
- Notification refactoring (requires understanding new service)
- E2E test creation (requires test data setup)
- Multi-theme testing (manual visual checks)

### High Risk Items ⛔
- **None** - All critical blockers are low-risk

---

## Conclusion

The Written Quote feature is **code-complete but non-functional** due to missing database migration. This is a **15-minute fix** to unblock the feature. Once tables are created:

1. API endpoints will work immediately
2. UI will fetch and display data correctly
3. Feature will be ~90% complete

Remaining work (notifications, tests, verification) is **nice-to-have for production** but not blocking for basic functionality.

**Recommendation:** Run database migration immediately, then prioritize notification fixes and E2E tests for production readiness.

---

**Report Completed:** December 17, 2025  
**Next Action:** Run `npx prisma migrate dev --name add_written_quote_tables`
