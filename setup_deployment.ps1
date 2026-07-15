<#
.SYNOPSIS
    OneChoiceKitchen - Production Deployment Script v3.0
    Handles Docker, Vercel, VPS/bare-metal, and shared-hosting deployments.
    Supports start / stop / status actions.

.DESCRIPTION
    Super-admin deployment orchestrator. Detects or accepts target environment,
    validates prerequisites, and starts/deploys/stops all required services.

    REQUIRES: Super-admin credentials (SUPER_ADMIN_TOKEN or interactive login)

.PARAMETER Action
    'deploy' / 'start' -- build and deploy all services (default)
    'stop'             -- stop all running services for the target
    'status'           -- show live status of all ports and containers

.PARAMETER Target
    Deployment target. One of: docker | vercel | vps | shared
    If omitted, the script auto-detects based on available tools.

.PARAMETER Env
    Environment to deploy to: dev | staging | prod  (default: prod)

.PARAMETER Profile
    Service profile: full | core | api | mobile  (default: full)
    full   = all services (API + all frontends + workers)
    core   = API + Web + Admin
    api    = API only
    mobile = API + Customer Mobile + Rider Mobile

.PARAMETER SkipBuild
    Skip nx build step (use existing dist/ artifacts)

.PARAMETER NoBrowser
    Do not open browser after deploy

.PARAMETER DryRun
    Show what would be done without executing

.EXAMPLE
    .\setup_deployment.ps1                                      # auto-detect target, full prod deploy
    .\setup_deployment.ps1 -Action deploy -Target docker        # docker prod deploy
    .\setup_deployment.ps1 -Action deploy -Target vercel -Env staging
    .\setup_deployment.ps1 -Action deploy -Target vps -Profile core
    .\setup_deployment.ps1 -Action stop   -Target docker        # stop all docker containers
    .\setup_deployment.ps1 -Action stop   -Target vps           # pm2 delete all + port cleanup
    .\setup_deployment.ps1 -Action status -Target docker        # show container + port status
    .\setup_deployment.ps1 -Action status                       # show port status only
    .\setup_deployment.ps1 -Action deploy -Target docker -DryRun

.NOTES
    For local development, use .\setup_local.ps1 instead.
    Author: OneChoiceKitchen Platform Team
    Version: 3.0.0
#>

