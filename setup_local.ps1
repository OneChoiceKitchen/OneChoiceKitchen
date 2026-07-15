<#
.SYNOPSIS
  OneChoiceKitchen - Local Development Orchestrator v5.3 (setup_local.ps1)
  Fully self-healing. Interactive menu. Deep-clean support. Docker-free (but Docker-aware).
  For PRODUCTION deployment, use: .\setup_deployment.ps1

.DESCRIPTION
  Single command to start the entire OneChoiceKitchen development environment.
  Run with NO ARGUMENTS to get an interactive menu. Pass arguments to skip the menu.

  WHAT IT AUTO-HANDLES:
    [1]  Interactive menu     → guided action selection with confirmation
    [2]  Node.js check        → errors with install link if missing
    [3]  pnpm check           → installs globally if missing
    [4]  Dependencies         → ALWAYS runs pnpm install (fast if lock unchanged)
    [5]  .env files           → creates from .env.example if missing
    [6]  Prisma client        → runs prisma generate automatically
    [7]  Prisma DB push       → syncs SQLite schema automatically
    [8]  Port cleanup         → kills stale processes on all service ports
    [9]  API startup          → waits for health before starting frontends
    [10] Frontends            → starts all profile services in parallel windows
    [11] Browser launch       → opens ALL service URLs in correct order
    [12] Prisma Studio        → opens DB browser at http://localhost:5555
    [13] Deep clean           → removes node_modules, .nx, dist, .next (optional)

  COMPLETELY SEPARATE FROM DOCKER:
    Docker infrastructure (PostgreSQL, Redis, Maildev, pgAdmin) is managed by:
      docker compose -f docker-compose.dev.yml up -d
    This script NEVER calls Docker. It only manages Nx app services.
    Use -WithDocker to also start Docker infra automatically.

.PARAMETER Action
  'start'  -- start all services (default)
  'stop'   -- stop all services (add -DeepClean to also remove node_modules etc.)
  'status' -- show live status of all ports

.PARAMETER RunProfile
  'core'     -- API + Web Portal only (2 services, fastest startup)
  'standard' -- API + Web + Admin + Partner + Rider portals (DEFAULT, 5 services)
  'all'      -- Everything including mobile apps (7 services)
  'mobile'   -- API + Mobile + Rider Mobile

.PARAMETER DeepClean
  Switch: when used with stop, prompts to delete node_modules, .nx, dist, .next

.PARAMETER NoBrowser
  Switch: skip auto-opening browser tabs

.PARAMETER NoDBBrowser
  Switch: skip auto-opening Prisma Studio (database browser)

.PARAMETER OpenDB
  Switch: explicitly open Prisma Studio (only needed if -NoDBBrowser was used)

.PARAMETER WithDocker
  Switch: auto-start Docker infra (PostgreSQL + Redis + Maildev + pgAdmin) before starting apps

.EXAMPLE
  .\setup_local.ps1                                         # interactive menu
  .\setup_local.ps1 start                                   # standard profile
  .\setup_local.ps1 start -RunProfile core                  # minimal: API + Web
  .\setup_local.ps1 start -RunProfile all                   # everything including mobile
  .\setup_local.ps1 start -NoBrowser                        # start without opening browsers
  .\setup_local.ps1 start -NoDBBrowser                      # start without Prisma Studio
  .\setup_local.ps1 start -WithDocker                       # auto-start Docker infra first
  .\setup_local.ps1 stop                                    # stop services only
  .\setup_local.ps1 stop -DeepClean                         # stop + remove node_modules etc.
  .\setup_local.ps1 status                                  # check what is running
#>

param(
    # NOTE: No [ValidateSet] here - empty string default is not in enum,
    # which causes PowerShell to crash before the interactive menu can show.
    # Validation happens manually in the dispatch section at the bottom.
    [string]$Action     = '',
    [string]$RunProfile = '',

    [switch]$DeepClean,
    [switch]$NoBrowser,
    [switch]$NoDBBrowser,
    [switch]$OpenDB,
    [switch]$WithDocker
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'

# Fix mojibake/Unicode output in some Windows terminals
[console]::OutputEncoding = [System.Text.Encoding]::UTF8


# Keep window open on any unhandled error (prevents immediate close on crash)
trap {
    Write-Host ""
    Write-Host "  UNHANDLED ERROR: $_" -ForegroundColor Red
    Write-Host "  Press Enter to close this window..." -ForegroundColor Yellow
    $null = Read-Host
    exit 1
}

# -- Constants ------------------------------------------------------------------
$Root    = $PSScriptRoot
$PidFile = Join-Path $Root '.service-pids'

# -- Colour helpers -------------------------------------------------------------
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
    Write-Host "  |   ONE CHOICE KITCHEN  -  Local Dev Orchestrator v5.3      |" -ForegroundColor White
    Write-Host "  +============================================================+" -ForegroundColor Cyan
    Write-Host ""
}

