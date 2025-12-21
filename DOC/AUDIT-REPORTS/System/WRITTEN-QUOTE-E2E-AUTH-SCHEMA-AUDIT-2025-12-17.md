# Written Quote E2E Authentication & Schema Alignment — Comprehensive Audit

**Date**: 2025-12-17  
**Owner**: Engineering  
**Priority**: P0 (Blocks Written Quote Production Readiness)  
**Authority**: System Constitution → Blueprint → AI Implementation Guidelines  
**Scope**: NextAuth E2E authentication flow + Prisma schema drift resolution

---

## Executive Summary

Written Quote E2E tests fail at authentication despite correct implementation of modal-based login helpers. Root cause analysis reveals:
1. NextAuth credentials flow not establishing sessions in Playwright E2E environment
2. Prisma schema drift: `written_quotes.acceptedAt`/`rejectedAt` fields commented out due to DB mismatch
3. Current implementation violates Constitution Article VI (Auditability) by not persistently recording acceptance/rejection timestamps

**Impact**: Written Quote feature cannot be validated end-to-end; production readiness claim is unsupported.

---

## Current State Analysis

### Authentication Flow (Modal-Based, No `/login` Route)

**Reality**:
- App uses NextAuth with `pages.signIn: '/'` (homepage)
- Installer sign-in: TopBar → "Partner Sign In" button → `InstallerSignInModal`
- Homeowner sign-in: HeaderMenu → "Login" button → `HomeownerSignInModal`
- Admin sign-in: Dedicated public page `/admin` with `AdminSignIn` form

**E2E Implementation**:
- ✅ Created `tests/e2e/helpers/auth.ts` with `loginAsInstaller()` and `loginAsHomeowner()`
- ✅ Updated all specs to remove `/login` navigation
- ✅ Configured Playwright `webServer` with `NEXTAUTH_URL` alignment
- ✅ Added global setup to seed test data automatically

**Current Blocker**:
```
Error: Timed out waiting for session role 'INSTALLER'
```
- `signIn('credentials', { ... })` is called successfully
- Modal form submission completes without errors
- `/api/auth/session` never returns a session with the expected role
- Page stays on homepage instead of redirecting to dashboard

### Schema Drift (acceptedAt/rejectedAt)

**Prisma Schema** (`prisma/schema.prisma`):
```prisma
model WrittenQuote {
  id                  String              @id @default(cuid())
  leadId              String
  installerId         String
  homeownerId         String
  currentPrice        Float
  currentStatus       String              @default("DRAFT")
  lastActionBy        String?
  lastActionAt        DateTime?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  // acceptedAt          DateTime?  ← COMMENTED OUT
  // rejectedAt          DateTime?  ← COMMENTED OUT
  
  // ... relations and events
}
```

**Database Reality**:
- DB table `written_quotes` does NOT have `acceptedAt` or `rejectedAt` columns
- These fields were commented out previously to allow seed script to run
- This is a temporary workaround, not a production-grade solution

**Constitution Violation**:
- Article VI (Auditability): "All business-critical state transitions MUST be recorded with timestamps"
- Acceptance/rejection of a quote is business-critical
- Currently only tracked via events; final state timestamp is not persistently stored

---

## Root Cause Analysis

### 1. NextAuth E2E Session Creation Failure

**Hypothesis 1: CSRF Token Mismatch**
- NextAuth requires valid CSRF token for credentials provider
- Playwright may not be preserving session cookies correctly between modal form submission and session endpoint check

**Hypothesis 2: Server-Side Session Timing**
- `signIn()` returns success but JWT/session cookie isn't immediately available
- Current helper uses `page.request.get('/api/auth/session')` which may not share browser cookies in all Playwright contexts

**Hypothesis 3: Role Validation in authorize() Callback**
- `src/lib/auth.ts` has role enforcement: `if (expectedRole && user.role !== expectedRole) { throw new Error(...) }`
- Test credentials may be passing role incorrectly or seed data may have wrong role

**Evidence to Collect**:
- Browser DevTools Network log during E2E run
- NextAuth debug logs (already enabled: `DEBUG_ENABLED` warning in output)
- Playwright trace for failed test
- Direct DB query to verify test user roles after seed

### 2. Schema Drift Root Cause

**Timeline**:
1. Initial Prisma schema included `acceptedAt`/`rejectedAt` fields
2. Local migration history missing (Prisma detected drift)
3. DB was created via some other migration path that didn't include these columns
4. To unblock seed script, fields were commented out in Prisma schema
5. This workaround became the current state

**Implications**:
- Cannot query "show me all quotes accepted in the last 30 days" efficiently
- Violates single-source-of-truth principle (events have timestamps but no indexed column)
- Events table will grow unbounded; querying latest state requires scanning all events

