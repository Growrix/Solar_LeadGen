# Implementation Plan: Admin Homeowners Management Page Fix

**Date:** November 17, 2025  
**Related Audit:** `09-HOMEOWNERS-MANAGEMENT-PAGE-AUDIT.md`  
**Estimated Duration:** 4-6 hours

---

## 🎯 OBJECTIVES

1. **Fix missing user names** in admin homeowners table
2. **Add address column** showing primary property address
3. **Add IP address column** showing signup/latest IP
4. **Add quote type indicator** showing residential/commercial preference
5. **Ensure zero regression** in existing functionality

---

## 📋 IMPLEMENTATION PHASES

### PHASE 1: Data Backfill & Name Field Fix (2 hours)

**Priority:** P0 - CRITICAL  
**Goal:** Ensure all homeowners have names displayed

#### Tasks:

**1.1 Backfill Missing Names from Leads**
```sql
-- Script: prisma/scripts/backfill-homeowner-names.sql
UPDATE users u
SET name = (
  SELECT l.name 
  FROM leads l 
  WHERE l."homeownerId" = u.id 
    AND l.name IS NOT NULL 
  ORDER BY l."createdAt" ASC 
  LIMIT 1
)
WHERE u.role = 'HOMEOWNER' 
  AND u.name IS NULL
  AND EXISTS (
    SELECT 1 FROM leads l 
    WHERE l."homeownerId" = u.id 
      AND l.name IS NOT NULL
  );
```

**1.2 Verify Data Integrity**
```sql
-- Check count of homeowners with NULL names
SELECT COUNT(*) as null_name_count
FROM users
WHERE role = 'HOMEOWNER' AND name IS NULL;

-- Should return 0 after backfill
```

**1.3 Update Registration Validation**
- File: `src/app/api/auth/register/homeowner/route.ts`
- Make `name` field **required** (not optional)
- Update validation error messages

**1.4 Update Frontend Registration Form**
- File: `src/components/auth/HomeownersInfoForm.tsx` (if exists)
- Add visual indicator that name is required
- Update placeholder text

**1.5 Test**
- [ ] Verify all existing homeowners now show names
- [ ] Test new registration requires name
- [ ] Test API still returns correct data

---

### PHASE 2: Add IP Address Capture & Display (1.5 hours)

**Priority:** P1 - HIGH  
**Goal:** Capture and display IP address for admin tracking

#### Tasks:

**2.1 Update Prisma Schema**
```prisma
model User {
  // ... existing fields
  
  signupIp         String?   // IP at registration
  signupUserAgent  String?   // Browser at registration
  lastLoginIp      String?   // IP at last login (future use)
}
```

**2.2 Create Migration**
```bash
npx prisma migrate dev --name add_signup_ip_to_users
```

**2.3 Update Registration Endpoint**
- File: `src/app/api/auth/register/homeowner/route.ts`
- Capture IP from headers:
```typescript
const signupIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
              || request.headers.get('x-real-ip') 
              || 'unknown';
const signupUserAgent = request.headers.get('user-agent') || 'unknown';

const user = await prisma.user.create({
  data: {
    // ... existing fields
    signupIp,
    signupUserAgent,
  },
});
```

**2.4 Backfill Existing Users' IP from AuditLog**
```sql
-- Script: prisma/scripts/backfill-signup-ips.sql
UPDATE users u
SET "signupIp" = (
  SELECT a."ipAddress"
  FROM "audit_logs" a
  WHERE a."userId" = u.id
  ORDER BY a."createdAt" ASC
  LIMIT 1
)
WHERE u.role = 'HOMEOWNER' 
  AND u."signupIp" IS NULL
  AND EXISTS (
    SELECT 1 FROM "audit_logs" a 
    WHERE a."userId" = u.id 
      AND a."ipAddress" IS NOT NULL
  );
```

**2.5 Update API Response**
- File: `src/app/api/admin/homeowners/route.ts`
- Add `signupIp` to SELECT query
- Update interface to include signupIp