# -- Port utilities -------------------------------------------------------------
# Uses Get-NetTCPConnection so it detects BOTH IPv4 (127.0.0.1) AND IPv6 (::1)
# listeners. The old TcpClient approach only checked 127.0.0.1 which missed
# Next.js dev servers that bind to ::1 on Windows.
function Test-Port([int]$p) {
    $listeners = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $listeners -and @($listeners).Count -gt 0)
}

function Clear-Port([int]$p) {
    Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
        }
}

function Wait-Port([int]$p, [string]$label, [int]$max = 240) {
    $sw   = [Diagnostics.Stopwatch]::StartNew()
    $spin = @('|','/','-','\')
    $i    = 0
    while ($sw.Elapsed.TotalSeconds -lt $max) {
        if (Test-Port $p) { Write-Host ''; return [int]$sw.Elapsed.TotalSeconds }
        Write-Host "`r       $($spin[$i%4])  Waiting for $label [:$p] ... $([int]$sw.Elapsed.TotalSeconds)s  " -NoNewline -ForegroundColor DarkCyan
        $i++
        Start-Sleep -Milliseconds 600
    }
    Write-Host ''
    return -1
}

# -- Service definitions --------------------------------------------------------
$ServiceDefs = [ordered]@{
    'api'            = @{ NxCmd='api';            Port=3000; Url='http://localhost:3000/api/docs'; OpenBrowser=$true }
    'web'            = @{ NxCmd='web';            Port=4208; Url='http://localhost:4208';          OpenBrowser=$true }
    'admin-portal'   = @{ NxCmd='admin-portal';   Port=4205; Url='http://localhost:4205';          OpenBrowser=$true }
    'partner-portal' = @{ NxCmd='partner-portal'; Port=4206; Url='http://localhost:4206';          OpenBrowser=$true }
    'rider-portal'   = @{ NxCmd='rider-portal';   Port=4207; Url='http://localhost:4207';          OpenBrowser=$true }
    'customer-mobile'= @{ NxCmd='customer-mobile';Port=4210; Url='http://localhost:4210';          OpenBrowser=$true }
    'rider-mobile'   = @{ NxCmd='rider-mobile';   Port=4212; Url='http://localhost:4212';          OpenBrowser=$true }
}

$ProfileMap = @{
    'core'     = @('api','web')
    'standard' = @('api','web','admin-portal','partner-portal','rider-portal')
    'mobile'   = @('api','customer-mobile','rider-mobile')
    'all'      = @('api','web','admin-portal','partner-portal','rider-portal','customer-mobile','rider-mobile')
}

# -- Docker / infra service definitions (informational only) --------------------
$InfraServices = @(
    @{ Name='PostgreSQL';     Port=5432; Url='localhost:5432'        }
    @{ Name='Redis';          Port=6379; Url='localhost:6379'        }
    @{ Name='MailDev SMTP';   Port=1025; Url='localhost:1025'        }
    @{ Name='MailDev UI';     Port=1080; Url='http://localhost:1080' }
    @{ Name='pgAdmin';        Port=5050; Url='http://localhost:5050' }
    @{ Name='Prisma Studio';  Port=5555; Url='http://localhost:5555' }
)

# -- Service display names ------------------------------------------------------
$ServiceLabels = @{
    'api'             = 'NestJS API'
    'web'             = 'Web Portal'
    'admin-portal'    = 'Admin Portal'
    'partner-portal'  = 'Partner Portal'
    'rider-portal'    = 'Rider Portal'
    'customer-mobile' = 'Mobile'
    'rider-mobile'    = 'Rider Mobile'
}

# -- Browser launch order (confirmed by user) -----------------------------------
# Prisma Studio is opened separately via Open-DatabaseTool
$BrowserLaunchOrder = @('web','admin-portal','partner-portal','rider-portal','customer-mobile','rider-mobile')

# -----------------------------------------------------------------------------
# INTERACTIVE MENU (shown when no -Action passed)
# -----------------------------------------------------------------------------
function Show-InteractiveMenu {
    Show-Banner

    Write-Host '  What would you like to do?' -ForegroundColor White
    Write-Host ''
    Write-Host '  -- START ------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [1]  Start  ' -NoNewline -ForegroundColor Cyan
    Write-Host 'standard ' -NoNewline -ForegroundColor Yellow
    Write-Host '(API + Web Portal + Admin + Partner + Rider)' -ForegroundColor DarkGray
    Write-Host '  [2]  Start  ' -NoNewline -ForegroundColor Cyan
    Write-Host 'all      ' -NoNewline -ForegroundColor Yellow
    Write-Host '(standard + Mobile + Rider Mobile)' -ForegroundColor DarkGray
    Write-Host '  [3]  Start  ' -NoNewline -ForegroundColor Cyan
    Write-Host 'core     ' -NoNewline -ForegroundColor Yellow
    Write-Host '(API + Web Portal only -- fastest startup)' -ForegroundColor DarkGray
    Write-Host '  [4]  Start  ' -NoNewline -ForegroundColor Cyan
    Write-Host 'mobile   ' -NoNewline -ForegroundColor Yellow
    Write-Host '(API + Mobile + Rider Mobile)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  -- STOP -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [5]  Stop services              ' -NoNewline -ForegroundColor Cyan
    Write-Host '(kill ports -- keep node_modules)' -ForegroundColor DarkGray
    Write-Host '  [6]  Stop + Deep Clean          ' -NoNewline -ForegroundColor Cyan
    Write-Host '(kill ports + delete node_modules, .nx, dist)' -ForegroundColor Yellow
    Write-Host ''
    Write-Host '  -- INFO -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [7]  Show service status' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  -- EXIT -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [0]  Exit orchestrator' -ForegroundColor DarkGray
    Write-Host ''

    $choice = ''
    while ($choice -notmatch '^[0-7]$') {
        $choice = Read-Host '  Enter choice [0-7]'
    }

    switch ($choice) {
        '1' { $script:Action = 'start'; $script:RunProfile = 'standard' }
        '2' { $script:Action = 'start'; $script:RunProfile = 'all'      }
        '3' { $script:Action = 'start'; $script:RunProfile = 'core'     }
        '4' { $script:Action = 'start'; $script:RunProfile = 'mobile'   }
        '5' { $script:Action = 'stop'                                   }
        '6' { $script:Action = 'stop';  $script:DeepClean = $true      }
        '7' { $script:Action = 'status'                                 }
        '0' { $script:Action = 'exit'                                   }
    }

    if ($script:Action -eq 'exit') { return }

    Write-Host ''
    $actionDesc = switch ($script:Action) {
        'start'  { 'Start services  (Profile: ' + $script:RunProfile.ToUpper() + ')' }
        'stop'   { if ($script:DeepClean) { 'Stop services + Deep Clean' } else { 'Stop services' } }
        'status' { 'Show service status' }
    }
    Write-Host '  You selected: ' -NoNewline -ForegroundColor DarkGray
    Write-Host $actionDesc -ForegroundColor Yellow
    Write-Host ''
    $null = Read-Host '  Press Enter to continue (Ctrl+C to cancel)'
    Write-Host ''
}

# -----------------------------------------------------------------------------
# PREREQUISITE CHECKS  (self-healing - always runs pnpm install)
# -----------------------------------------------------------------------------
function Invoke-Prerequisites {
    step '1/7' 'Checking prerequisites & restoring dependencies...'
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

    # 2. pnpm (auto-install or auto-update)
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        yel 'pnpm not found -- installing globally...'
        npm install -g pnpm 2>&1 | Out-Null
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            red 'pnpm installation failed. Install manually: npm install -g pnpm'
            exit 1
        }
        grn 'pnpm installed'
    } else {
        dim 'Checking for pnpm updates...'
        $currentPnpm = pnpm --version
        $latestPnpm = npm show pnpm version 2>$null
        if ($latestPnpm -and $currentPnpm.Trim() -ne $latestPnpm.Trim()) {
            yel "pnpm update available ($($currentPnpm.Trim()) -> $($latestPnpm.Trim())) -- updating..."
            npm install -g pnpm@latest 2>&1 | Out-Null
            grn "pnpm updated to $(pnpm --version)"
        } else {
            grn "pnpm $currentPnpm (up to date)"
        }
    }

    # 3. Always run pnpm install (idempotent - fast if lock unchanged, full if after deep clean)
    dim 'Ensuring all dependencies are installed (pnpm install)...'
    dim '(This is fast if node_modules exists; 2-5 min after a deep clean)'
    Push-Location $Root
    pnpm install 2>&1
    $installOk = $LASTEXITCODE -eq 0
    Pop-Location
    if (-not $installOk) {
        red 'pnpm install failed. Check network connection and pnpm-lock.yaml.'
        exit 1
    }
    grn 'Dependencies ready'

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