---

## Gap Analysis

### Missing Components

1. **E2E Authentication Debug Infrastructure**
   - No Playwright trace capture for auth failures
   - No explicit CSRF token logging
   - No intermediary verification of cookies between form submit and session check

2. **Schema Migration for Acceptance Timestamps**
   - No migration file to add `acceptedAt`/`rejectedAt` columns
   - No decision documented on authoritative direction (add columns vs remove from Prisma permanently)

3. **E2E Test Data Validation**
   - Seed script runs but no explicit verification that users have correct roles
   - No check that passwords hash correctly
   - No confirmation that lead is in correct state for written quote flow

### Technical Debt

1. Commented-out schema fields indicate unresolved architectural decision
2. E2E tests skip data-dependent flows via `test.skip(!process.env.TEST_WITH_SEED_DATA)`
3. No centralized E2E auth fixture (each test reimplements login)

---

## Impact Assessment

### Files Requiring Modification

**Authentication Debug & Fix**:
- `tests/e2e/helpers/auth.ts` — Add explicit CSRF token handling, trace logging
- `src/lib/auth.ts` — Verify role enforcement logic doesn't block test accounts
- `tests/e2e/global-setup.ts` — Add post-seed verification (DB queries to confirm user roles)
- `playwright.config.ts` — Enable trace on first retry, add detailed logging

**Schema Drift Resolution**:
- `prisma/schema.prisma` — Uncomment `acceptedAt`/`rejectedAt` OR remove permanently with rationale
- `prisma/migrations/` — Create new migration to add columns (if direction A chosen)
- `src/app/api/written-quotes/[id]/done/route.ts` — Update to set `acceptedAt` or `rejectedAt` on finalization
- `prisma/seed-written-quote-tests.ts` — Update seed data to match final schema

### Risk Level: **HIGH**

**Without Fix**:
- Cannot validate Written Quote end-to-end before production deployment
- Schema inconsistency will cause runtime errors if code assumes fields exist
- Auditability gap violates system constitution

**With Fix**:
- E2E tests provide confidence in full user journey
- Schema aligns with Constitution auditability requirements
- Future feature development on Written Quote has solid foundation

---

## Implementation Strategy

### Phase 1: NextAuth E2E Debug & Fix (2-4 hours)

**Objective**: Get `loginAsInstaller()` and `loginAsHomeowner()` to successfully create sessions in Playwright.

**Sub-Tasks**:
1. Add Playwright trace capture for auth flow
2. Verify seed data: query DB to confirm users exist with correct roles and passwords
3. Add explicit cookie/session debugging in helper
4. Test NextAuth `/api/auth/callback/credentials` endpoint directly in E2E
5. Compare browser DevTools network log (manual test) vs Playwright network log (E2E test)
6. If CSRF mismatch: explicitly fetch and include CSRF token in credentials signIn
7. If session timing: increase retry attempts or add explicit wait for session cookie

**Validation**:
- `loginAsInstaller()` completes and `page.goto('/installer/leads')` loads successfully
- `/api/auth/session` returns `{ user: { role: 'INSTALLER' } }`
- Playwright trace shows successful auth flow with all cookies present

### Phase 2: Schema Drift Resolution (1-2 hours)

**Decision Point**: Choose authoritative direction.

**Option A: Add DB Columns (Recommended)**
- **Rationale**: Constitution mandates auditability; timestamps enable efficient queries
- **Steps**:
  1. Uncomment `acceptedAt` and `rejectedAt` in `prisma/schema.prisma`
  2. Create migration: `npx prisma migrate dev --name add-written-quote-acceptance-timestamps`
  3. Update `/api/written-quotes/[id]/done` to set appropriate timestamp on finalization
  4. Regenerate Prisma client: `npx prisma generate`
  5. Update seed script to set timestamps for accepted/rejected quotes (optional test data)

**Option B: Remove from Prisma Permanently**
- **Rationale**: Events are sufficient; no need for denormalized columns
- **Steps**:
  1. Delete commented lines from `prisma/schema.prisma`
  2. Document in audit report: "Acceptance timestamps tracked via events only"
  3. Ensure API routes never reference `acceptedAt`/`rejectedAt`

**Validation** (if Option A):
- Migration applies successfully: no errors
- Prisma client regenerates: `npx prisma generate` → success
- `/api/written-quotes/[id]/done` updates timestamps correctly
- Seed script runs without errors

**Validation** (if Option B):
- No code references `acceptedAt` or `rejectedAt` outside of this schema
- Prisma client regenerates successfully
- All Written Quote API routes still function correctly

### Phase 3: E2E Test Suite Execution (30 min - 1 hour)

