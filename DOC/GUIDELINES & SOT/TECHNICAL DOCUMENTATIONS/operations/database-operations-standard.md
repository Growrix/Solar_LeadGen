# Database Operations Standard

**Purpose**: Canonical reference for all database operations ensuring zero data loss across all environments  
**Authority**: Referenced by AI-IMPLEMENTATION-GUIDELINES.md (Section: Database Reset Policy)  
**Date**: December 22, 2025  
**Status**: Active Standard - MANDATORY for ALL database operations

---

## 🚨 CRITICAL RULE - ZERO DATA LOSS POLICY

**⛔ PERMANENTLY BANNED COMMANDS (NEVER USE UNDER ANY CIRCUMSTANCES):**

```powershell
# ❌ FORBIDDEN - These destroy all data:
npx prisma migrate reset
npx prisma migrate reset --force
npx prisma db push --force-reset
DROP DATABASE solarmatch;  # Unless part of backup-restore procedure
```

**Why These Are Banned:**
- User explicitly forbids data loss in **ANY** environment (dev, staging, production)
- Every user account, lead, bid, and setting is production-grade data
- Restoring from backups preserves real user data instead of creating mock data
- There is ALWAYS a migration-based solution that preserves data

---

## ✅ MANDATORY WORKFLOW - All Schema Changes

**Every schema change must follow this exact workflow:**

### 1. Pre-Migration Backup (MANDATORY - NEVER SKIP)

```powershell
# Create timestamped backup BEFORE touching schema:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_pre_migration.sql"

# Verify backup created successfully:
Get-Item "backup/backup_${timestamp}_pre_migration.sql" | Select-Object Name, Length
# Must show: Length > 0 bytes (typically 10KB - 10MB depending on data size)

# If backup file is 0 bytes or missing, STOP - Fix backup process before proceeding
```

### 2. Schema Changes (Edit, Generate, Migrate)

```powershell
# STEP 1: Edit schema
# - Open: prisma/schema.prisma
# - Make your changes (add fields, tables, enums, etc.)

# STEP 2: Generate Prisma Client (updates TypeScript types only, no DB changes):
npx prisma generate

# STEP 3: Create migration (applies schema changes, preserves all existing data):
npx prisma migrate dev --name descriptive_migration_name

# Migration naming examples:
# - npx prisma migrate dev --name add_written_quote_negotiation_fields
# - npx prisma migrate dev --name add_user_notification_preferences
# - npx prisma migrate dev --name update_lead_status_enum_values
# - npx prisma migrate dev --name add_installer_service_areas_table
```

### 3. Verify Data Integrity (MANDATORY - Check Before Continuing)

```powershell
# Open Prisma Studio:
npx prisma studio

# CRITICAL VERIFICATION CHECKLIST:
# ✅ New fields/tables exist with correct types
# ✅ ALL existing user accounts still present
# ✅ ALL existing leads/bids/quotes still present
# ✅ ALL existing settings still present
# ✅ Relationships/foreign keys intact
# ✅ No "undefined" or missing values in required fields

# If ANY data is missing → IMMEDIATELY RESTORE from backup (see Section 4)
```

### 4. Rollback Procedure (If Migration Fails)

```powershell
# If migration failed or data is missing:

# STEP 1: Stop any running processes
# Press Ctrl+C to stop dev server, Prisma Studio, etc.

# STEP 2: Restore database from pre-migration backup:
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS solarmatch;"
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "CREATE DATABASE solarmatch;"
Get-Content "backup/backup_${timestamp}_pre_migration.sql" | docker exec -i solarmatch-db-1 psql -U postgres -d solarmatch

# STEP 3: Verify restore worked:
npx prisma studio
# Check: All data is back exactly as before migration attempt

# STEP 4: Fix the migration issue:
# - Review error messages from failed migration
# - Adjust prisma/schema.prisma to fix the issue
# - Delete failed migration folder: prisma/migrations/[failed_migration]/
# - Take NEW backup before trying again
# - Retry migration with corrected schema
```

### 5. Post-Migration Backup (Recommended)

```powershell
# After successful migration, create new backup of current state:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_post_migration.sql"

# Rename to descriptive name (optional but recommended):
# Example: backup_20251222_153045_with_written_quote_schema.sql
# Example: backup_20251222_160030_with_notification_preferences.sql
```

---

## 🔧 ADVANCED SCENARIOS

### Scenario A: Migration Conflicts / Drift Detected

```powershell
# STEP 1: Check migration status:
npx prisma migrate status
# Shows: applied migrations, pending migrations, schema drift

# STEP 2: Resolve without data loss:
npx prisma migrate resolve --applied "migration_name"
# OR
npx prisma migrate resolve --rolled-back "migration_name"

# STEP 3: If migration file is corrupted/broken:
# - Delete the broken migration folder: prisma/migrations/[broken_migration]/
# - Create new migration: npx prisma migrate dev --name fixed_migration_name
# - This recreates the migration without destroying data

# STEP 4: If all resolution attempts fail:
# - Restore from backup (see Section 4 - Rollback Procedure)
# - Investigate root cause before retrying
```

### Scenario B: Restoring Old Backup + Applying New Schema

**Use Case**: You have old backup with real user data but old schema (missing new fields/tables)

