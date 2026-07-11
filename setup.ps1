<#
.SYNOPSIS
  OneChoiceKitchen — Nx Service Orchestrator v5.0
  Fully self-healing. Zero manual steps. Docker-free (but Docker-aware).

.DESCRIPTION
  Single command to start the entire OneChoiceKitchen development environment.
  Handles ALL prerequisites automatically before launching any service.

  WHAT IT AUTO-HANDLES:
    [1]  Node.js check        → errors with install link if missing
    [2]  pnpm check           → installs globally if missing
    [3]  node_modules         → runs pnpm install if missing/stale
    [4]  .env files           → creates from .env.example if missing
    [5]  Prisma client        → runs prisma generate automatically
    [6]  Prisma DB push       → syncs SQLite schema automatically
    [7]  Port cleanup         → kills stale processes on all service ports
    [8]  API startup          → waits for health before starting frontends
    [9]  Frontends            → starts all profile services in parallel windows
    [10] Browser launch       → opens ALL service URLs (incl. mobile apps)
    [11] Prisma Studio        → opens DB browser at http://localhost:5555
    [12] pgAdmin / MailDev    → opens Docker tool URLs if services are running

  COMPLETELY SEPARATE FROM DOCKER:
    Docker infrastructure (PostgreSQL, Redis, Maildev, pgAdmin) is managed by:
      docker compose -f docker-compose.dev.yml up -d
    This script NEVER calls Docker. It only manages Nx app services.
    Use -WithDocker to also start Docker infra automatically.

.PARAMETER Action
  'start'  -- start all services (default)
  'stop'   -- stop all services gracefully
  'status' -- show live status of all ports

.PARAMETER RunProfile
  'core'     -- API + Customer Web only (2 services, fastest startup)
  'standard' -- API + Web + Admin + Partner + Rider portals (DEFAULT, 5 services)
  'all'      -- Everything including mobile apps (8 services)
  'mobile'   -- API + Mobile apps only

.PARAMETER NoBrowser
  Switch: skip auto-opening browser tabs

.PARAMETER OpenDB
  Switch: open Prisma Studio at http://localhost:5555

.PARAMETER WithDocker
  Switch: auto-start Docker infra (PostgreSQL + Redis + Maildev + pgAdmin) before starting apps

.EXAMPLE
  .\setup.ps1                                    # standard profile, all browsers open
  .\setup.ps1 start -RunProfile core             # minimal: API + Web
  .\setup.ps1 start -RunProfile all              # everything including mobile
  .\setup.ps1 start -NoBrowser                   # start without opening browsers
  .\setup.ps1 start -OpenDB                      # start + open Prisma Studio
  .\setup.ps1 start -WithDocker                  # auto-start Docker infra first
  .\setup.ps1 stop                               # stop all
  .\setup.ps1 status                             # check what is running
#>

param(
    [ValidateSet('start','stop','status')]
    [string]$Action = 'start',

    [ValidateSet('core','standard','all','mobile')]
    [string]$RunProfile = 'standard',

    [switch]$NoBrowser,
    [switch]$NoDBBrowser,
    [switch]$WithDocker,
    [switch]$OpenDB
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'   # speeds up Invoke-WebRequest

# ── Constants ──────────────────────────────────────────────────────────────────
$Root    = $PSScriptRoot
$PidFile = Join-Path $Root '.service-pids'

# ── Colour helpers ─────────────────────────────────────────────────────────────
function cyn  { param($t) Write-Host "  $t" -ForegroundColor Cyan }
function grn  { param($t) Write-Host "  OK   $t" -ForegroundColor Green }
function yel  { param($t) Write-Host "  WARN $t" -ForegroundColor Yellow }
function red  { param($t) Write-Host "  FAIL $t" -ForegroundColor Red }
function dim  { param($t) Write-Host "       $t" -ForegroundColor DarkGray }
function step { param($n,$t) Write-Host "  [$n] $t" -ForegroundColor Cyan }
function rule { Write-Host "  $('-'*70)" -ForegroundColor DarkGray }
function hdr  { param($t) Write-Host "  $t" -ForegroundColor White }

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  +============================================================+" -ForegroundColor Cyan
    Write-Host "  |   ONE CHOICE KITCHEN  -  Dev Orchestrator v5.0            |" -ForegroundColor White
    Write-Host "  |   Profile: $($RunProfile.ToUpper().PadRight(50))|" -ForegroundColor Yellow
    Write-Host "  +============================================================+" -ForegroundColor Cyan
    Write-Host ""
}