[CmdletBinding()]
param (
    [ValidateSet('deploy','start','stop','status')]
    [string]$Action  = 'deploy',

    [ValidateSet('docker','vercel','vps','shared','auto')]
    [string]$Target  = 'auto',

    [ValidateSet('dev','staging','prod')]
    [string]$Env     = 'prod',

    [ValidateSet('full','core','api','mobile')]
    [string]$DeployProfile = 'full',

    [switch]$SkipBuild,
    [switch]$NoBrowser,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'
$Root = $PSScriptRoot

# Fix mojibake/Unicode output in some Windows terminals
[console]::OutputEncoding = [System.Text.Encoding]::UTF8


# Keep window open on any unhandled error
trap {
    Write-Host ''
    Write-Host "  UNHANDLED ERROR: $_" -ForegroundColor Red
    Write-Host '  Press Enter to close this window...' -ForegroundColor Yellow
    $null = Read-Host '  > '
    exit 1
}
# -- Colour helpers ------------------------------------------------------------
function grn([string]$t){ Write-Host "  OK   $t" -ForegroundColor Green }
function red([string]$t){ Write-Host "  FAIL $t" -ForegroundColor Red }
function yel([string]$t){ Write-Host "  WARN $t" -ForegroundColor Yellow }
function cyn([string]$t){ Write-Host "  -->  $t" -ForegroundColor Cyan }
function dim([string]$t){ Write-Host "       $t" -ForegroundColor DarkGray }
function rule { Write-Host "  $('-'*70)" -ForegroundColor DarkGray }
function hdr([string]$t){
    Write-Host ''
    Write-Host "  $t" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ''
}
function step([string]$n,[string]$t){
    Write-Host ''
    Write-Host "  [$n] $t" -ForegroundColor Cyan
}
function dryRun([string]$cmd){
    if ($DryRun) { dim "DRY-RUN: $cmd"; return $true }
    return $false
}

# -- Port utilities -------------------------------------------------------------
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

# -- Banner --------------------------------------------------------------------
Clear-Host
$dryTag    = if ($DryRun)           { ' [DRY RUN]'  } else { '' }
$actionTag = $Action.ToUpper().PadRight(8)
Write-Host ''
Write-Host '  +==================================================================+' -ForegroundColor Cyan
Write-Host '  |     OneChoiceKitchen  -  Production Deployment Script v3.0      |' -ForegroundColor White
Write-Host "  |     Action : $($actionTag)  Target: $(($Target).ToUpper().PadRight(8))  Env: $(($Env).ToUpper().PadRight(8))$dryTag" -ForegroundColor Yellow
Write-Host "  |     Profile: $(($DeployProfile).ToUpper().PadRight(57))|" -ForegroundColor Yellow
Write-Host '  +==================================================================+' -ForegroundColor Cyan
Write-Host ''

# -- Service definitions -------------------------------------------------------
# Keys match setup.ps1 and setup_local.ps1 exactly - single source of truth
$Services = [ordered]@{
    'api'            = @{ Name='NestJS API';      Port=3000; Path='apps/api';                     NxName='api'            }
    'web'            = @{ Name='Web Portal';      Port=4208; Path='apps/web';                     NxName='web'            }
    'admin-portal'   = @{ Name='Admin Portal';    Port=4205; Path='apps/admin/admin-portal';      NxName='admin-portal'   }
    'partner-portal' = @{ Name='Partner Portal';  Port=4206; Path='apps/partner/partner-portal';  NxName='partner-portal' }
    'rider-portal'   = @{ Name='Rider Portal';    Port=4207; Path='apps/rider/rider-portal';      NxName='rider-portal'   }
    'customer-mobile'= @{ Name='Mobile';          Port=4210; Path='apps/customer-mobile';         NxName='customer-mobile'}
    'rider-mobile'   = @{ Name='Rider Mobile';    Port=4212; Path='apps/rider-mobile';            NxName='rider-mobile'   }
}

# Infrastructure services (Docker-managed, not built by Nx)
$InfraServices = @(
    @{ Name='PostgreSQL';    Port=5432; Url='localhost:5432'        }
    @{ Name='Redis';         Port=6379; Url='localhost:6379'        }
    @{ Name='MailDev SMTP';  Port=1025; Url='localhost:1025'        }
    @{ Name='MailDev UI';    Port=1080; Url='http://localhost:1080' }
    @{ Name='pgAdmin';       Port=5050; Url='http://localhost:5050' }
)

$Profiles = @{
    'full'   = @('api','web','admin-portal','partner-portal','rider-portal','customer-mobile','rider-mobile')
    'core'   = @('api','web','admin-portal')
    'api'    = @('api')
    'mobile' = @('api','customer-mobile','rider-mobile')
}
$activeServices = $Profiles[$DeployProfile]

# All ports managed by this script (for port-based stop fallback)
$AllPorts = @(3000, 4205, 4206, 4207, 4208, 4210, 4212, 5555, 9229)

# -- Interactive menu (shown when no -Action passed) --------------------------
if (-not $Action -or $Action -eq '') {
    Write-Host '  What would you like to do?' -ForegroundColor White
    Write-Host ''
    Write-Host '  [1]  Deploy   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(build + start all services on target)' -ForegroundColor DarkGray
    Write-Host '  [2]  Stop     ' -NoNewline -ForegroundColor Cyan
    Write-Host '(stop running services on target)' -ForegroundColor DarkGray
    Write-Host '  [3]  Status   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(show live port + container status)' -ForegroundColor DarkGray
    Write-Host ''

    $choice = ''
    while ($choice -notmatch '^[1-3]$') {
        $choice = Read-Host '  Enter choice [1-3]'
    }
    $Action = switch ($choice) { '1' { 'deploy' } '2' { 'stop' } '3' { 'status' } }

    if ($Target -eq 'auto') {
        Write-Host ''
        Write-Host '  Select deployment target:' -ForegroundColor White
        Write-Host '  [1] docker   [2] vercel   [3] vps   [4] shared' -ForegroundColor Cyan
        $tChoice = ''
        while ($tChoice -notmatch '^[1-4]$') {
            $tChoice = Read-Host '  Enter target [1-4]'
        }
        $Target = switch ($tChoice) { '1' { 'docker' } '2' { 'vercel' } '3' { 'vps' } '4' { 'shared' } }
    }

    Write-Host ''
    Write-Host "  You selected: $($Action.ToUpper()) on $($Target.ToUpper())" -ForegroundColor Yellow
    Write-Host ''
    $null = Read-Host '  Press Enter to continue (Ctrl+C to cancel)'
    Write-Host ''
}

# -- Super-admin check ---------------------------------------------------------
if ($Action -in @('deploy','start')) {
    hdr 'SUPER ADMIN AUTHENTICATION'
    rule

    $adminToken = $env:SUPER_ADMIN_TOKEN
    if (-not $adminToken) {
        yel 'SUPER_ADMIN_TOKEN not found in environment.'
        $adminToken = Read-Host '  Enter super-admin token (or press Enter to skip for local deploy)'
    }

    if ($adminToken) {
        grn "Super-admin authenticated."
    } else {
        yel "Proceeding without super-admin token - some operations may be restricted."
    }
}

# -- Auto-detect target --------------------------------------------------------
if ($Target -eq 'auto') {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $Target = 'docker'
        cyn "Auto-detected target: docker"
    } elseif (Get-Command vercel -ErrorAction SilentlyContinue) {
        $Target = 'vercel'
        cyn "Auto-detected target: vercel"
    } elseif (Get-Command pm2 -ErrorAction SilentlyContinue) {
        $Target = 'vps'
        cyn "Auto-detected target: vps (PM2 detected)"
    } else {
        if ($Action -eq 'status') {
            $Target = 'docker'   # status can work with just port checks
        } else {
            red "Cannot auto-detect deployment target. Specify -Target explicitly."
            exit 1
        }
    }
}