```powershell
# Goal: Get real user data from old backup + apply new schema without data loss

# STEP 1: Backup current database state (has latest schema):
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_current_schema.sql"

# STEP 2: Restore old backup (real user data, old schema):
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS solarmatch;"
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "CREATE DATABASE solarmatch;"
Get-Content "backup/backup_old_data.sql" | docker exec -i solarmatch-db-1 psql -U postgres -d solarmatch

# STEP 3: Apply all pending migrations (updates schema, preserves restored data):
npx prisma migrate deploy
# This brings old schema up to date without touching existing data

# Alternative if migrate deploy fails:
npx prisma db push
# Forces schema sync, may lose data in incompatible fields (use cautiously)

# STEP 4: Verify merged state:
npx prisma studio
# Checklist:
# ✅ Real user accounts from old backup present
# ✅ Real leads/bids from old backup present
# ✅ New fields exist (populated with NULL or default values)
# ✅ New tables exist (empty, ready for new data)

# STEP 5: Update specific records if needed:
# Example: Update admin credentials
docker exec -it solarmatch-db-1 psql -U postgres -d solarmatch -c "
  UPDATE users 
  SET email = 'admin@example.com', password = '\$2b\$10\$hashedPassword' 
  WHERE role = 'ADMIN';
"

# STEP 6: Take backup of merged state:
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_merged_real_data_and_new_schema.sql"

# STEP 7: Delete test/mock data if any was seeded:
# DO NOT run seed scripts that add test users/leads
# Real data from backup should be sufficient
```

### Scenario C: Adding Required Fields to Existing Table

**Challenge**: Cannot add required (NOT NULL) field to table with existing data without default value

**Solution**:

```powershell
# Option 1: Two-step migration (safest)

# Migration 1: Add field as nullable
model User {
  id    String @id @default(cuid())
  email String
  newField String?  // Nullable first
}

npx prisma migrate dev --name add_new_field_nullable

# Backfill data manually or via script:
docker exec -it solarmatch-db-1 psql -U postgres -d solarmatch -c "
  UPDATE users SET new_field = 'default_value' WHERE new_field IS NULL;
"

# Migration 2: Make field required
model User {
  id       String @id @default(cuid())
  email    String
  newField String  // Now required
}

npx prisma migrate dev --name make_new_field_required

# Option 2: Add default value directly (simpler if default is acceptable)
model User {
  id       String @id @default(cuid())
  email    String
  newField String @default("default_value")
}

npx prisma migrate dev --name add_new_field_with_default
```

---

## 📋 BACKUP NAMING CONVENTIONS

**Format**: `backup_YYYYMMDD_HHMMSS_description.sql`

**Examples**:
- `backup_20251222_120000_pre_written_quote_migration.sql`
- `backup_20251222_153045_post_written_quote_migration.sql`
- `backup_20251222_160030_real_user_data_merged_with_new_schema.sql`
- `backup_20251222_143000_before_notification_system.sql`

**Description Guidelines**:
- `pre_` = Before migration/change
- `post_` = After successful migration
- `merged_` = Combined old data + new schema
- `before_` = Before major feature implementation
- Include feature/change name for context

---

## 🚀 DAILY WORKFLOW QUICK REFERENCE

**Making a schema change? Follow this every time:**

```powershell
# 1. BACKUP (ALWAYS FIRST)
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_pre_migration.sql"

# 2. EDIT schema.prisma
# Make your changes...

# 3. GENERATE + MIGRATE
npx prisma generate
npx prisma migrate dev --name your_change_description

# 4. VERIFY
npx prisma studio
# Check: All data still exists + new fields/tables added

# 5. POST-BACKUP (optional)
docker exec -it solarmatch-db-1 pg_dump -U postgres -d solarmatch > "backup/backup_${timestamp}_post_migration.sql"
```

**Something went wrong?**

```powershell
# RESTORE from backup:
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS solarmatch;"
docker exec -i solarmatch-db-1 psql -U postgres -d postgres -c "CREATE DATABASE solarmatch;"
Get-Content "backup/backup_TIMESTAMP_pre_migration.sql" | docker exec -i solarmatch-db-1 psql -U postgres -d solarmatch

# Fix issue in schema.prisma, then try again
```

---

## ⚠️ WHAT TO DO IF AI SUGGESTS RESET

**If any AI agent suggests using `npx prisma migrate reset` or `db push --force-reset`:**

1. **STOP IMMEDIATELY** - Do not execute the command
2. **REPORT THE ISSUE** - Inform the user that AI violated zero data loss policy
3. **REQUEST ALTERNATIVE** - Ask AI to provide migration-based solution instead
4. **REFERENCE THIS DOCUMENT** - Point AI to this standard for correct approach

**Correct Response Template**:
```
⛔ DATABASE RESET POLICY VIOLATION DETECTED

The suggested command would destroy all database data, which is permanently forbidden per:
- DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md (Database Reset Policy)
- DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/operations/database-operations-standard.md

REQUIRED ALTERNATIVE:
1. Take backup first: docker exec ... pg_dump
2. Use migration: npx prisma migrate dev --name [description]
3. Verify data preserved: npx prisma studio
4. Restore if needed: restore from backup

Please provide migration-based solution that preserves all existing data.
```

---

## 📚 RELATED DOCUMENTATION

- **AI Implementation Guidelines**: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md` (Section: Database Reset Policy)
- **Database Schema Reference**: `DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/architecture/database-schema.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **Migration History**: `prisma/migrations/`

---

## 🔍 AUDIT CHECKLIST

**Before considering any database operation complete, verify:**

- [ ] Backup created before changes (file size > 0 bytes)
- [ ] Migration applied successfully (no errors in terminal)
- [ ] All user accounts still exist (checked in Prisma Studio)
- [ ] All leads/bids/quotes still exist (checked in Prisma Studio)
- [ ] All settings still exist (checked in Prisma Studio)
- [ ] New fields/tables exist as expected (checked in Prisma Studio)
- [ ] TypeScript builds without errors (`npx tsc --noEmit`)
- [ ] App runs without errors (`npm run dev`)
- [ ] Post-migration backup created (optional but recommended)

**If ANY checkbox is unchecked, restore from backup and investigate issue.**

---

**End of Database Operations Standard**
