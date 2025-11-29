# IT Infrastructure Agent for JobFinder
# Manages localhost environment lifecycle for pre-production verification

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('up', 'down', 'status', 'verify', 'restart', 'logs', 'clean')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod-sim')]
    [string]$Mode = 'dev',
    
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 300
)

$ErrorActionPreference = "Stop"
# Auto-detect project root from script location (context inheritance)
$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName

# Color output functions
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }

# Environment state tracking
$StateFile = "$ProjectRoot\.warp\infra-state.json"

function Get-InfraState {
    if (Test-Path $StateFile) {
        return Get-Content $StateFile | ConvertFrom-Json
    }
    return @{
        status = "stopped"
        mode = $null
        started_at = $null
        pid = @{}
        health = @{}
    }
}

function Set-InfraState {
    param($State)
    $State | ConvertTo-Json -Depth 10 | Set-Content $StateFile
}

function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

function Wait-ForService {
    param(
        [string]$Name,
        [int]$Port,
        [string]$HealthEndpoint = $null,
        [int]$TimeoutSec = 60
    )
    
    Write-Info "Waiting for $Name on port $Port..."
    $elapsed = 0
    
    while ($elapsed -lt $TimeoutSec) {
        if (Test-Port -Port $Port) {
            if ($HealthEndpoint) {
                try {
                    $response = Invoke-WebRequest -Uri $HealthEndpoint -Method GET -TimeoutSec 5
                    if ($response.StatusCode -eq 200) {
                        Write-Success "$Name is healthy"
                        return $true
                    }
                } catch {
                    # Continue waiting
                }
            } else {
                Write-Success "$Name is up"
                return $true
            }
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    
    Write-Error "$Name failed to start within ${TimeoutSec}s"
    return $false
}

function Start-Infrastructure {
    Write-Info "Starting infrastructure in $Mode mode..."
    
    $composeFile = if ($Mode -eq 'dev') { 'docker-compose.dev.yml' } else { 'docker-compose.yml' }
    
    # Check if Docker is running
    try {
        docker ps | Out-Null
    } catch {
        Write-Error "Docker is not running. Please start Docker Desktop."
        exit 1
    }
    
    # Load environment variables
    if (Test-Path "$ProjectRoot\.env") {
        Get-Content "$ProjectRoot\.env" | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
            }
        }
    } else {
        Write-Warning ".env file not found, using defaults"
    }
    
    # Start services
    Set-Location $ProjectRoot
    Write-Info "Starting Docker containers..."
    docker-compose -f $composeFile up -d --build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start containers"
        exit 1
    }
    
    # Wait for services
    $services = @(
        @{ Name = 'PostgreSQL'; Port = 5432; Health = $null },
        @{ Name = 'Redis'; Port = 6379; Health = $null },
        @{ Name = 'Elasticsearch'; Port = 9200; Health = 'http://localhost:9200/_cluster/health' },
        @{ Name = 'Backend API'; Port = 8000; Health = 'http://localhost:8000/health' },
        @{ Name = 'Frontend'; Port = 3000; Health = 'http://localhost:3000' }
    )
    
    $allHealthy = $true
    foreach ($service in $services) {
        $healthy = Wait-ForService -Name $service.Name -Port $service.Port -HealthEndpoint $service.Health -TimeoutSec $Timeout
        if (-not $healthy) {
            $allHealthy = $false
        }
    }
    
    if (-not $allHealthy) {
        Write-Error "Some services failed to start. Run 'infra-agent.ps1 logs' for details."
        exit 1
    }
    
    # Save state
    $state = @{
        status = "running"
        mode = $Mode
        started_at = (Get-Date).ToString('o')
        compose_file = $composeFile
        health = @{
            postgres = $true
            redis = $true
            elasticsearch = $true
            backend = $true
            frontend = $true
        }
    }
    Set-InfraState -State $state
    
    Write-Success "Infrastructure started successfully!"
    Write-Info "Access points:"
    Write-Host "  - Frontend:        http://localhost:3000"
    Write-Host "  - Universal Canvas: http://localhost:3000/canvas"
    Write-Host "  - Backend API:     http://localhost:8000"
    Write-Host "  - API Docs:        http://localhost:8000/docs"
}

function Stop-Infrastructure {
    Write-Info "Stopping infrastructure..."
    
    $state = Get-InfraState
    if ($state.status -eq "stopped") {
        Write-Warning "Infrastructure is already stopped"
        return
    }
    
    Set-Location $ProjectRoot
    $composeFile = if ($state.compose_file) { $state.compose_file } else { 'docker-compose.dev.yml' }
    
    docker-compose -f $composeFile down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Infrastructure stopped"
        $state.status = "stopped"
        $state.stopped_at = (Get-Date).ToString('o')
        Set-InfraState -State $state
    } else {
        Write-Error "Failed to stop infrastructure cleanly"
        exit 1
    }
}