Write-Host ''
Write-Host "  Action : " -NoNewline
Write-Host $Action.ToUpper() -ForegroundColor Cyan -NoNewline
Write-Host "  |  Target: " -NoNewline
Write-Host $Target.ToUpper() -ForegroundColor Yellow -NoNewline
Write-Host "  |  Env: " -NoNewline
Write-Host $Env.ToUpper() -ForegroundColor Magenta -NoNewline
Write-Host "  |  Profile: " -NoNewline
Write-Host $DeployProfile.ToUpper() -ForegroundColor Cyan
Write-Host ''

# -----------------------------------------------------------------------------
# STOP ACTION
# -----------------------------------------------------------------------------
function Stop-Deployment {
    hdr "STOPPING SERVICES  ($($Target.ToUpper()) / $($Env.ToUpper()) / $($DeployProfile.ToUpper()))"
    rule

    # Kill standalone MailDev window if it exists (avoids killing Docker if MailDev is in Docker)
    if (-not $DryRun) {
        Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "OCK-MailDev" } | Stop-Process -Force -ErrorAction SilentlyContinue
    }

    switch ($Target) {
        'docker' {
            $composeFile = if ($Env -eq 'prod') { 'docker-compose.yml' } else { 'docker-compose.dev.yml' }
            cyn "Stopping Docker services using: $composeFile"
            if (-not $DryRun) {
                & docker compose -f "$Root\$composeFile" down
                if ($LASTEXITCODE -eq 0) { grn "Docker services stopped." }
                else { yel "docker compose down had warnings. Check docker ps manually." }
            } else {
                dim "DRY-RUN: docker compose -f $composeFile down"
            }
        }

        'vps' {
            $pm2Config = "$Root\infra\pm2\ecosystem.config.js"
            cyn "Stopping VPS services via PM2..."
            if (-not $DryRun) {
                if (Test-Path $pm2Config) {
                    & pm2 stop $pm2Config
                    grn "PM2 ecosystem stopped."
                } else {
                    yel "PM2 ecosystem.config.js not found. Stopping all PM2 processes..."
                    & pm2 stop all
                    grn "All PM2 processes stopped."
                }
            } else {
                dim "DRY-RUN: pm2 stop $pm2Config"
            }

            # Kill any remaining processes on known ports
            cyn "Cleaning up port bindings..."
            if (-not $DryRun) {
                $AllPorts | ForEach-Object { Clear-Port $_ }
                grn "Ports cleared."
            } else {
                dim "DRY-RUN: Kill processes on ports: $($AllPorts -join ', ')"
            }
        }

        'vercel' {
            cyn "Vercel: Production deployments do not stop - they are always live."
            yel "To rollback to a previous deployment, run:"
            dim "  vercel rollback --token `$env:VERCEL_TOKEN"
            yel "To remove a preview deployment:"
            dim "  vercel remove <deployment-url> --token `$env:VERCEL_TOKEN"
            cyn "Vercel project dashboard: https://vercel.com/dashboard"
        }

        'shared' {
            yel "Shared hosting: remove deployed files via FTP/SFTP or your hosting control panel."
            dim "No automated stop available for shared hosting targets."
        }

        default {
            yel "Unknown target '$Target'. Falling back to port-based cleanup..."
            if (-not $DryRun) {
                $AllPorts | ForEach-Object { Clear-Port $_ }
                grn "Ports cleared."
            }
        }
    }

    Write-Host ''
    grn "Stop complete. ($Target / $Env)"
    Write-Host ''
    dim "For local dev services, use: .\setup_local.ps1 stop"
    Write-Host ''
}