# -----------------------------------------------------------------------------
# DATABASE SETUP  (Prisma generate + db push)
# -----------------------------------------------------------------------------
function Invoke-DatabaseSetup {
    step '2/7' 'Setting up database...'
    rule

    # Load .env into process env
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

    # Push schema to SQLite dev database
    $dbUrl = $env:DATABASE_URL
    if ($dbUrl -match '^file:') {
        dim 'Syncing SQLite schema (prisma db push)...'
        pnpm prisma db push --accept-data-loss 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { grn 'Database schema synced' }
        else { yel 'prisma db push had warnings -- continuing' }
    }

    # Auto-seed development data (idempotent - safe to re-run)
    if (Test-Path "$Root\prisma\seeds\seed_dev_data.ts") {
        dim 'Seeding development data...'
        pnpm exec ts-node --project tsconfig.json prisma/seeds/seed_dev_data.ts 2>&1 | ForEach-Object {
            if ($_ -match '^\[SEED') { Write-Host "  $_" -ForegroundColor Cyan }
        }
        if ($LASTEXITCODE -eq 0) { grn 'Dev data seeded successfully' }
        else { yel 'Seed had warnings -- check prisma/seeds/seed_dev_data.ts' }
    }

    Pop-Location
    Write-Host ''
}

# -----------------------------------------------------------------------------
# INFRASTRUCTURE CHECK  (warns about Docker, never starts it unless -WithDocker)
# -----------------------------------------------------------------------------
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
        dim '  OR run: .\setup_local.ps1 start -WithDocker'
    }
    Write-Host ''
}