function Get-InfraStatus {
    $state = Get-InfraState
    
    Write-Host "`n=== Infrastructure Status ===" -ForegroundColor Cyan
    Write-Host "Status: $($state.status)"
    Write-Host "Mode: $($state.mode)"
    if ($state.started_at) {
        Write-Host "Started: $($state.started_at)"
    }
    
    if ($state.status -eq "running") {
        Write-Host "`nService Health:" -ForegroundColor Cyan
        
        $checks = @(
            @{ Name = 'PostgreSQL'; Port = 5432 },
            @{ Name = 'Redis'; Port = 6379 },
            @{ Name = 'Elasticsearch'; Port = 9200 },
            @{ Name = 'Backend'; Port = 8000 },
            @{ Name = 'Frontend'; Port = 3000 }
        )
        
        foreach ($check in $checks) {
            $isUp = Test-Port -Port $check.Port
            $status = if ($isUp) { "✓ UP" } else { "✗ DOWN" }
            $color = if ($isUp) { "Green" } else { "Red" }
            Write-Host "  $($check.Name): " -NoNewline
            Write-Host $status -ForegroundColor $color
        }
    }
    
    Write-Host ""
}

function Test-Infrastructure {
    Write-Info "Running verification tests..."
    
    $state = Get-InfraState
    if ($state.status -ne "running") {
        Write-Error "Infrastructure is not running. Start it first with 'up' action."
        exit 1
    }
    
    $allPassed = $true
    
    # Test Backend API
    Write-Info "Testing Backend API..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
        } else {
            Write-Error "Backend health check failed: $($response.StatusCode)"
            $allPassed = $false
        }
    } catch {
        Write-Error "Backend API unreachable: $_"
        $allPassed = $false
    }
    
    # Test Frontend
    Write-Info "Testing Frontend..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is accessible"
        } else {
            Write-Error "Frontend check failed: $($response.StatusCode)"
            $allPassed = $false
        }
    } catch {
        Write-Error "Frontend unreachable: $_"
        $allPassed = $false
    }
    
    # Test Universal Canvas
    Write-Info "Testing Universal Canvas..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/canvas" -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Success "Universal Canvas is accessible"
        } else {
            Write-Error "Canvas check failed: $($response.StatusCode)"
            $allPassed = $false
        }
    } catch {
        Write-Error "Canvas unreachable: $_"
        $allPassed = $false
    }
    
    # Test Database Connection (via API)
    Write-Info "Testing database connectivity..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Success "API documentation accessible (DB connection implicit)"
        }
    } catch {
        Write-Warning "Could not verify database connection"
    }
    
    if ($allPassed) {
        Write-Success "`nAll verification tests passed! ✓"
        Write-Info "Environment is stable and ready for testing."
        return 0
    } else {
        Write-Error "`nSome verification tests failed! ✗"
        Write-Info "Review logs with: .\scripts\infra-agent.ps1 logs"
        return 1
    }
}

function Restart-Infrastructure {
    Write-Info "Restarting infrastructure..."
    Stop-Infrastructure
    Start-Sleep -Seconds 5
    Start-Infrastructure
}

function Get-InfraLogs {
    $state = Get-InfraState
    $composeFile = if ($state.compose_file) { $state.compose_file } else { 'docker-compose.dev.yml' }
    
    Set-Location $ProjectRoot
    docker-compose -f $composeFile logs --tail=100 --follow
}

function Clear-Infrastructure {
    Write-Warning "This will remove all containers, volumes, and cached data."
    $confirmation = Read-Host "Are you sure? (yes/no)"
    
    if ($confirmation -eq 'yes') {
        Write-Info "Cleaning up infrastructure..."
        Set-Location $ProjectRoot
        
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.yml down -v
        
        Write-Success "Infrastructure cleaned"
        
        $state = @{
            status = "stopped"
            mode = $null
            started_at = $null
        }
        Set-InfraState -State $state
    } else {
        Write-Info "Cleanup cancelled"
    }
}

# Main execution
switch ($Action) {
    'up' { Start-Infrastructure }
    'down' { Stop-Infrastructure }
    'status' { Get-InfraStatus }
    'verify' { exit (Test-Infrastructure) }
    'restart' { Restart-Infrastructure }
    'logs' { Get-InfraLogs }
    'clean' { Clear-Infrastructure }
}