# -----------------------------------------------------------------------------
# STATUS ACTION
# -----------------------------------------------------------------------------
function Show-DeploymentStatus {
    Write-Host ''
    Write-Host '  +------------------------------------------------------------------+' -ForegroundColor Cyan
    Write-Host "  |  ONE CHOICE KITCHEN  --  Deployment Status                       |" -ForegroundColor White
    Write-Host "  |  Target: $($Target.ToUpper().PadRight(10))  Env: $($Env.ToUpper().PadRight(10))  Profile: $($DeployProfile.ToUpper().PadRight(10))|" -ForegroundColor Yellow
    Write-Host '  +-------------------------+-------+---------+------------------------+' -ForegroundColor Cyan
    Write-Host '  | Service                 | Port  | Status  | Path                   |' -ForegroundColor Cyan
    Write-Host '  +-------------------------+-------+---------+------------------------+' -ForegroundColor Cyan

    Write-Host '  |  --- Nx Application Services ---                                  |' -ForegroundColor DarkGray
    foreach ($svcName in $Services.Keys) {
        $svc    = $Services[$svcName]
        $inProf = $activeServices -contains $svcName
        $up     = Test-Port $svc.Port
        $status = if ($up) { 'RUNNING ' } else { 'STOPPED ' }
        $color  = if ($up) { 'Green'   } else { 'DarkGray' }
        $n      = $svc.Name.PadRight(25)
        $p      = "$($svc.Port) ".PadRight(5)
        $path   = $svc.Path.PadRight(24)
        $profMark = if ($inProf) { '' } else { ' [not in profile]' }

        Write-Host '  | ' -NoNewline -ForegroundColor Cyan
        Write-Host $n -NoNewline -ForegroundColor $(if ($up) { 'White' } else { 'DarkGray' })
        Write-Host "| $p | " -NoNewline -ForegroundColor Cyan
        Write-Host $status -NoNewline -ForegroundColor $color
        Write-Host "| $path |$profMark" -ForegroundColor Cyan
    }

    Write-Host '  +-------------------------+-------+---------+------------------------+' -ForegroundColor Cyan
    Write-Host '  |  --- Infrastructure ---                                            |' -ForegroundColor DarkGray
    foreach ($infra in $InfraServices) {
        $up     = Test-Port $infra.Port
        $status = if ($up) { 'RUNNING ' } else { 'STOPPED ' }
        $color  = if ($up) { 'Green'   } else { 'DarkGray' }
        $n      = $infra.Name.PadRight(25)
        $p      = "$($infra.Port) ".PadRight(5)
        $u      = $infra.Url.PadRight(24)

        Write-Host '  | ' -NoNewline -ForegroundColor DarkGray
        Write-Host $n -NoNewline -ForegroundColor $(if ($up) { 'White' } else { 'DarkGray' })
        Write-Host "| $p | " -NoNewline -ForegroundColor DarkGray
        Write-Host $status -NoNewline -ForegroundColor $color
        Write-Host "| $u |" -ForegroundColor DarkGray
    }
    Write-Host '  +-------------------------+-------+---------+------------------------+' -ForegroundColor Cyan
    Write-Host ''

    # Docker container status (if available)
    if ($Target -eq 'docker' -and (Get-Command docker -ErrorAction SilentlyContinue)) {
        $composeFile = if ($Env -eq 'prod') { 'docker-compose.yml' } else { 'docker-compose.dev.yml' }
        if (Test-Path "$Root\$composeFile") {
            hdr "Docker Container Status  ($composeFile)"
            rule
            & docker compose -f "$Root\$composeFile" ps
            Write-Host ''
        }
    }

    # PM2 process status (if available)
    if ($Target -eq 'vps' -and (Get-Command pm2 -ErrorAction SilentlyContinue)) {
        hdr "PM2 Process Status"
        rule
        & pm2 list
        Write-Host ''
    }

    # Tips
    $anyAppUp = $Services.Keys | Where-Object { Test-Port $Services[$_].Port } | Select-Object -First 1
    if (-not $anyAppUp) {
        yel "No application services are currently running."
        dim "To deploy: .\setup_deployment.ps1 -Action deploy -Target $Target"
        dim "For local dev: .\setup_local.ps1 start"
    }
    Write-Host ''
}