**2.6 Update Frontend Table**
- File: `src/components/AdminHomeownersList.tsx`
- Add new column "IP Address"
- Display signupIp with fallback to "Not captured"

**2.7 Test**
- [ ] New registrations capture IP
- [ ] Existing users show backfilled IPs
- [ ] Admin table displays IP column
- [ ] IP column is sortable/filterable

---

### PHASE 3: Add Address & Quote Type Aggregation (2 hours)

**Priority:** P1 - HIGH  
**Goal:** Show property address and quote type preferences

#### Tasks:

**3.1 Update API to Include Aggregated Data**
- File: `src/app/api/admin/homeowners/route.ts`

**Current Query (Raw SQL):**
```typescript
const itemsRaw = await prisma.$queryRaw<Array<{
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  createdAt: Date;
  isActive: boolean;
  phoneVerified: boolean;
  leadSubmissionCount: number;
  leadSubmissionLimit: number;
  signupIp: string | null; // NEW
}>>(/* existing query */);
```

**NEW Query (with aggregations):**
```typescript
const itemsRaw = await prisma.$queryRaw<Array<{
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  createdAt: Date;
  isActive: boolean;
  phoneVerified: boolean;
  leadSubmissionCount: number;
  leadSubmissionLimit: number;
  signupIp: string | null;
  // NEW AGGREGATED FIELDS
  primaryAddress: string | null;
  residentialLeadCount: number;
  commercialLeadCount: number;
  mostUsedQuoteType: string | null;
}>>(
  Prisma.sql`
    SELECT
      u."id",
      u."name",
      u."email",
      u."phone",
      u."postcode",
      u."createdAt",
      u."isActive",
      u."phoneVerified",
      u."leadSubmissionCount",
      u."leadSubmissionLimit",
      u."signupIp",
      
      -- Get primary address from latest lead
      (
        SELECT l."address"
        FROM "leads" l
        WHERE l."homeownerId" = u."id"
          AND l."address" IS NOT NULL
        ORDER BY l."createdAt" DESC
        LIMIT 1
      ) as "primaryAddress",
      
      -- Count residential leads (propertyType = 'residential')
      (
        SELECT COUNT(*)::int
        FROM "leads" l
        WHERE l."homeownerId" = u."id"
          AND l."propertyType" = 'residential'
      ) as "residentialLeadCount",
      
      -- Count commercial leads (propertyType = 'commercial')
      (
        SELECT COUNT(*)::int
        FROM "leads" l
        WHERE l."homeownerId" = u."id"
          AND l."propertyType" = 'commercial'
      ) as "commercialLeadCount",
      
      -- Get most used quote type
      (
        SELECT l."quoteType"
        FROM "leads" l
        WHERE l."homeownerId" = u."id"
        GROUP BY l."quoteType"
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as "mostUsedQuoteType"
      
    FROM "users" u
    ${whereClause}
    ORDER BY u."createdAt" DESC
    OFFSET ${offset}
    LIMIT ${pageSize}
  `
);
```

**3.2 Update TypeScript Interfaces**
```typescript
interface Homeowner {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  phoneVerified: boolean;
  leadSubmissionCount: number;
  leadSubmissionLimit: number;
  remainingLeadAllowance: number;
  signupIp: string | null; // NEW
  primaryAddress: string | null; // NEW
  residentialLeadCount: number; // NEW
  commercialLeadCount: number; // NEW
  mostUsedQuoteType: string | null; // NEW
}
```

**3.3 Update Frontend Table Columns**
- File: `src/components/AdminHomeownersList.tsx`

**Add new columns to desktop table:**
```tsx
<th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
  Address
</th>
<th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
  Quote Type
</th>
<th className="px-6 py-3 text-left text-caption text-muted-foreground uppercase tracking-wider">
  IP Address
</th>
```

**Add data cells:**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-body-small text-foreground">
    {homeowner.primaryAddress || 'No address yet'}
  </div>
</td>

<td className="px-6 py-4 whitespace-nowrap">
  {homeowner.residentialLeadCount > 0 || homeowner.commercialLeadCount > 0 ? (
    <div className="flex flex-col gap-1">
      {homeowner.residentialLeadCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-caption bg-primary/10 text-primary rounded">
          <HomeIcon className="h-3 w-3" />
          {homeowner.residentialLeadCount} Residential
        </span>
      )}
      {homeowner.commercialLeadCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-caption bg-info/10 text-info rounded">
          <BuildingIcon className="h-3 w-3" />
          {homeowner.commercialLeadCount} Commercial
        </span>
      )}
    </div>
  ) : (
    <span className="text-caption text-muted-foreground">No leads yet</span>
  )}
