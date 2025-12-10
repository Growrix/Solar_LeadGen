# Docker Status Monitor
Write-Host ""
Write-Host "========================================"
Write-Host "DOCKER STATUS"
Write-Host "========================================"
Write-Host ""

# Check Docker Desktop Process
Write-Host "Docker Desktop Process:"
$dockerDesktop = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerDesktop) {
    Write-Host "  [OK] RUNNING"
} else {
    Write-Host "  [FAIL] NOT RUNNING"
}

# Check Docker Engine
Write-Host ""
Write-Host "Docker Engine:"
docker info > $null 2>&1
$engineRunning = ($LASTEXITCODE -eq 0)
if ($engineRunning) {
    Write-Host "  [OK] ACCESSIBLE"
} else {
    Write-Host "  [FAIL] NOT ACCESSIBLE"
}

# Check PostgreSQL Container
Write-Host ""
Write-Host "========================================"
Write-Host "DATABASE STATUS"
Write-Host "========================================"
Write-Host ""

if ($engineRunning) {
    $containers = docker ps --filter "ancestor=postgres:15" --format "{{.Names}}" 2>&1
    if ($containers) {
        Write-Host "[OK] PostgreSQL container is RUNNING: $containers"
    } else {
        Write-Host "[FAIL] No PostgreSQL containers running"
        Write-Host "       Run: docker-compose up -d"
    }
} else {
    Write-Host "[FAIL] Cannot check - Docker engine not running"
}

Write-Host ""