# -----------------------------------------------------------------------------
# DEPLOY / START ACTION
# -----------------------------------------------------------------------------
function Invoke-Deploy {

    # -- Load .env for the target environment ---------------------------------
    $envFile = ".env.$Env"
    if (-not (Test-Path $envFile)) { $envFile = '.env' }
    if (Test-Path $envFile) {
        cyn "Loading environment from $envFile"
        Get-Content $envFile | Where-Object { $_ -match '^\s*[^#].+=.+' } | ForEach-Object {
            $k,$v = $_ -split '=',2
            [System.Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process')
        }
        grn "Environment loaded."
    } else {
        yel "No $envFile found - ensure environment variables are set externally."
    }

    # -- Prerequisite validation -----------------------------------------------
    hdr 'PREREQUISITE VALIDATION'
    rule

    function Assert-Tool([string]$cmd,[string]$label='') {
        $l = if ($label) { $label } else { $cmd }
        if (Get-Command $cmd -ErrorAction SilentlyContinue) { grn "$l found" }
        else { red "$l NOT FOUND - install it and retry"; exit 1 }
    }

    function Assert-EnvVar([string]$var,[string]$desc='') {
        $d = if ($desc) { $desc } else { $var }
        $val = [System.Environment]::GetEnvironmentVariable($var,'Process')
        if ($val) { grn "$d set" }
        else { yel "$d NOT SET ($var) - some features may not work" }
    }

    function Update-Pnpm {
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            red "pnpm NOT FOUND - install it and retry"; exit 1 
        }
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

    switch ($Target) {
        'docker' {
            Assert-Tool 'docker'       'Docker Engine'
            Update-Pnpm
            Assert-EnvVar 'DATABASE_URL' 'Database URL'
            Assert-EnvVar 'REDIS_URL'    'Redis URL'
            Assert-EnvVar 'JWT_SECRET'   'JWT Secret'
        }
        'vercel' {
            Assert-Tool 'vercel' 'Vercel CLI'
            Update-Pnpm
            Assert-EnvVar 'VERCEL_TOKEN'  'Vercel Token'
            Assert-EnvVar 'DATABASE_URL'  'Database URL'
        }
        'vps' {
            Assert-Tool 'pm2'    'PM2 Process Manager'
            Update-Pnpm
            Assert-EnvVar 'DATABASE_URL' 'Database URL'
            Assert-EnvVar 'REDIS_URL'    'Redis URL'
        }
        'shared' {
            yel 'Shared hosting CANNOT run a NestJS API or PostgreSQL directly.'
            yel 'You can only deploy static frontend apps to shared hosting.'
            cyn 'Recommended: Use Vercel for frontends + Railway/Neon for DB.'
            dim 'Continuing with static build only...'
            $script:DeployProfile = 'web-only'
        }
    }

    # -- Build step ------------------------------------------------------------
    if (-not $SkipBuild) {
        hdr 'BUILD'
        rule

        $buildNxNames = ($activeServices | Where-Object { $Services.ContainsKey($_) } | ForEach-Object { $Services[$_].NxName }) -join ','

        cyn "Building profile '$DeployProfile': $buildNxNames"
        if (-not $DryRun) {
            & pnpm nx run-many -t build --projects=$buildNxNames --prod
            if ($LASTEXITCODE -ne 0) { red "Build failed!"; exit 1 }
            grn "Build complete."
        } else {
            dim "DRY-RUN: pnpm nx run-many -t build --projects=$buildNxNames --prod"
        }
    } else {
        yel "Skipping build (-SkipBuild). Using existing dist/ artifacts."
    }

    # -- Deploy per target -----------------------------------------------------
    hdr "DEPLOY - $($Target.ToUpper())"
    rule

    switch ($Target) {
        'docker' {
            $composeFile = if ($Env -eq 'prod') { 'docker-compose.yml' } else { 'docker-compose.dev.yml' }
            cyn "Using compose file: $composeFile"

            # Pull latest images
            step '1/5' 'Pulling latest base images...'
            if (-not $DryRun) { & docker compose -f "$Root\$composeFile" pull }
            else { dim "DRY-RUN: docker compose -f $composeFile pull" }

            # Run DB migrations
            step '2/5' 'Running Prisma migrations...'
            if (-not $DryRun) {
                & pnpm prisma migrate deploy
                if ($LASTEXITCODE -ne 0) { red "Migration failed!"; exit 1 }
                grn "Migrations applied."

                # Seed baseline production data (idempotent)
                if (Test-Path "$Root\prisma\seeds\seed_prod_data.ts") {
                    dim 'Seeding production baseline data...'
                    & pnpm exec ts-node --project tsconfig.json prisma/seeds/seed_prod_data.ts
                    if ($LASTEXITCODE -eq 0) { grn 'Production seed complete.' }
                    else { yel 'Prod seed warnings - verify admin account manually.' }
                }
            } else { dim "DRY-RUN: pnpm prisma migrate deploy + seed_prod_data" }

            # Start services
            step '3/5' 'Starting Docker services...'
            if (-not $DryRun) {
                & docker compose -f "$Root\$composeFile" up -d
                if ($LASTEXITCODE -ne 0) { red "Docker compose up failed!"; exit 1 }
                grn "Docker services started."
            } else { dim "DRY-RUN: docker compose -f $composeFile up -d" }

            # Health checks
            step '4/5' 'Waiting for services to be healthy...'
            $maxWait = 120; $waited = 0
            do {
                Start-Sleep -Seconds 5; $waited += 5
                $health = (& docker compose -f "$Root\$composeFile" ps --format json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue)
                $notUp  = $health | Where-Object { $_.State -ne 'running' }
                if (-not $notUp) { grn "All containers healthy ($waited s)"; break }
                dim "Waiting... ($waited/$maxWait s)"
            } while ($waited -lt $maxWait)

            # Status table
            step '5/5' 'Container status:'
            & docker compose -f "$Root\$composeFile" ps
        }

        'vercel' {
            $vercelEnvFlag  = if ($Env -eq 'prod') { '--prod' } else { '' }
            $vercelProjects = @('web','admin-portal','partner-portal','rider-portal') | Where-Object { $activeServices -contains $_ }

            step '1/3' 'Running Prisma migrations on remote DB...'
            if (-not $DryRun) {
                & pnpm prisma migrate deploy
                if ($LASTEXITCODE -ne 0) { red "Migration failed!"; exit 1 }
                grn "Migrations applied."
            } else { dim "DRY-RUN: pnpm prisma migrate deploy" }

            step '2/3' "Deploying frontends to Vercel ($Env)..."
            foreach ($proj in $vercelProjects) {
                $s = $Services[$proj]
                cyn "  Deploying $($s.Name) ($($s.Path))..."
                if (-not $DryRun) {
                    Push-Location "$Root\$($s.Path)"
                    & vercel $vercelEnvFlag --token $env:VERCEL_TOKEN
                    Pop-Location
                } else { dim "DRY-RUN: vercel deploy $($s.Path) $vercelEnvFlag" }
            }

            step '3/3' 'Note: NestJS API must be deployed separately (Railway, Render, or EC2).'
            yel 'Vercel does not support long-running Node.js servers - use Railway or Render for the API.'
            yel 'Mobile portals (customer-mobile, rider-mobile) should be deployed to Vercel or as PWA via their portal.'
        }

        'vps' {
            step '1/5' 'Running Prisma migrations...'
            if (-not $DryRun) {
                & pnpm prisma migrate deploy
                grn "Migrations applied."
            } else { dim "DRY-RUN: pnpm prisma migrate deploy" }

            step '2/5' 'Building frontend static exports...'
            if (-not $DryRun -and -not $SkipBuild) {
                $frontendProjects = ($activeServices | Where-Object { $_ -ne 'api' -and $Services.ContainsKey($_) } | ForEach-Object { $Services[$_].NxName }) -join ','
                if ($frontendProjects) {
                    & pnpm nx run-many -t export --projects=$frontendProjects --prod
                }
            }

            step '3/5' 'Restarting API with PM2...'
            $pm2Config = "$Root\infra\pm2\ecosystem.config.js"
            if (Test-Path $pm2Config) {
                if (-not $DryRun) { & pm2 reload $pm2Config --env $Env }
                else { dim "DRY-RUN: pm2 reload $pm2Config --env $Env" }
            } else {
                yel "$pm2Config not found - starting API manually"
                if (-not $DryRun) { & pm2 start "dist/apps/api/main.js" --name "ock-api" }
                else { dim "DRY-RUN: pm2 start dist/apps/api/main.js --name ock-api" }
            }
            grn "API restarted via PM2."

            step '4/5' 'Reloading NGINX...'
            if (-not $DryRun) {
                $nginxConf = "$Root\infra\nginx\ock.conf"
                if (Test-Path $nginxConf) {
                    & nginx -t -c $nginxConf
                }
                & nginx -s reload
                grn "NGINX reloaded."
            } else { dim "DRY-RUN: nginx -s reload" }

            step '5/5' 'PM2 status:'
            if (-not $DryRun) { & pm2 list }
        }

        'shared' {
            step '1/1' 'Building static web app only (shared hosting)...'
            if (-not $DryRun) { & pnpm nx build web --prod }
            grn "Static build in dist/apps/web/ - upload to your hosting provider."
            yel 'Note: API and database features will NOT work on shared hosting.'
            cyn 'Recommendation: Migrate to VPS (DigitalOcean $6/mo) or Vercel+Railway.'
        }
    }

    # -- Deployment summary ----------------------------------------------------
    Write-Host ''
    hdr 'DEPLOYMENT SUMMARY'
    rule
    Write-Host ''
    Write-Host ('  ' + 'SERVICE'.PadRight(25) + 'PATH'.PadRight(32) + 'PORT'.PadRight(8) + 'STATUS'.PadRight(12)) -ForegroundColor DarkGray
    Write-Host ('  ' + '-'*24 + '+' + '-'*31 + '+' + '-'*7 + '+' + '-'*11) -ForegroundColor DarkGray

    foreach ($svc in $activeServices) {
        if (-not $Services.ContainsKey($svc)) { continue }
        $s = $Services[$svc]
        $up          = if (-not $DryRun) { Test-Port $s.Port } else { $false }
        $statusColor = if ($DryRun) { 'DarkYellow' } elseif ($up) { 'Green' } else { 'Yellow' }
        $statusText  = if ($DryRun) { 'DRY-RUN' }  elseif ($up) { 'LIVE'   } else { 'STARTING' }

        Write-Host '  ' -NoNewline
        Write-Host $s.Name.PadRight(25) -NoNewline -ForegroundColor White
        Write-Host $s.Path.PadRight(32) -NoNewline -ForegroundColor DarkYellow
        Write-Host ":$($s.Port)".PadRight(8) -NoNewline -ForegroundColor Cyan
        Write-Host $statusText -ForegroundColor $statusColor
    }

    Write-Host ''
    rule

    # -- Open browsers ---------------------------------------------------------
    if (-not $NoBrowser -and -not $DryRun -and $Target -eq 'docker') {
        Start-Sleep -Seconds 3
        cyn 'Opening deployed service URLs...'

        $appUrls = @(
            @{ Url = 'http://localhost:4208'; Label = 'Web Portal'    }
            @{ Url = 'http://localhost:4205'; Label = 'Admin Portal'  }
            @{ Url = 'http://localhost:4206'; Label = 'Partner Portal'}
            @{ Url = 'http://localhost:4207'; Label = 'Rider Portal'  }
            @{ Url = 'http://localhost:3000/api/docs'; Label = 'API Docs' }
        )
        foreach ($entry in $appUrls) {
            $portStr = ($entry.Url -replace 'http://localhost:','').Split('/')[0]
            if ([int]::TryParse($portStr, [ref]$null) -and (Test-Port ([int]$portStr))) {
                dim "  Opening: $($entry.Url)  ($($entry.Label))"
                Start-Process $entry.Url
                Start-Sleep -Milliseconds 600
            }
        }

        # MailDev -- start as standalone process (maildev is a dev dependency)
        if (-not (Test-Port 1080)) {
            Clear-Port 1080
            Clear-Port 1025
            cyn '  Starting MailDev (email testing UI)...'
            $mdBin = "$Root\node_modules\.bin\maildev.CMD"
            Start-Process 'cmd.exe' `
                -ArgumentList "/k title OCK-MailDev && `"$mdBin`" --web 1080 --smtp 1025" `
                -WorkingDirectory $Root
            Start-Sleep -Seconds 5
        }
        dim '  Opening: http://localhost:1080  (MailDev -- Email Testing)'
        Start-Process 'http://localhost:1080'
        Start-Sleep -Milliseconds 600
    }

    Write-Host ''
    grn "Deployment complete! ($Target / $Env / $DeployProfile)$dryTag"
    if ($DryRun) { yel 'This was a DRY RUN - no changes were made.' }
    Write-Host ''
    dim "To stop:   .\setup_deployment.ps1 -Action stop -Target $Target"
    dim "To status: .\setup_deployment.ps1 -Action status -Target $Target"
    Write-Host ''
}

# -----------------------------------------------------------------------------
# DISPATCH
# -----------------------------------------------------------------------------

# -- Mode A: Non-interactive (when called from CI/scripts or with explicit params)
# Deployment script always has defaults so it runs non-interactively by default.
# Run once and exit -- unless invoked bare (no args) in which case show menu.
$invokedBare = ($PSBoundParameters.Count -eq 0)

if (-not $invokedBare) {
    switch ($Action) {
        { $_ -in @('deploy','start') } { Invoke-Deploy }
        'stop'                          { Stop-Deployment }
        'status'                        { Show-DeploymentStatus }
    }
    exit 0
}

# -- Mode B: Interactive menu loop (bare invocation, no args)
function Show-DeployMenu {
    Clear-Host
    Write-Host ''
    Write-Host '  +============================================================+' -ForegroundColor Cyan
    Write-Host '  |   ONE CHOICE KITCHEN  -  Deployment Orchestrator v3.0     |' -ForegroundColor White
    Write-Host '  +============================================================+' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  What would you like to do?' -ForegroundColor White
    Write-Host ''
    Write-Host '  -- DEPLOY -----------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [1]  Deploy to Docker   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(full -- builds all services in containers)' -ForegroundColor DarkGray
    Write-Host '  [2]  Deploy to Docker   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(core -- API + Web + Admin only)' -ForegroundColor DarkGray
    Write-Host '  [3]  Deploy to Vercel   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(staging -- Next.js frontends)' -ForegroundColor DarkGray
    Write-Host '  [4]  Deploy to Vercel   ' -NoNewline -ForegroundColor Cyan
    Write-Host '(prod -- Next.js frontends)' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '  -- STOP -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [5]  Stop Docker services' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  -- INFO -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [6]  Show deployment status' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  -- EXIT -------------------------------------------------------------------' -ForegroundColor DarkGray
    Write-Host '  [0]  Exit orchestrator' -ForegroundColor DarkGray
    Write-Host ''

    $choice = ''
    while ($choice -notmatch '^[0-6]$') {
        $choice = Read-Host '  Enter choice [0-6]'
    }
    return $choice
}

do {
    $menuChoice = Show-DeployMenu

    switch ($menuChoice) {
        '1' { $Action = 'deploy'; $Target = 'docker';  $DeployProfile = 'full';  $Env = 'prod';    Invoke-Deploy }
        '2' { $Action = 'deploy'; $Target = 'docker';  $DeployProfile = 'core';  $Env = 'prod';    Invoke-Deploy }
        '3' { $Action = 'deploy'; $Target = 'vercel';  $DeployProfile = 'full';  $Env = 'staging'; Invoke-Deploy }
        '4' { $Action = 'deploy'; $Target = 'vercel';  $DeployProfile = 'full';  $Env = 'prod';    Invoke-Deploy }
        '5' { $Action = 'stop';   $Target = 'docker';  Stop-Deployment }
        '6' { $Action = 'status'; Show-DeploymentStatus }
        '0' { break }
    }

    if ($menuChoice -ne '0') {
        Write-Host ''
        Write-Host '  ============================================================' -ForegroundColor DarkGray
        Write-Host '  Task complete. Press Enter to return to main menu...' -ForegroundColor Cyan
        Write-Host '  (Press Ctrl+C at any time to close this window)' -ForegroundColor DarkGray
        Write-Host '  ============================================================' -ForegroundColor DarkGray
        $null = Read-Host '  > '
    }
} while ($menuChoice -ne '0')

Write-Host ''
Write-Host '  Goodbye! Deployment orchestrator closed.' -ForegroundColor Cyan
Write-Host ''