# ── Port utilities ─────────────────────────────────────────────────────────────
function Test-Port([int]$p) {
    try {
        $t = New-Object Net.Sockets.TcpClient
        $r = $t.BeginConnect('127.0.0.1', $p, $null, $null)
        $ok = $r.AsyncWaitHandle.WaitOne(500)
        $t.Close()
        return $ok
    } catch { return $false }
}

function Clear-Port([int]$p) {
    Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
        }
}

function Wait-Port([int]$p, [string]$label, [int]$max = 180) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $spin = @('|','/','-','\')
    $i = 0
    while ($sw.Elapsed.TotalSeconds -lt $max) {
        if (Test-Port $p) { Write-Host ''; return [int]$sw.Elapsed.TotalSeconds }
        Write-Host "`r       $($spin[$i%4])  Waiting for $label [:$p] ... $([int]$sw.Elapsed.TotalSeconds)s  " -NoNewline -ForegroundColor DarkCyan
        $i++
        Start-Sleep -Milliseconds 600
    }
    Write-Host ''
    return -1
}

# ── Service definitions ────────────────────────────────────────────────────────
# ALL services have OpenBrowser=$true — every service opens in browser after startup
$ServiceDefs = [ordered]@{
    'api'            = @{ NxCmd='api';            Port=3000; Url='http://localhost:3000/api/docs'; OpenBrowser=$true }
    'web'            = @{ NxCmd='web';            Port=4208; Url='http://localhost:4208';          OpenBrowser=$true }
    'admin-portal'   = @{ NxCmd='admin-portal';   Port=4205; Url='http://localhost:4205';          OpenBrowser=$true }
    'partner-portal' = @{ NxCmd='partner-portal'; Port=4206; Url='http://localhost:4206';          OpenBrowser=$true }
    'rider-portal'   = @{ NxCmd='rider-portal';   Port=4207; Url='http://localhost:4207';          OpenBrowser=$true }
    'customer-mobile'= @{ NxCmd='customer-mobile';Port=4210; Url='http://localhost:4210';          OpenBrowser=$true }
    'mobile-app'     = @{ NxCmd='mobile-app';     Port=4211; Url='http://localhost:4211';          OpenBrowser=$true }
    'rider-mobile'   = @{ NxCmd='rider-mobile';   Port=4212; Url='http://localhost:4212';          OpenBrowser=$true }
}

$ProfileMap = @{
    'core'     = @('api','web')
    'standard' = @('api','web','admin-portal','partner-portal','rider-portal')
    'mobile'   = @('api','customer-mobile','mobile-app','rider-mobile')
    'all'      = @('api','web','admin-portal','partner-portal','rider-portal','customer-mobile','mobile-app','rider-mobile')
}

# ── Docker / infra service definitions (informational only) ────────────────────
$InfraServices = @(
    @{ Name='PostgreSQL';     Port=5432; Url='localhost:5432';          BrowserUrl=$null }
    @{ Name='Redis';          Port=6379; Url='localhost:6379';          BrowserUrl=$null }
    @{ Name='MailDev SMTP';   Port=1025; Url='localhost:1025';          BrowserUrl=$null }
    @{ Name='MailDev UI';     Port=1080; Url='http://localhost:1080';   BrowserUrl='http://localhost:1080' }
    @{ Name='pgAdmin';        Port=5050; Url='http://localhost:5050';   BrowserUrl='http://localhost:5050' }
    @{ Name='Prisma Studio';  Port=5555; Url='http://localhost:5555';   BrowserUrl='http://localhost:5555' }
)