# -----------------------------------------------------------------------------
# SET NX ENVIRONMENT
# -----------------------------------------------------------------------------
function Set-NxEnv {
    $env:NX_REJECT_DYNAMIC_QUESTIONS = 'true'
    $env:CI                          = 'true'
    $env:NODE_OPTIONS                = '--no-warnings --max-old-space-size=4096'
    $env:NX_ISOLATE_PLUGINS          = 'false'
    $env:NX_DAEMON                   = 'false'
    $env:NEXT_TELEMETRY_DISABLED     = '1'
    $env:FORCE_COLOR                 = '1'
}

# -----------------------------------------------------------------------------
# STOP ALL SERVICES (kill ports + PID file)
# -----------------------------------------------------------------------------
function Stop-AllServices([switch]$Silent) {
    if (-not $Silent) { step '1/1' 'Stopping all services...'; rule }

    # Kill by saved PIDs
    if (Test-Path $PidFile) {
        Get-Content $PidFile -ErrorAction SilentlyContinue |
            Where-Object { $_ -match '^\d+$' } |
            ForEach-Object {
                try { taskkill /F /T /PID $_ 2>$null | Out-Null } catch {}
            }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }

    # Kill standalone MailDev window if it exists (avoids killing Docker)
    Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "OCK-MailDev" } | Stop-Process -Force -ErrorAction SilentlyContinue


    # Kill by port as fallback
    @(3000,4205,4206,4207,4208,4210,4212,5555,9229) | ForEach-Object { Clear-Port $_ }

    if (-not $Silent) { grn 'All ports cleared'; Write-Host '' }
}