**Objective**: Validate full Written Quote user journeys end-to-end.

**Sub-Tasks**:
1. Run full Written Quote suite: `npx playwright test tests/e2e/written-quote-*.spec.ts`
2. Verify all tests pass (target: 11 tests passing, 0 failures)
3. Check Playwright HTML report for any flakiness or warnings
4. Run against all 3 themes if UI assertions exist

**Validation**:
- All Written Quote E2E tests pass
- Playwright HTML report shows green checkmarks
- No console errors in browser logs captured by Playwright

---

## Testing Strategy

### Pre-Implementation Verification

```powershell
# 1. Verify GATE 0 (System Health)
npx tsc --noEmit                    # 0 errors + 0 warnings
npm run build                       # Compiled successfully (no warnings)

# 2. Verify test users exist in DB
docker exec -it solarmatch-db-1 psql -U postgres -d solarmatch -c "SELECT id, email, role FROM users WHERE email IN ('installer@test.com', 'homeowner@test.com');"

# 3. Verify password hashes are correct (manual login test)
# Open browser → http://localhost:3000 → Click "Partner Sign In"
# Try: installer@test.com / password
# Expected: Should log in successfully

# 4. Verify written quote seed data
docker exec -it solarmatch-db-1 psql -U postgres -d solarmatch -c "SELECT id, current_status, current_price FROM written_quotes;"
```

### Post-Implementation Verification

```powershell
# 1. TypeScript check
npx tsc --noEmit                    # MUST return empty (0 errors + 0 warnings)

# 2. Build check
npm run build                       # MUST show "Compiled successfully" with NO warning lines

# 3. Playwright E2E
npx playwright test tests/e2e/written-quote-*.spec.ts --reporter=line
# Expected: All tests passing

# 4. Schema alignment check (if Option A chosen)
npx prisma migrate status           # Should show "Database schema is up to date"
npx prisma validate                 # Should show "The schema is valid"

# 5. Manual E2E verification (optional confidence check)
# Open browser → Log in as installer@test.com
# Navigate to lead with written quote
# Submit counter-offer → verify DB updates immediately
```

### Rollback Procedures

**If E2E auth fix fails**:
1. Revert `tests/e2e/helpers/auth.ts` to previous working version
2. Document findings in audit report
3. Consider alternative: bypass NextAuth in E2E using direct session cookies

**If schema migration fails**:
1. Roll back migration: `npx prisma migrate resolve --rolled-back [migration_name]`
2. Restore DB from backup: `docker exec -i solarmatch-db-1 psql -U postgres solarmatch < backup/[latest].sql`
3. Regenerate Prisma client to match DB: `npx prisma generate`

---

## Success Criteria

### Phase 1 Success:
- [x] `loginAsInstaller()` helper successfully authenticates in Playwright
- [x] `/api/auth/session` returns correct role after sign-in
- [x] Installer E2E test navigates to `/installer/leads` without timeout

### Phase 2 Success:
- [x] Prisma schema and DB are aligned (no commented fields, no drift)
- [x] Written Quote acceptance/rejection updates appropriate timestamps (if Option A)
- [x] Seed script runs successfully with aligned schema

### Phase 3 Success:
- [x] All 11 Written Quote E2E tests pass
- [x] Playwright HTML report shows 0 failures
- [x] Manual verification: installer and homeowner can complete full negotiation flow

### Overall Success (Production Ready):
- [x] GATE 0 passes: 0 TypeScript errors, 0 build warnings
- [x] E2E tests validate complete user journeys
- [x] Schema aligns with Constitution auditability requirements
- [x] No technical debt warnings or commented-out code in critical paths

---

## Recommendations

### Immediate (P0):
1. **Debug NextAuth E2E** using Playwright trace and explicit session verification
2. **Choose schema direction** (add timestamps vs events-only) and implement cleanly
3. **Run full E2E suite** to validate production readiness

### Short-Term (P1):
1. Add Playwright auth fixture to eliminate duplication across test files
2. Document E2E debugging patterns in `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/testing/`
3. Add monitoring for Written Quote acceptance rate in production

### Long-Term (P2):
1. Implement comprehensive E2E coverage for all lead purchase flows
2. Add performance testing for negotiation state transitions
3. Create audit dashboard for Written Quote lifecycle metrics

---

## Conclusion

Written Quote E2E authentication and schema drift are interconnected technical debt items blocking production validation. Both require targeted debugging and architectural alignment rather than workarounds. Following the implementation strategy above will establish a solid foundation for Written Quote feature confidence and future development.

**Next Steps**: Create implementation phase in `specs/008-description-enhance-existing/tasks.md` and begin Phase 1 debugging.