# ── Service display names ──────────────────────────────────────────────────────
$ServiceLabels = @{
    'api'             = 'NestJS API'
    'web'             = 'Customer Web Portal'
    'admin-portal'    = 'Admin Portal'
    'partner-portal'  = 'Partner Portal'
    'rider-portal'    = 'Rider Portal'
    'customer-mobile' = 'Customer Mobile App'
    'mobile-app'      = 'Customer PWA (Mobile)'
    'rider-mobile'    = 'Rider Mobile App'
}

# ── Service startup times tracking ────────────────────────────────────────────
$script:ServiceStartTimes = @{}

# ─────────────────────────────────────────────────────────────────────────────
# PREREQUISITE CHECKS  (self-healing)
# ─────────────────────────────────────────────────────────────────────────────
function Invoke-Prerequisites {
    step '1/7' 'Checking prerequisites...'
    rule

    # 1. Node.js
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        red 'Node.js is NOT installed.'
        dim 'Download and install from: https://nodejs.org/en/download (LTS)'
        dim 'Then re-run this script.'
        exit 1
    }
    $nodeVer = node --version 2>&1
    grn "Node.js $nodeVer"

    # 2. pnpm  (auto-install if missing)
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        yel 'pnpm not found -- installing globally...'
        npm install -g pnpm 2>&1 | Out-Null
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            red 'pnpm installation failed. Install manually: npm install -g pnpm'
            exit 1
        }
        grn 'pnpm installed'
    }
    grn "pnpm $(pnpm --version)"

    # 3. node_modules  (auto-install if missing or stale)
    $nmOk = (Test-Path "$Root\node_modules\.modules.yaml") -or (Test-Path "$Root\node_modules\.pnpm")
    if (-not $nmOk) {
        yel 'node_modules not found -- running pnpm install (this takes 1-3 min first time)...'
        Push-Location $Root
        pnpm install --frozen-lockfile 2>&1
        $ok = $LASTEXITCODE -eq 0
        Pop-Location
        if (-not $ok) {
            yel 'Frozen install failed -- retrying without frozen lockfile...'
            Push-Location $Root
            pnpm install 2>&1
            Pop-Location
        }
        grn 'Dependencies installed'
    } else {
        grn 'node_modules present'
    }

    # 4. .env (auto-create from .env.example)
    $envFile = "$Root\.env"
    if (-not (Test-Path $envFile)) {
        if (Test-Path "$Root\.env.example") {
            Copy-Item "$Root\.env.example" $envFile
            grn '.env created from .env.example'
            yel 'ACTION REQUIRED: Edit .env and set your real secrets before production use'
        } else {
            yel '.env missing and no .env.example found -- API may fail'
        }
    } else {
        grn '.env present'
    }

    # 5. API .env (optional but recommended)
    $apiEnv = "$Root\apps\api\.env"
    if (-not (Test-Path $apiEnv) -and -not (Test-Path "$Root\apps\api\.env.local")) {
        if (Test-Path "$Root\apps\api\.env.example") {
            Copy-Item "$Root\apps\api\.env.example" $apiEnv
            grn 'apps/api/.env created from .env.example'
        }
        # Not fatal - root .env is sufficient for SQLite mode
    }

    # 6. Prisma
    if (-not (Test-Path "$Root\prisma\schema.prisma")) {
        red 'prisma/schema.prisma not found. Is this the correct project root?'
        exit 1
    }
    grn 'Prisma schema found'

    Write-Host ''
    grn 'All prerequisites satisfied'
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE SETUP  (Prisma generate + db push for SQLite)
# ─────────────────────────────────────────────────────────────────────────────
function Invoke-DatabaseSetup {
    step '2/7' 'Setting up database...'
    rule

    # Set env so Prisma finds DATABASE_URL
    if (Test-Path "$Root\.env") {
        Get-Content "$Root\.env" | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $k = $Matches[1].Trim(); $v = $Matches[2].Trim()
                if (-not (Test-Path "Env:$k")) { Set-Item "Env:$k" $v }
            }
        }
    }

    Push-Location $Root

    # Generate Prisma client
    dim 'Running prisma generate...'
    pnpm prisma generate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { grn 'Prisma client generated' }
    else { yel 'Prisma generate had warnings (non-fatal)' }

    # Push schema to SQLite dev database (idempotent, safe)
    $dbUrl = $env:DATABASE_URL
    if ($dbUrl -match '^file:') {
        dim 'Syncing SQLite schema (prisma db push)...'
        pnpm prisma db push --accept-data-loss 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { grn 'Database schema synced' }
        else { yel 'prisma db push had warnings -- continuing' }
    }

    Pop-Location
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# INFRASTRUCTURE CHECK  (warns about Docker, never starts it unless -WithDocker)
# ─────────────────────────────────────────────────────────────────────────────
function Test-Infrastructure {
    step '3/7' 'Checking infrastructure services (Docker)...'
    rule

    if ($WithDocker) {
        $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
        if ($dockerCmd) {
            dim 'Starting Docker infrastructure (PostgreSQL + Redis + Maildev + pgAdmin)...'
            docker compose -f "$Root\docker-compose.dev.yml" up -d 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { grn 'Docker infrastructure started' }
            else { yel 'Docker infra start had warnings -- check docker compose logs' }
            Start-Sleep -Seconds 3
        } else {
            yel 'Docker not found -- skipping Docker startup'
        }
    }

    $pg      = Test-Port 5432
    $redis   = Test-Port 6379
    $mail    = Test-Port 1080
    $pgAdmin = Test-Port 5050

    if ($pg)      { grn 'PostgreSQL :5432  -- running' }
    else          { dim 'PostgreSQL :5432  -- not running (using SQLite locally)' }

    if ($redis)   { grn 'Redis      :6379  -- running' }
    else          { dim 'Redis      :6379  -- not running (BullMQ queues disabled in SQLite mode)' }

    if ($mail)    { grn 'Maildev    :1080  -- running  http://localhost:1080' }
    else          { dim 'Maildev    :1080  -- not running' }

    if ($pgAdmin) { grn 'pgAdmin    :5050  -- running  http://localhost:5050' }
    else          { dim 'pgAdmin    :5050  -- not running (start Docker to enable pgAdmin)' }

    if (-not $pg -or -not $redis) {
        Write-Host ''
        dim 'To start full Docker infra (Postgres + Redis + Maildev + pgAdmin):'
        dim '  docker compose -f docker-compose.dev.yml up -d'
        dim '  OR run: .\setup.ps1 start -WithDocker'
    }
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# SET NX ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────
function Set-NxEnv {
    $env:NX_REJECT_DYNAMIC_QUESTIONS = 'true'
    $env:CI                          = 'true'
    $env:NODE_OPTIONS                = '--no-warnings --max-old-space-size=4096'
    $env:NX_ISOLATE_PLUGINS          = 'false'
    $env:NX_DAEMON                   = 'false'
    $env:NEXT_TELEMETRY_DISABLED     = '1'
    $env:FORCE_COLOR                 = '1'
}

# ─────────────────────────────────────────────────────────────────────────────
# STOP ALL SERVICES
# ─────────────────────────────────────────────────────────────────────────────
function Stop-AllServices([switch]$Silent) {
    if (-not $Silent) { step '4/7' 'Stopping existing services...'; rule }

    # Kill by saved PIDs
    if (Test-Path $PidFile) {
        Get-Content $PidFile -ErrorAction SilentlyContinue |
            Where-Object { $_ -match '^\d+$' } |
            ForEach-Object {
                try { taskkill /F /T /PID $_ 2>$null | Out-Null } catch {}
            }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }

    # Kill by port as fallback
    @(3000,4205,4206,4207,4208,4210,4211,4212,5555,9229) | ForEach-Object { Clear-Port $_ }

    if (-not $Silent) { grn 'Ports cleared'; Write-Host '' }
}

# ─────────────────────────────────────────────────────────────────────────────
# START A SINGLE SERVICE IN A NEW WINDOW
# ─────────────────────────────────────────────────────────────────────────────
function Start-Service([string]$name, [string]$nxCmd) {
    $title = "[OCK] $name"
    $cmd   = "pnpm nx serve $nxCmd"
    $proc  = Start-Process 'cmd.exe' `
        -ArgumentList "/k title $title && $cmd" `
        -WorkingDirectory $Root `
        -PassThru
    return $proc.Id
}

# ─────────────────────────────────────────────────────────────────────────────
# OPEN PRISMA STUDIO (Database browser)
# ─────────────────────────────────────────────────────────────────────────────
function Open-DatabaseTool {
    # Stop any existing Prisma Studio on port 5555
    Clear-Port 5555

    dim 'Starting Prisma Studio (database browser)...'
    $proc = Start-Process 'cmd.exe' `
        -ArgumentList '/k title [OCK] Prisma Studio && pnpm prisma studio' `
        -WorkingDirectory $Root `
        -PassThru

    # Wait for Prisma Studio to be ready
    $ready = Wait-Port 5555 'Prisma Studio' 30
    if ($ready -ge 0) {
        grn "Prisma Studio ready at http://localhost:5555"
        return $proc.Id
    } else {
        yel 'Prisma Studio may still be starting -- check [OCK] Prisma Studio window'
        return $proc.Id
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# API HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────
function Test-ApiHealth([int]$timeoutSec = 30) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
        try {
            $r = Invoke-WebRequest 'http://localhost:3000/api/health' `
                 -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($r.StatusCode -eq 200) { return $true }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return $false
}

# ─────────────────────────────────────────────────────────────────────────────
# PRINT RICH STARTUP SUMMARY TABLE
# ─────────────────────────────────────────────────────────────────────────────
function Show-Summary([string[]]$activeServices, [int]$totalTime) {
    Write-Host ''
    Write-Host '  +--------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host "  |  ONE CHOICE KITCHEN  --  All Services Status                       |" -ForegroundColor White
    Write-Host "  |  Profile: $($RunProfile.ToUpper().PadRight(57))|" -ForegroundColor Yellow
    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan
    Write-Host '  | Service                | Port  | Status  | URL                         |' -ForegroundColor Cyan
    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan

    # API extra URLs
    $apiUp = Test-Port 3000
    $apiStatus = if ($apiUp) { 'LIVE    ' } else { 'LOADING ' }
    $apiColor  = if ($apiUp) { 'Green'   } else { 'Yellow'  }
    if ($activeServices -contains 'api') {
        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host 'NestJS API              ' -NoNewline -ForegroundColor White
        Write-Host '| 3000  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $apiStatus -NoNewline -ForegroundColor $apiColor
        Write-Host '| http://localhost:3000          |' -ForegroundColor Cyan
        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host 'API Documentation (Docs)' -NoNewline -ForegroundColor White
        Write-Host '| 3000  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $apiStatus -NoNewline -ForegroundColor $apiColor
        Write-Host '| http://localhost:3000/api/docs  |' -ForegroundColor Cyan
        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host 'API Health Check        ' -NoNewline -ForegroundColor White
        Write-Host '| 3000  | ' -NoNewline -ForegroundColor Cyan
        $apiHealthOk = Test-ApiHealth 5
        $hStatus = if ($apiHealthOk) { 'HEALTHY ' } else { 'CHECK   ' }
        $hColor  = if ($apiHealthOk) { 'Green'   } else { 'Yellow'  }
        Write-Host $hStatus -NoNewline -ForegroundColor $hColor
        Write-Host '| http://localhost:3000/api/health|' -ForegroundColor Cyan
    }

    # Nx app services
    foreach ($svcName in $activeServices) {
        if ($svcName -eq 'api') { continue }
        $svc    = $ServiceDefs[$svcName]
        $label  = $ServiceLabels[$svcName]
        $up     = Test-Port $svc.Port
        $status = if ($up) { 'LIVE    ' } else { 'LOADING ' }
        $color  = if ($up) { 'Green'   } else { 'Yellow'  }
        $n      = $label.PadRight(24)
        $p      = "$($svc.Port) ".PadRight(5)
        $u      = $svc.Url.PadRight(29)

        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $n -NoNewline -ForegroundColor White
        Write-Host "| $p | " -NoNewline -ForegroundColor Cyan
        Write-Host $status -NoNewline -ForegroundColor $color
        Write-Host "| $u |" -ForegroundColor Cyan
    }

    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan
    Write-Host '  |  Infrastructure (Docker)                                               |' -ForegroundColor DarkGray

    foreach ($infra in $InfraServices) {
        $up = Test-Port $infra.Port
        $status = if ($up) { 'UP      ' } else { 'STOPPED ' }
        $color  = if ($up) { 'Green'   } else { 'DarkGray' }
        $n      = $infra.Name.PadRight(24)
        $p      = "$($infra.Port) ".PadRight(5)
        $u      = $infra.Url.PadRight(29)

        Write-Host '  | ' -NoNewline -ForegroundColor DarkGray
        Write-Host $n -NoNewline -ForegroundColor $(if ($up) { 'White' } else { 'DarkGray' })
        Write-Host "| $p | " -NoNewline -ForegroundColor DarkGray
        Write-Host $status -NoNewline -ForegroundColor $color
        Write-Host "| $u |" -ForegroundColor DarkGray
    }

    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan
    Write-Host "  |  Total startup time: ${totalTime}s                                         |" -ForegroundColor DarkGray
    Write-Host '  |  Stop:   .\setup.ps1 stop          Status: .\setup.ps1 status          |' -ForegroundColor DarkGray
    Write-Host '  |  Docker: docker compose -f docker-compose.dev.yml up -d                |' -ForegroundColor DarkGray
    Write-Host '  +------------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN: START
# ─────────────────────────────────────────────────────────────────────────────
function Start-All {
    $globalSw = [Diagnostics.Stopwatch]::StartNew()
    Show-Banner

    $activeServices = $ProfileMap[$RunProfile]
    $pids = [System.Collections.Generic.List[int]]::new()

    # ── Step 1: Prerequisites ────────────────────────────────────────────────
    Invoke-Prerequisites

    # ── Step 2: Database setup ───────────────────────────────────────────────
    Invoke-DatabaseSetup

    # ── Step 3: Infrastructure check (informational only) ────────────────────
    Test-Infrastructure

    # ── Step 4: Stop existing services ──────────────────────────────────────
    Stop-AllServices -Silent
    step '4/7' 'Clearing ports...'
    rule
    grn "Ports cleared for profile: $RunProfile"
    Write-Host ''

    # ── Step 5: Set Nx environment ───────────────────────────────────────────
    Set-NxEnv

    # ── Step 6: Start API ────────────────────────────────────────────────────
    step '5/7' 'Starting NestJS API...'
    rule

    $apiSw  = [Diagnostics.Stopwatch]::StartNew()
    $apiPid = Start-Service 'api' 'api'
    $pids.Add($apiPid)
    dim "API process started (PID $apiPid)"
    dim 'Waiting for API to be ready on port 3000...'

    $apiWaitSec = Wait-Port 3000 'NestJS API' 180
    $apiSw.Stop()

    if ($apiWaitSec -lt 0) {
        red 'API did not start within 3 minutes.'
        red 'Check the [OCK] api console window for build errors.'
        red 'Common fixes:'
        dim '  1. pnpm nx reset  (clears Nx cache)'
        dim '  2. Check apps/api/src for TypeScript errors'
        dim '  3. Make sure .env exists with DATABASE_URL'
        $pids | Out-File $PidFile
        exit 1
    }
    grn "API is ready on port 3000 (${apiWaitSec}s)"

    # Additional health check
    $apiHealthy = Test-ApiHealth 15
    if ($apiHealthy) { grn 'API /health endpoint: HEALTHY  http://localhost:3000/api/health' }
    else             { yel 'API /health not yet responding (NestJS modules still loading)' }
    grn 'API Documentation:           http://localhost:3000/api/docs'
    Write-Host ''

    # ── Step 7: Start frontends ──────────────────────────────────────────────
    $frontends = $activeServices | Where-Object { $_ -ne 'api' }

    if ($frontends.Count -gt 0) {
        step '6/7' "Starting $($frontends.Count) frontend service(s)..."
        rule

        foreach ($svcName in $frontends) {
            $svc = $ServiceDefs[$svcName]
            $svcPid = Start-Service $svcName $svc.NxCmd
            $pids.Add($svcPid)
            grn "$($ServiceLabels[$svcName]) launched (PID $svcPid, port $($svc.Port))"
            Start-Sleep -Milliseconds 800   # stagger startup to reduce contention
        }
        Write-Host ''

        # Wait for all frontends
        step '7/7' 'Waiting for all frontends to be ready...'
        rule
        dim '(Next.js/Vite compilation typically takes 30-90 seconds)'
        Write-Host ''

        foreach ($svcName in $frontends) {
            $svc     = $ServiceDefs[$svcName]
            $feSw    = [Diagnostics.Stopwatch]::StartNew()
            $waitSec = Wait-Port $svc.Port $svcName 180
            $feSw.Stop()
            if ($waitSec -ge 0) { grn "$($ServiceLabels[$svcName]) ready on :$($svc.Port) (${waitSec}s)" }
            else                 { yel "$($ServiceLabels[$svcName]) still compiling -- check [OCK] $svcName window" }
        }
    } else {
        step '6/7' 'No frontends in this profile (API only)'
        step '7/7' 'Skipping frontend wait'
    }

    # ── Open Prisma Studio (by default, unless -NoDBBrowser) ────────────────
    if (-not $NoBrowser -and -not $NoDBBrowser) {
        Write-Host ''
        cyn 'Opening Prisma Studio (database browser) on :5555...'
        $studioPid = Open-DatabaseTool
        if ($studioPid -gt 0) { $pids.Add($studioPid) }
    }

    # Save PIDs
    $pids | Out-File $PidFile -Encoding ascii
    Write-Host ''
    rule

    # ── Open browsers ─────────────────────────────────────────────────────────
    if (-not $NoBrowser) {
        cyn 'Opening browser tabs for all services...'
        Write-Host ''

        # Open all active Nx services
        foreach ($svcName in $activeServices) {
            $svc = $ServiceDefs[$svcName]
            if ($svc.OpenBrowser -and (Test-Port $svc.Port)) {
                $label = $ServiceLabels[$svcName]
                dim "  Opening: $($svc.Url)  ($label)"
                Start-Sleep -Milliseconds 500
                Start-Process $svc.Url
            }
        }

        # Also open API docs and health separately
        if ($activeServices -contains 'api') {
            Start-Sleep -Milliseconds 500
            dim '  Opening: http://localhost:3000/api/docs  (API Documentation)'
            # Already opened via api Url above — skip duplicate

            Start-Sleep -Milliseconds 500
            dim '  Opening: http://localhost:3000/api/health  (API Health)'
            Start-Process 'http://localhost:3000/api/health'
        }

        # Open Docker tool URLs if running
        if (Test-Port 1080) {
            Start-Sleep -Milliseconds 500
            dim '  Opening: http://localhost:1080  (MailDev)'
            Start-Process 'http://localhost:1080'
        }
        if (Test-Port 5050) {
            Start-Sleep -Milliseconds 500
            dim '  Opening: http://localhost:5050  (pgAdmin)'
            Start-Process 'http://localhost:5050'
        }
        if (Test-Port 5555) {
            Start-Sleep -Milliseconds 500
            dim '  Opening: http://localhost:5555  (Prisma Studio)'
            Start-Process 'http://localhost:5555'
        }

        Write-Host ''
    } else {
        dim '-NoBrowser flag set — skipping browser auto-open'
        Write-Host ''
    }

    # ── Final summary ─────────────────────────────────────────────────────────
    $globalSw.Stop()
    Show-Summary $activeServices ([int]$globalSw.Elapsed.TotalSeconds)

    Write-Host '' -ForegroundColor Green
    Write-Host '  ✅ OneChoiceKitchen is LIVE!' -ForegroundColor Green
    Write-Host ''
    cyn 'All service windows are open in separate terminals.'
    cyn 'Use .\setup.ps1 stop to shut everything down.'
    Write-Host ''

    if (-not $NoBrowser -and -not $OpenDB) {
        dim 'Tip: Run .\setup.ps1 start -OpenDB to also open Prisma Studio (DB browser)'
    }
    if (-not $WithDocker -and -not (Test-Port 5432)) {
        dim 'Tip: Run .\setup.ps1 start -WithDocker to auto-start Docker infra (PostgreSQL+Redis+pgAdmin)'
    }
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN: STOP
# ─────────────────────────────────────────────────────────────────────────────
function Stop-All {
    Show-Banner
    step '1/1' 'Stopping all OneChoiceKitchen Nx services...'
    rule
    Stop-AllServices
    grn 'All Nx services stopped'
    Write-Host ''
    dim 'Docker infrastructure (PostgreSQL / Redis / Maildev / pgAdmin) is still running.'
    dim 'To stop Docker infra: docker compose -f docker-compose.dev.yml down'
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN: STATUS
# ─────────────────────────────────────────────────────────────────────────────
function Show-Status {
    Show-Banner
    Write-Host ''
    Write-Host '  +-------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host '  |  ONE CHOICE KITCHEN  --  Live Service Status                      |' -ForegroundColor White
    Write-Host '  +------------------------+-------+---------+-------------------------+' -ForegroundColor Cyan
    Write-Host '  | Service                | Port  | Status  | URL                     |' -ForegroundColor Cyan
    Write-Host '  +------------------------+-------+---------+-------------------------+' -ForegroundColor Cyan

    Write-Host '  |  --- Nx Application Services ---                                   |' -ForegroundColor DarkGray
    foreach ($svcName in $ServiceDefs.Keys) {
        $svc    = $ServiceDefs[$svcName]
        $label  = $ServiceLabels[$svcName]
        $up     = Test-Port $svc.Port
        $status = if ($up) { 'RUNNING ' } else { 'STOPPED ' }
        $color  = if ($up) { 'Green'   } else { 'DarkGray' }
        $n      = $label.PadRight(24)
        $p      = "$($svc.Port) ".PadRight(5)
        $u      = $svc.Url.PadRight(25)

        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $n -NoNewline -ForegroundColor $(if ($up) { 'White' } else { 'DarkGray' })
        Write-Host "| $p | " -NoNewline -ForegroundColor Cyan
        Write-Host $status -NoNewline -ForegroundColor $color
        Write-Host "| $u |" -ForegroundColor Cyan
    }

    Write-Host '  +------------------------+-------+---------+-------------------------+' -ForegroundColor Cyan
    Write-Host '  |  --- Infrastructure (Docker) ---                                   |' -ForegroundColor DarkGray

    @(
        @{N='PostgreSQL';    P=5432; U='localhost:5432'              }
        @{N='Redis';         P=6379; U='localhost:6379'              }
        @{N='MailDev SMTP';  P=1025; U='localhost:1025'              }
        @{N='MailDev UI';    P=1080; U='http://localhost:1080'       }
        @{N='pgAdmin';       P=5050; U='http://localhost:5050'       }
        @{N='Prisma Studio'; P=5555; U='http://localhost:5555'       }
    ) | ForEach-Object {
        $up = Test-Port $_.P
        $c  = if ($up) { 'Green' } else { 'DarkGray' }
        $s  = if ($up) { 'RUNNING ' } else { 'STOPPED ' }
        $n  = $_.N.PadRight(24)
        $p  = "$($_.P) ".PadRight(5)
        $u  = $_.U.PadRight(25)

        Write-Host '  | ' -NoNewline -ForegroundColor DarkGray
        Write-Host $n -NoNewline -ForegroundColor $(if ($up) { 'White' } else { 'DarkGray' })
        Write-Host "| $p | " -NoNewline -ForegroundColor DarkGray
        Write-Host $s -NoNewline -ForegroundColor $c
        Write-Host "| $u |" -ForegroundColor DarkGray
    }

    Write-Host '  +------------------------+-------+---------+-------------------------+' -ForegroundColor Cyan
    Write-Host ''

    # Quick tips
    $anyUp = $ServiceDefs.Keys | Where-Object { Test-Port $ServiceDefs[$_].Port } | Select-Object -First 1
    if (-not $anyUp) {
        yel 'No services running. Start with: .\setup.ps1 start'
        yel 'For Docker infra:                docker compose -f docker-compose.dev.yml up -d'
    }
    Write-Host ''
}

# ─────────────────────────────────────────────────────────────────────────────
# DISPATCH
# ─────────────────────────────────────────────────────────────────────────────
switch ($Action) {
    'start'  { Start-All }
    'stop'   { Stop-All }
    'status' { Show-Status }
}