# -----------------------------------------------------------------------------
# DEEP CLEAN  (delete node_modules, .nx, dist, .next)
# -----------------------------------------------------------------------------
function Invoke-DeepClean {
    Write-Host ''
    Write-Host '  -------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  Deep Clean - remove generated & dependency files?' -ForegroundColor Yellow
    Write-Host ''
    Write-Host '  This will DELETE:' -ForegroundColor White
    Write-Host '    node_modules/        (all npm packages)' -ForegroundColor DarkGray
    Write-Host '    .nx/                 (Nx daemon + build cache)' -ForegroundColor DarkGray
    Write-Host '    dist/                (compiled output)' -ForegroundColor DarkGray
    Write-Host '    apps/**/.next/       (Next.js build cache per app)' -ForegroundColor DarkGray
    Write-Host '    apps/**/dist/        (per-app compiled output)' -ForegroundColor DarkGray
    Write-Host '    .service-pids        (PID tracking file)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  This will NEVER delete:' -ForegroundColor White
    Write-Host '    .env / .env.local    Source code   prisma/migrations   pnpm-lock.yaml' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  WARNING: pnpm install will run automatically on next start.' -ForegroundColor Yellow
    Write-Host ''

    $confirm = Read-Host "  Type 'yes' to confirm deep clean, or press Enter to skip"
    if ($confirm.Trim().ToLower() -ne 'yes') {
        dim 'Deep clean skipped.'
        Write-Host ''
        return
    }

    Write-Host ''
    cyn 'Deep cleaning workspace...'
    rule

    # node_modules (root)
    if (Test-Path "$Root\node_modules") {
        dim 'Removing node_modules/ ...'
        Remove-Item "$Root\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        grn 'node_modules/ removed'
    } else { dim 'node_modules/ not found (already clean)' }

    # .nx cache
    if (Test-Path "$Root\.nx") {
        dim 'Removing .nx/ (Nx daemon + build cache) ...'
        Remove-Item "$Root\.nx" -Recurse -Force -ErrorAction SilentlyContinue
        grn '.nx/ removed'
    } else { dim '.nx/ not found (already clean)' }

    # dist/ (root)
    if (Test-Path "$Root\dist") {
        dim 'Removing dist/ ...'
        Remove-Item "$Root\dist" -Recurse -Force -ErrorAction SilentlyContinue
        grn 'dist/ removed'
    } else { dim 'dist/ not found (already clean)' }

    # .next/ per Next.js app
    $nextDirs = Get-ChildItem -Path "$Root\apps" -Recurse -Filter '.next' -Directory -ErrorAction SilentlyContinue
    if ($nextDirs) {
        $nextDirs | ForEach-Object {
            dim "Removing $($_.FullName) ..."
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        grn 'All apps/**/.next/ folders removed'
    } else { dim 'No .next/ folders found' }

    # Per-app dist/ folders (inside apps/)
    $appDistDirs = Get-ChildItem -Path "$Root\apps" -Recurse -Filter 'dist' -Directory -ErrorAction SilentlyContinue
    if ($appDistDirs) {
        $appDistDirs | ForEach-Object {
            dim "Removing $($_.FullName) ..."
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        grn 'All apps/**/dist/ folders removed'
    } else { dim 'No app dist/ folders found' }

    # PID file
    if (Test-Path $PidFile) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        grn '.service-pids removed'
    }

    # Temp scratch files
    $tmpFiles = Get-ChildItem -Path "$Root" -Filter "tmp_*" -File -ErrorAction SilentlyContinue
    if ($tmpFiles) {
        $tmpFiles | ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }
        grn 'Temporary files (tmp_*) removed'
    }

    Write-Host ''
    grn 'Deep clean complete.'
    Write-Host ''
    yel 'Run .\setup_local.ps1 start to reinstall dependencies and launch services.'
    Write-Host ''
}

