-- ============================================================================
-- Backfill Script: Homeowner Names from Leads
-- ============================================================================
-- Purpose: Fill NULL User.name values from their first lead's name
-- Phase: 21.1 - Admin Homeowners Management Page Fix
-- Date: November 17, 2025
-- Risk: LOW - Only updates NULL names, uses first lead as source
-- ============================================================================

-- STEP 1: Count users with NULL names (for verification)
SELECT 
  COUNT(*) as null_name_count,
  (SELECT COUNT(*) FROM users WHERE role = 'HOMEOWNER') as total_homeowners,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM users WHERE role = 'HOMEOWNER'), 0) * 100, 2) as percentage
FROM users
WHERE role = 'HOMEOWNER' 
  AND name IS NULL;

-- STEP 2: Preview which names will be backfilled
SELECT 
  u.id as user_id,
  u.email as user_email,
  u.name as current_name,
  l.name as lead_name,
  l."createdAt" as lead_created
FROM users u
INNER JOIN LATERAL (
  SELECT name, "createdAt"
  FROM leads 
  WHERE "homeownerId" = u.id 
    AND name IS NOT NULL
  ORDER BY "createdAt" ASC
  LIMIT 1
) l ON true
WHERE u.role = 'HOMEOWNER' 
  AND u.name IS NULL;

-- STEP 3: Perform the backfill update
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

-- STEP 4: Verify the update was successful
SELECT 
  COUNT(*) as remaining_null_names,
  (SELECT COUNT(*) FROM users WHERE role = 'HOMEOWNER') as total_homeowners,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM users WHERE role = 'HOMEOWNER'), 0) * 100, 2) as percentage
FROM users
WHERE role = 'HOMEOWNER' 
  AND name IS NULL;

-- STEP 5: Show updated users (verification)
SELECT 
  u.id,
  u.email,
  u.name as updated_name,
  u."updatedAt"
FROM users u
WHERE u.role = 'HOMEOWNER'
  AND u.name IS NOT NULL
  AND u."updatedAt" > NOW() - INTERVAL '5 minutes'
ORDER BY u."updatedAt" DESC
LIMIT 20;

-- ============================================================================
-- EXPECTED RESULT:
-- - All homeowners with leads should now have names
-- - Users without leads will still have NULL names (acceptable)
-- - No data loss or corruption
-- ============================================================================

-- ROLLBACK (if needed):
-- There is no automated rollback since we're only filling NULL values
-- Original NULL values are preserved if no lead name exists
-- Manual rollback would require restoring from backup
