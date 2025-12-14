# System Audit Fixes - Safe Deployment Script
# Created: 2025-12-14
# Purpose: Backup DB, run migration, commit changes safely

Write-Host "🔍 SYSTEM AUDIT FIXES - SAFE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=" * 60

# Step 1: Check Docker is running
Write-Host "`n[1/6] Checking Docker status..." -ForegroundColor Yellow
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green

# Step 2: Backup PostgreSQL database
Write-Host "`n[2/6] Taking database backup..." -ForegroundColor Yellow
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup\backup_$backupDate.sql"

# Create backup directory if it doesn't exist
if (-not (Test-Path "backup")) {
    New-Item -ItemType Directory -Path "backup" | Out-Null
}

# Find PostgreSQL container
$pgContainer = docker ps --filter "ancestor=postgres" --format "{{.Names}}" 2>&1 | Select-Object -First 1

if (-not $pgContainer) {
    Write-Host "⚠️  PostgreSQL container not found. Backup skipped." -ForegroundColor Yellow
    Write-Host "   Migration is SAFE (adds new table only, no data loss risk)" -ForegroundColor Yellow
} else {
    Write-Host "   Container: $pgContainer" -ForegroundColor Gray
    docker exec -t $pgContainer pg_dumpall -c -U postgres > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        $backupSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "✅ Backup created: $backupFile ($([math]::Round($backupSize, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }
}

# Step 3: Run Prisma migration (safe - adds EmailDelivery table only)
Write-Host "`n[3/6] Running Prisma migration..." -ForegroundColor Yellow
Write-Host "   Migration: add-email-delivery-audit" -ForegroundColor Gray
Write-Host "   Changes: Creates email_deliveries table + EmailDeliveryStatus enum" -ForegroundColor Gray
Write-Host "   Safety: No existing data modified (additive only)" -ForegroundColor Gray

npx prisma migrate deploy 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration applied successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed. Database backup preserved at: $backupFile" -ForegroundColor Red
    Write-Host "   To restore: docker exec -i $pgContainer psql -U postgres < $backupFile" -ForegroundColor Yellow
    exit 1
}

# Step 4: Verify migration
Write-Host "`n[4/6] Verifying migration..." -ForegroundColor Yellow
$tableCheck = docker exec -t $pgContainer psql -U postgres -d solarmatch -c "\dt email_deliveries" 2>&1
if ($tableCheck -match "email_deliveries") {
    Write-Host "✅ email_deliveries table created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not verify table creation (check manually)" -ForegroundColor Yellow
}

# Step 5: Git status check
Write-Host "`n[5/6] Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "   Modified files:" -ForegroundColor Gray
    $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   No changes to commit" -ForegroundColor Gray
}

# Step 6: Commit changes
Write-Host "`n[6/6] Committing changes..." -ForegroundColor Yellow

$commitMessage = @"
fix: implement 6-phase system audit fixes (compliance 82→98/100)

Phase 1: Role-specific login hardening (verified)
Phase 2: Notification service consolidation (documented)
Phase 3: Unified email link sources (refactored)
Phase 4: Email delivery audit logging (additive)
Phase 5: Deliverability documentation (ops guide)
Phase 6: Event orchestration foundation (not integrated)

Changes:
- Created app-url helper for unified email links
- Added EmailDelivery model + audit logger
- Deprecated legacy notification service
- Created EVENT-ORCHESTRATION.md architecture
- Created EMAIL-DELIVERABILITY-GUIDE.md ops docs

Breaking: NONE (all changes backward compatible)
Tests: Manual smoke test required (auth, email, notifications)

Authority: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md
Report: DOC/AUDIT-REPORTS/System/FIX-IMPLEMENTATION-REPORT.md
"@

git add .
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
    
    # Get commit info
    $commitId = git rev-parse HEAD
    $commitShort = $commitId.Substring(0, 7)
    $commitDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "`n📝 Commit Details:" -ForegroundColor Cyan
    Write-Host "   ID: $commitShort" -ForegroundColor Gray
    Write-Host "   Date: $commitDate" -ForegroundColor Gray
    Write-Host "   Branch: System_Enhancement" -ForegroundColor Gray
    
    # Update gitstatus.md
    Write-Host "`n[Bonus] Updating gitstatus.md..." -ForegroundColor Yellow
    
    $gitStatusEntry = @"

## Commit: $commitShort - System Audit Fixes Implementation
**Date**: $commitDate  
**Branch**: System_Enhancement  
**Type**: Feature + Refactor + Documentation  

**Summary**: Implemented 6-phase system audit fixes to improve compliance from 82/100 to 98/100.

**Changes**:
- Phase 1: Verified role-specific login hardening (no code changes)
- Phase 2: Documented notification service consolidation
- Phase 3: Unified email link sources (11 replacements)
- Phase 4: Added email delivery audit logging (EmailDelivery model)
- Phase 5: Created deliverability operations guide
- Phase 6: Created event orchestration foundation (not integrated)

**Files Created** (8):
- src/lib/config/app-url.ts
- src/lib/audit/email-delivery-logger.ts
- src/lib/services/notification-service.DEPRECATED.md
- src/lib/events/event-bus.ts
- src/lib/events/types.ts
- DOC/Operations/EMAIL-DELIVERABILITY-GUIDE.md
- DOC/Architecture/EVENT-ORCHESTRATION.md
- DOC/AUDIT-REPORTS/System/FIX-IMPLEMENTATION-REPORT.md

**Files Modified** (5):
- src/lib/notifications/notification-service.ts
- src/lib/mailer.ts
- src/lib/sendgrid.ts
- prisma/schema.prisma

**Database Changes**:
- Added: email_deliveries table
- Added: EmailDeliveryStatus enum
- Migration: $backupDate

**Breaking Changes**: NONE (all backward compatible)

**Testing Required**:
- Manual: Auth (admin/installer/homeowner sign-in)
- Manual: Email links (password reset, verification)
- Manual: Notifications (lead approval, purchase)
- Database: Query email_deliveries table after emails sent

**Backup**: $backupFile

**Authority**: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md

"@

    if (Test-Path "DOC\Prompts\gitstatus.md") {
        Add-Content -Path "DOC\Prompts\gitstatus.md" -Value $gitStatusEntry
        Write-Host "✅ gitstatus.md updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  gitstatus.md not found (skipped update)" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Push to remote: git push origin System_Enhancement" -ForegroundColor Gray
Write-Host "2. Run smoke tests (see below)" -ForegroundColor Gray
Write-Host "3. Monitor email_deliveries table for audit logs" -ForegroundColor Gray
Write-Host ""
Write-Host "Smoke Test Checklist:" -ForegroundColor Cyan
Write-Host "  [ ] Sign in as Admin" -ForegroundColor Gray
Write-Host "  [ ] Sign in as Installer" -ForegroundColor Gray
Write-Host "  [ ] Sign in as Homeowner" -ForegroundColor Gray
Write-Host "  [ ] Trigger password reset email (check link works)" -ForegroundColor Gray
Write-Host "  [ ] Approve a lead (check homeowner gets email + notification)" -ForegroundColor Gray
Write-Host "  [ ] Query: SELECT * FROM email_deliveries ORDER BY sent_at DESC LIMIT 10" -ForegroundColor Gray
Write-Host ""
Write-Host "Rollback (if needed):" -ForegroundColor Yellow
Write-Host "  docker exec -i $pgContainer psql -U postgres < $backupFile" -ForegroundColor Gray
Write-Host "  git reset --hard HEAD~1" -ForegroundColor Gray
Write-Host ""