</td>

<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-body-small text-muted-foreground font-mono">
    {homeowner.signupIp || 'Not captured'}
  </div>
</td>
```

**3.4 Update Mobile Cards**
- Add address, quote type, and IP to mobile view

**3.5 Add Filter Options**
- Add filter for "Residential Only" / "Commercial Only"
- Add filter for "Has Address" / "No Address"

**3.6 Test**
- [ ] Address column shows correct property address
- [ ] Quote type shows residential/commercial count
- [ ] IP address displays correctly
- [ ] Filters work as expected
- [ ] Sorting works for new columns
- [ ] Mobile view displays new data

---

### PHASE 4: Performance Optimization & Polish (0.5 hours)

**Priority:** P2 - NICE TO HAVE  
**Goal:** Ensure fast load times and good UX

#### Tasks:

**4.1 Add Database Indexes**
```sql
-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_signup_ip ON users("signupIp");
CREATE INDEX IF NOT EXISTS idx_leads_homeowner_address ON leads("homeownerId", "address");
CREATE INDEX IF NOT EXISTS idx_leads_homeowner_property_type ON leads("homeownerId", "propertyType");
```

**4.2 Add Loading States**
- Skeleton loaders for new columns
- Shimmer effect while data loads

**4.3 Add Tooltips**
- IP address: "IP captured during registration"
- Quote type: "Based on all submitted leads"
- Address: "From most recent lead submission"

**4.4 Test Performance**
- [ ] API response time < 500ms for 1000 users
- [ ] No N+1 query issues
- [ ] Pagination works smoothly

---

## 🧪 COMPREHENSIVE TESTING PLAN

### Unit Tests

**Test File:** `__tests__/api/admin/homeowners.test.ts`

```typescript
describe('GET /api/admin/homeowners', () => {
  it('should return homeowners with all fields', async () => {
    // Test basic retrieval
  });
  
  it('should include aggregated address data', async () => {
    // Test address aggregation
  });
  
  it('should include quote type counts', async () => {
    // Test quote type aggregation
  });
  
  it('should include signup IP', async () => {
    // Test IP display
  });
});
```

### Integration Tests

1. **Registration Flow Test:**
   - Create new homeowner account
   - Verify name is captured
   - Verify IP is captured
   - Check admin table displays correctly

2. **Lead Creation Flow Test:**
   - Create lead with address
   - Verify address appears in admin table
   - Create second lead with different property type
   - Verify quote type counts update

3. **Data Migration Test:**
   - Run backfill scripts on test database
   - Verify NULL names are filled
   - Verify IPs are backfilled from audit logs

### Manual Testing Checklist

- [ ] Open `/admin/homeowners` as admin
- [ ] Verify all columns display data
- [ ] Test search functionality with new fields
- [ ] Test filters (residential/commercial, has address)
- [ ] Test sorting by new columns
- [ ] Test pagination still works
- [ ] Test mobile responsive view
- [ ] Create new homeowner account → verify appears correctly
- [ ] Create lead → verify address/quote type update
- [ ] Test with 100+ homeowners (performance)

---

## 📁 FILES TO MODIFY

### Database:
- ✅ `prisma/schema.prisma` - Add signupIp fields
- ✅ `prisma/migrations/` - New migration
- ✅ `prisma/scripts/backfill-homeowner-names.sql` - Backfill script
- ✅ `prisma/scripts/backfill-signup-ips.sql` - IP backfill script

### Backend:
- ✅ `src/app/api/admin/homeowners/route.ts` - Update query with aggregations
- ✅ `src/app/api/auth/register/homeowner/route.ts` - Capture IP at signup

### Frontend:
- ✅ `src/components/AdminHomeownersList.tsx` - Add columns, update interface
- ⚠️ `src/components/auth/HomeownersInfoForm.tsx` - Make name required (if exists)

### Documentation:
- ✅ `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/09-HOMEOWNERS-MANAGEMENT-PAGE-AUDIT.md`
- ✅ `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/09-IMPLEMENTATION-PLAN.md`

---

## 🚨 RISK MITIGATION

### Risk 1: Data Loss During Migration
**Mitigation:** 
- Backup database before running migrations
- Test migrations on copy of production data first
- Make backfill scripts idempotent (can run multiple times safely)

### Risk 2: Performance Degradation
**Mitigation:**
- Add database indexes for aggregated queries
- Test with large dataset (1000+ homeowners)
- Monitor query execution time
- Consider caching if needed

### Risk 3: Breaking Existing Functionality
**Mitigation:**
- Run full test suite before and after changes
- Test all existing filters and search
- Verify pagination still works
- Check mobile responsive layout

### Risk 4: Incomplete Data Display
**Mitigation:**
- Handle NULL/missing data gracefully
- Show "Not available" instead of blank cells
- Add tooltips explaining data source
- Provide fallback values

---

## ✅ SUCCESS CRITERIA

### Phase 1:
- [ ] All homeowners display actual names (no "No name")
- [ ] New registrations require name field
- [ ] Existing functionality not broken

### Phase 2:
- [ ] New registrations capture IP address
- [ ] Existing users show backfilled IPs (where available)
- [ ] IP column displays in admin table
- [ ] IP column is sortable

### Phase 3:
- [ ] Address column shows primary property address
- [ ] Quote type shows residential/commercial breakdown
- [ ] Data updates in real-time when leads created
- [ ] Filters work for new fields

### Phase 4:
- [ ] API response time < 500ms
- [ ] No console errors or warnings
- [ ] Mobile view looks good
- [ ] All tooltips and help text in place

---

## 📊 ROLLOUT PLAN

### Pre-Deployment:
1. Backup production database
2. Test migrations on staging environment
3. Run backfill scripts on staging
4. Verify data integrity

### Deployment:
1. Deploy backend changes (API + database migration)
2. Run backfill scripts on production
3. Deploy frontend changes
4. Smoke test critical paths

### Post-Deployment:
1. Monitor error logs for 24 hours
2. Check API performance metrics
3. Gather user feedback
4. Address any issues immediately

---

## 📞 SUPPORT & ROLLBACK

### If Issues Arise:

**Rollback Steps:**
1. Revert frontend deployment
2. Revert API changes
3. Rollback database migration if needed:
```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

**Support Contacts:**
- Database: Check Prisma logs
- API: Check server error logs
- Frontend: Check browser console

---

## 📝 CHANGELOG ENTRY

```markdown
## [Version X.X.X] - 2025-11-17

### Added
- **Admin Homeowners Management:** Address column showing primary property address
- **Admin Homeowners Management:** IP Address column showing signup IP
- **Admin Homeowners Management:** Quote Type indicator (Residential/Commercial)
- **Database:** `signupIp` and `signupUserAgent` fields to User model

### Fixed
- **Admin Homeowners Management:** Missing user names now display correctly
- **Registration:** Name field now required for homeowner signup

### Changed
- **API:** `/api/admin/homeowners` now includes aggregated lead data
- **Database:** Backfilled missing names from lead records
```

---

**End of Implementation Plan**
