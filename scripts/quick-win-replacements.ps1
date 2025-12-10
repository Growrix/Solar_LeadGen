# Quick Win CSS Class Replacements
# This script performs batch find/replace operations to fix common violations

param([switch]$DryRun)

$ErrorActionPreference = "Continue"
$replacements = 0
$errors = 0

Write-Host ""
Write-Host "Starting Quick Win Batch Replacements..." -ForegroundColor Cyan
Write-Host "Working directory: $PWD" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
    Write-Host ""
}

# Define replacement patterns
$patterns = @(
    @{Name="Primary color hover"; Find='hover:bg-teal-700'; Replace='hover:bg-primary/90'},
    @{Name="Primary background"; Find='bg-teal-600'; Replace='bg-primary'},
    @{Name="Primary text"; Find='text-teal-600'; Replace='text-primary'},
    @{Name="Primary border"; Find='border-teal-600'; Replace='border-primary'},
    @{Name="Destructive text"; Find='text-red-500'; Replace='text-destructive'},
    @{Name="Destructive background"; Find='bg-red-500'; Replace='bg-destructive'},
    @{Name="Destructive border"; Find='border-red-500'; Replace='border-destructive'},
    @{Name="Success text"; Find='text-green-600'; Replace='text-success'},
    @{Name="Success background"; Find='bg-green-600'; Replace='bg-success'},
    @{Name="Info text"; Find='text-blue-600'; Replace='text-info'},
    @{Name="Muted text gray-600"; Find='text-gray-600'; Replace='text-muted-foreground'},
    @{Name="Muted text gray-500"; Find='text-gray-500'; Replace='text-muted-foreground'},
    @{Name="Border color"; Find='border-gray-300'; Replace='border-border'},
    @{Name="Transition performance"; Find='transition-all duration'; Replace='transition-colors duration'}
)

# Get all TSX files
$files = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse -File | Where-Object { $_.FullName -notmatch '\\node_modules\\' }

Write-Host "Found $($files.Count) TSX files to process" -ForegroundColor Green
Write-Host ""

foreach ($pattern in $patterns) {
    Write-Host "Processing: $($pattern.Name)" -ForegroundColor Cyan
    $patternReplacements = 0
    
    foreach ($file in $files) {
        try {
            $content = Get-Content -Path $file.FullName -Encoding UTF8
            $originalContent = $content -join "`n"
            
            $newContent = $originalContent -replace [regex]::Escape($pattern.Find), $pattern.Replace
            
            if ($originalContent -ne $newContent) {
                $patternReplacements++
                
                if (-not $DryRun) {
                    $newContent | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
                }
                
                $relativePath = $file.FullName.Replace("$PWD\", "")
                Write-Host "  - $relativePath" -ForegroundColor Gray
            }
        }
        catch {
            $errors++
            Write-Host "  Error: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($patternReplacements -gt 0) {
        Write-Host "  Replaced in $patternReplacements files" -ForegroundColor Green
        $replacements += $patternReplacements
    }
    
    if ($patternReplacements -eq 0) {
        Write-Host "  No matches found" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total replacements: $replacements" -ForegroundColor Green
Write-Host "Errors encountered: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($DryRun) {
    Write-Host "This was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to apply changes" -ForegroundColor Yellow
}

if (-not $DryRun) {
    Write-Host "All replacements complete!" -ForegroundColor Green
    Write-Host "Run validation: npx tsx scripts/validate-classnames.ts" -ForegroundColor Cyan
}