# -----------------------------------------------------------------------------
# START A SINGLE SERVICE IN A NEW WINDOW
# -----------------------------------------------------------------------------
function Start-NxService([string]$name, [string]$nxCmd) {
    $title = "[OCK] $name"
    $cmd   = "pnpm nx serve $nxCmd"
    $proc  = Start-Process 'cmd.exe' `
        -ArgumentList "/k title $title && $cmd" `
        -WorkingDirectory $Root `
        -PassThru
    return $proc.Id
}

# -----------------------------------------------------------------------------
# OPEN PRISMA STUDIO (Database browser)
# -----------------------------------------------------------------------------
function Open-DatabaseTool {
    Clear-Port 5555
    dim 'Starting Prisma Studio (database management)...'
    $psBin = "$Root\node_modules\.bin\prisma.CMD"
    $proc = Start-Process 'cmd.exe' `
        -ArgumentList "/k title OCK-PrismaStudio && `"$psBin`" studio" `
        -WorkingDirectory $Root `
        -PassThru

    $ready = Wait-Port 5555 'Prisma Studio' 30
    if ($ready -ge 0) {
        grn "Prisma Studio ready at http://localhost:5555"
    } else {
        yel 'Prisma Studio may still be starting -- check OCK-PrismaStudio window'
    }
    return $proc.Id
}

# -----------------------------------------------------------------------------
# API HEALTH CHECK
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# PRINT RICH STARTUP SUMMARY TABLE
# -----------------------------------------------------------------------------
function Show-Summary([string[]]$activeServices, [int]$totalTime) {
    Write-Host ''
    Write-Host '  +--------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host "  |  ONE CHOICE KITCHEN  --  All Services Status                       |" -ForegroundColor White
    Write-Host "  |  Profile: $($RunProfile.ToUpper().PadRight(57))|" -ForegroundColor Yellow
    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan
    Write-Host '  | Service                | Port  | Status  | URL                         |' -ForegroundColor Cyan
    Write-Host '  +------------------------+-------+---------+-----------------------------+' -ForegroundColor Cyan

    # API
    if ($activeServices -contains 'api') {
        $apiUp     = Test-Port 3000
        $apiStatus = if ($apiUp) { 'LIVE    ' } else { 'LOADING ' }
        $apiColor  = if ($apiUp) { 'Green'   } else { 'Yellow'  }
        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host 'NestJS API              ' -NoNewline -ForegroundColor White
        Write-Host '| 3000  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $apiStatus -NoNewline -ForegroundColor $apiColor
        Write-Host '| http://localhost:3000          |' -ForegroundColor Cyan
        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host 'API Docs                ' -NoNewline -ForegroundColor White
        Write-Host '| 3000  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $apiStatus -NoNewline -ForegroundColor $apiColor
        Write-Host '| http://localhost:3000/api/docs  |' -ForegroundColor Cyan
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
        $up     = Test-Port $infra.Port
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
    Write-Host "  |  Total startup time: ${totalTime}s                                          |" -ForegroundColor DarkGray
    Write-Host '  |  Stop:   .\setup_local.ps1 stop        Status: .\setup_local.ps1 status |' -ForegroundColor DarkGray
    Write-Host '  |  Docker: docker compose -f docker-compose.dev.yml up -d                 |' -ForegroundColor DarkGray
    Write-Host '  +------------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host ''
}

# -----------------------------------------------------------------------------
# MAIN: START
# -----------------------------------------------------------------------------
function Start-All {
    $globalSw = [Diagnostics.Stopwatch]::StartNew()
    Show-Banner

    $activeServices = $ProfileMap[$RunProfile]
    $pids = [System.Collections.Generic.List[int]]::new()

    # Step 1: Prerequisites + pnpm install
    Invoke-Prerequisites

    # Step 2: Database setup
    Invoke-DatabaseSetup

    # Step 3: Infrastructure check
    Test-Infrastructure

    # Step 4: Stop existing services silently
    Stop-AllServices -Silent
    step '4/7' 'Clearing ports...'
    rule
    grn "Ports cleared for profile: $RunProfile"
    Write-Host ''

    # Step 5: Set Nx environment
    Set-NxEnv

    # Step 6: Start API
    step '5/7' 'Starting NestJS API...'
    rule

    $apiPid = Start-NxService 'api' 'api'
    $pids.Add($apiPid)
    dim "API process started (PID $apiPid)"
    dim 'Waiting for API to be ready on port 3000...'
    dim '(First-time build may take 2-3 min - do NOT close the [OCK] api window)'
    Write-Host ''

    $apiWaitSec = Wait-Port 3000 'NestJS API' 240

    # Retry once if first attempt timed out
    if ($apiWaitSec -lt 0) {
        yel 'First wait timed out - retrying for 60 more seconds...'
        $apiWaitSec = Wait-Port 3000 'NestJS API' 60
    }

    if ($apiWaitSec -lt 0) {
        red 'API did not start. Check the [OCK] api console window for build errors.'
        red 'Common fixes:'
        dim '  1. pnpm nx reset  (clears Nx cache)'
        dim '  2. Check apps/api/src for TypeScript errors'
        dim '  3. Make sure .env exists with DATABASE_URL'
        $pids | Out-File $PidFile
        exit 1
    }
    grn "API is ready on port 3000 (${apiWaitSec}s)"

    $apiHealthy = Test-ApiHealth 15
    if ($apiHealthy) { grn 'API /health endpoint: HEALTHY  http://localhost:3000/api/health' }
    else             { yel 'API /health not yet responding (NestJS modules still loading)' }
    grn 'API Documentation:           http://localhost:3000/api/docs'
    Write-Host ''

    # Step 7: Start frontends
    # Force array with @() to fix single-item Where-Object returning non-array
    $frontends = @($activeServices | Where-Object { $_ -ne 'api' })

    if ($frontends.Count -gt 0) {
        step '6/7' "Starting $($frontends.Count) frontend service(s)..."
        rule

        foreach ($svcName in $frontends) {
            $svc    = $ServiceDefs[$svcName]
            $svcPid = Start-NxService $svcName $svc.NxCmd
            $pids.Add($svcPid)
            grn "$($ServiceLabels[$svcName]) launched (PID $svcPid, port $($svc.Port))"
            Start-Sleep -Milliseconds 2000   # stagger to reduce CPU/IO contention
        }
        Write-Host ''

        # Wait for all frontends
        step '7/7' 'Waiting for all frontends to be ready...'
        rule
        dim '(Next.js/Vite compilation typically takes 30-120 seconds)'
        dim '(Do NOT close any [OCK] service windows - they are still compiling)'
        Write-Host ''

        foreach ($svcName in $frontends) {
            $svc     = $ServiceDefs[$svcName]
            $waitSec = Wait-Port $svc.Port $svcName 240
            if ($waitSec -ge 0) { grn "$($ServiceLabels[$svcName]) ready on :$($svc.Port) (${waitSec}s)" }
            else                 { yel "$($ServiceLabels[$svcName]) still compiling -- check [OCK] $svcName window" }
        }
    } else {
        step '6/7' 'No frontends in this profile (API only)'
        step '7/7' 'Skipping frontend wait'
    }

    # Open Prisma Studio (database management) - by default, unless -NoDBBrowser
    if (-not $NoBrowser -and -not $NoDBBrowser) {
        Write-Host ''
        cyn 'Opening Prisma Studio (database management) on :5555...'
        $studioPid = Open-DatabaseTool
        if ($studioPid -gt 0) { $pids.Add($studioPid) }
    }

    rule

    # Open browsers - UNCONDITIONALLY after wait phase (browser retries naturally)
    if (-not $NoBrowser) {
        cyn 'Opening browser tabs for all services...'
        Write-Host ''

        # Launch in confirmed order: Web Portal, Admin, Partner, Rider, Mobile, Rider Mobile
        foreach ($svcName in $BrowserLaunchOrder) {
            if ($activeServices -contains $svcName) {
                $svc   = $ServiceDefs[$svcName]
                $label = $ServiceLabels[$svcName]
                dim "  Opening: $($svc.Url)  ($label)"
                Start-Process $svc.Url
                Start-Sleep -Milliseconds 600
            }
        }

        # API docs
        if ($activeServices -contains 'api') {
            dim '  Opening: http://localhost:3000/api/docs  (API Documentation)'
            Start-Process 'http://localhost:3000/api/docs'
            Start-Sleep -Milliseconds 600
        }

        # MailDev -- start as standalone pnpm exec process (maildev is a dev dependency)
        if (-not (Test-Port 1080)) {
            Clear-Port 1080
            Clear-Port 1025
            cyn '  Starting MailDev (email testing UI)...'
            # Same cmd.exe pattern as Start-NxService (proven to work for all services)
            $mdBin = "$Root\node_modules\.bin\maildev.CMD"
            $mdProc = Start-Process 'cmd.exe' `
                -ArgumentList "/k title OCK-MailDev && `"$mdBin`" --web 1080 --smtp 1025" `
                -WorkingDirectory $Root `
                -PassThru
            if ($mdProc) { $pids.Add($mdProc.Id) }
            $mdReady = Wait-Port 1080 'MailDev' 30
            if ($mdReady -ge 0) {
                grn '  MailDev ready on :1080 -- http://localhost:1080'
            } else {
                yel '  MailDev still starting -- check [OCK] MailDev window'
            }
        } else {
            grn '  MailDev already running on :1080'
        }
        dim '  Opening: http://localhost:1080  (MailDev -- Email Testing)'
        Start-Process 'http://localhost:1080'
        Start-Sleep -Milliseconds 600

        # Prisma Studio (database management)
        if (Test-Port 5555) {
            dim '  Opening: http://localhost:5555  (Prisma Studio - Database Management)'
            Start-Process 'http://localhost:5555'
            Start-Sleep -Milliseconds 600
        }

        Write-Host ''
    } else {
        dim '-NoBrowser flag set -- skipping browser auto-open'
        Write-Host ''
    }

    # Save PIDs (must be done after all Start-Process calls including MailDev)
    $pids | Out-File $PidFile -Encoding ascii

    # Final summary
    $globalSw.Stop()
    Show-Summary $activeServices ([int]$globalSw.Elapsed.TotalSeconds)

    Write-Host '' -ForegroundColor Green
    Write-Host '  ✅ OneChoiceKitchen is LIVE!' -ForegroundColor Green
    Write-Host ''
    cyn 'All service windows are open in separate terminals.'
    cyn 'Use .\setup_local.ps1 stop to shut everything down.'
    Write-Host ''
    if (-not $WithDocker -and -not (Test-Port 5432)) {
        dim 'Tip: Run .\setup_local.ps1 start -WithDocker to auto-start Docker infra (PostgreSQL+Redis+pgAdmin)'
    }
    Write-Host ''
}

# -----------------------------------------------------------------------------
# MAIN: STOP
# -----------------------------------------------------------------------------
function Stop-All {
    Show-Banner
    Write-Host ''
    Write-Host '  Stop all OneChoiceKitchen local services?' -ForegroundColor Yellow
    $null = Read-Host "  Press Enter to continue (Ctrl+C to cancel)"
    Write-Host ''

    Stop-AllServices
    dim 'Stopping Docker infrastructure (PostgreSQL / Redis / Maildev / pgAdmin)...'
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        docker compose -f "$Root\docker-compose.dev.yml" down 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { grn 'Docker infrastructure stopped.' }
        else { yel 'Failed to stop Docker infra properly. Run manually: docker compose -f docker-compose.dev.yml down' }
    } else {
        dim 'Docker daemon is not running (skipped).'
    }
    
    Write-Host ''
    dim 'Use .\setup_local.ps1 start to restart services.'
    Write-Host ''

    # Ask for Deep clean
    Invoke-DeepClean
}

# -----------------------------------------------------------------------------
# MAIN: STATUS
# -----------------------------------------------------------------------------
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
        @{N='PostgreSQL';    P=5432; U='localhost:5432'        }
        @{N='Redis';         P=6379; U='localhost:6379'        }
        @{N='MailDev SMTP';  P=1025; U='localhost:1025'        }
        @{N='MailDev UI';    P=1080; U='http://localhost:1080' }
        @{N='pgAdmin';       P=5050; U='http://localhost:5050' }
        @{N='Prisma Studio'; P=5555; U='http://localhost:5555' }
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

    $anyUp = $ServiceDefs.Keys | Where-Object { Test-Port $ServiceDefs[$_].Port } | Select-Object -First 1
    if (-not $anyUp) {
        yel 'No services running. Start with: .\setup_local.ps1 start'
        yel 'For Docker infra:                docker compose -f docker-compose.dev.yml up -d'
    }
    Write-Host ''
}

# -----------------------------------------------------------------------------
# DISPATCH
# -----------------------------------------------------------------------------

# -- Mode A: Arguments passed directly -- run once, then exit -----------------
if ($Action -ne '') {
    if (-not $RunProfile) { $RunProfile = 'standard' }
    switch ($Action) {
        'start'  { Start-All    }
        'stop'   { Stop-All     }
        'status' { Show-Status  }
        default  {
            Write-Host "  Unknown action: $Action. Use: start, stop, status" -ForegroundColor Red
            exit 1
        }
    }
    exit 0
}

# -- Mode B: Interactive menu loop -- stays open until user chooses Exit -------
do {
    # Reset per-loop state so each iteration is independent
    $script:Action     = ''
    $script:RunProfile = ''
    $script:DeepClean  = $false

    Show-InteractiveMenu

    # Apply profile default if needed
    if (-not $script:RunProfile) { $script:RunProfile = 'standard' }

    # Run the selected action
    switch ($script:Action) {
        'start'  { Start-All   }
        'stop'   { Stop-All    }
        'status' { Show-Status }
        'exit'   { break       }
    }

    if ($script:Action -ne 'exit') {
        Write-Host ''
        Write-Host '  ============================================================' -ForegroundColor DarkGray
        Write-Host '  Task complete. Press Enter to return to main menu...' -ForegroundColor Cyan
        Write-Host '  (Press Ctrl+C at any time to close this window)' -ForegroundColor DarkGray
        Write-Host '  ============================================================' -ForegroundColor DarkGray
        $null = Read-Host '  > '
    }

} while ($script:Action -ne 'exit')

Write-Host ''
Write-Host '  Goodbye! OneChoiceKitchen orchestrator closed.' -ForegroundColor Cyan
Write-Host ''

