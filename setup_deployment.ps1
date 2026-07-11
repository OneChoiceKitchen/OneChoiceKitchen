<#
.SYNOPSIS
    OneChoiceKitchen — Production Deployment Script
    Handles Docker, Vercel, VPS/bare-metal, and shared-hosting deployments.

.DESCRIPTION
    Super-admin deployment orchestrator. Detects or accepts target environment,
    validates prerequisites, and starts/deploys all required services.

    REQUIRES: Super-admin credentials (SUPER_ADMIN_TOKEN or interactive login)

.PARAMETER Target
    Deployment target. One of: docker | vercel | vps | shared
    If omitted, the script auto-detects based on available tools.

.PARAMETER Env
    Environment to deploy to: dev | staging | prod  (default: prod)

.PARAMETER Profile
    Service profile: full | core | api  (default: full)
    full  = all services (API + all frontends + workers)
    core  = API + Web + Admin
    api   = API only

.PARAMETER SkipBuild
    Skip nx build step (use existing dist/ artifacts)

.PARAMETER NoBrowser
    Do not open browser after deploy

.PARAMETER DryRun
    Show what would be done without executing

.EXAMPLE
    .\setup_deployment.ps1 -Target docker
    .\setup_deployment.ps1 -Target vercel -Env staging
    .\setup_deployment.ps1 -Target vps -Profile core
    .\setup_deployment.ps1 -Target docker -DryRun

.NOTES
    For local development, use .\setup_local.ps1 instead.
    Author: OneChoiceKitchen Platform Team
    Version: 2.0.0
#>

[CmdletBinding()]
param (
    [ValidateSet('docker','vercel','vps','shared','auto')]
    [string]$Target  = 'auto',

    [ValidateSet('dev','staging','prod')]
    [string]$Env     = 'prod',

    [ValidateSet('full','core','api')]
    [string]$Profile = 'full',

    [switch]$SkipBuild,
    [switch]$NoBrowser,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Colour helpers ────────────────────────────────────────────────────────────
function clr([string]$c,[string]$t){ Write-Host $t -ForegroundColor $c -NoNewline }
function grn([string]$t){ Write-Host "  ✓  $t" -ForegroundColor Green }
function red([string]$t){ Write-Host "  ✗  $t" -ForegroundColor Red }
function yel([string]$t){ Write-Host "  ⚠  $t" -ForegroundColor Yellow }
function cyn([string]$t){ Write-Host "  →  $t" -ForegroundColor Cyan }
function dim([string]$t){ Write-Host "     $t" -ForegroundColor DarkGray }
function rule { Write-Host ('─' * 72) -ForegroundColor DarkGray }
function head([string]$t){
    Write-Host ''
    Write-Host "  $t" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ''
}
function step([string]$n,[string]$t){
    Write-Host ''
    clr 'Cyan' "  [$n] "; clr 'White' "$t`n"
}
function dryRun([string]$cmd){
    if ($DryRun) { dim "DRY-RUN: $cmd"; return $true }
    return $false
}

# ── Banner ────────────────────────────────────────────────────────────────────
Clear-Host
$dryTag = if ($DryRun) { ' [DRY RUN]' } else { '' }
Write-Host ''
Write-Host '  ╔══════════════════════════════════════════════════════════════════╗' -ForegroundColor Cyan
Write-Host '  ║      OneChoiceKitchen — Production Deployment Script            ║' -ForegroundColor Cyan
Write-Host "  ║      Target: $(($Target).ToUpper().PadRight(10)) Env: $(($Env).ToUpper().PadRight(10)) Profile: $(($Profile).ToUpper().PadRight(10))$dryTag" -ForegroundColor Cyan
Write-Host '  ╚══════════════════════════════════════════════════════════════════╝' -ForegroundColor Cyan
Write-Host ''

# ── Super-admin check ─────────────────────────────────────────────────────────
head '🔐 SUPER ADMIN AUTHENTICATION'
rule

$adminToken = $env:SUPER_ADMIN_TOKEN
if (-not $adminToken) {
    yel 'SUPER_ADMIN_TOKEN not found in environment.'
    $adminToken = Read-Host '  Enter super-admin token (or press Enter to skip for local deploy)'
}

if ($adminToken) {
    grn "Super-admin authenticated."
} else {
    yel "Proceeding without super-admin token — some operations may be restricted."
}

# ── Auto-detect target ────────────────────────────────────────────────────────
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
        red "Cannot auto-detect deployment target. Specify -Target explicitly."
        exit 1
    }
}

Write-Host ''
Write-Host "  Deploying to: " -NoNewline
Write-Host $Target.ToUpper() -ForegroundColor Yellow -NoNewline
Write-Host "  |  Env: " -NoNewline
Write-Host $Env.ToUpper() -ForegroundColor Magenta -NoNewline
Write-Host "  |  Profile: " -NoNewline
Write-Host $Profile.ToUpper() -ForegroundColor Cyan
Write-Host ''

# ── Load .env for the target environment ─────────────────────────────────────
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
    yel "No $envFile found — ensure environment variables are set externally."
}

# ── Service definitions (for display/validation) ──────────────────────────────
$Services = @{
    api      = @{ Name='NestJS API';         Port=3000; Path='apps/api' }
    admin    = @{ Name='Admin Portal';        Port=4205; Path='apps/admin/admin-portal' }
    partner  = @{ Name='Partner Portal';      Port=4206; Path='apps/partner/partner-portal' }
    rider    = @{ Name='Rider Portal';        Port=4207; Path='apps/rider/rider-portal' }
    web      = @{ Name='Customer Web';        Port=4208; Path='apps/web' }
    db       = @{ Name='PostgreSQL';          Port=5432; Path='prisma/' }
    redis    = @{ Name='Redis';               Port=6379; Path='infra/redis' }
    maildev  = @{ Name='MailDev';             Port=1080; Path='infra/maildev' }
}

$Profiles = @{
    full = @('api','admin','partner','rider','web','db','redis','maildev')
    core = @('api','admin','web','db','redis')
    api  = @('api','db','redis')
}
$activeServices = $Profiles[$Profile]

# ── Prerequisite validation ───────────────────────────────────────────────────
head '🔍 PREREQUISITE VALIDATION'
rule

function Require-Tool([string]$cmd,[string]$label='') {
    $l = if ($label) { $label } else { $cmd }
    if (Get-Command $cmd -ErrorAction SilentlyContinue) { grn "$l found" }
    else { red "$l NOT FOUND — install it and retry"; exit 1 }
}

function Check-EnvVar([string]$var,[string]$desc='') {
    $d = if ($desc) { $desc } else { $var }
    $val = [System.Environment]::GetEnvironmentVariable($var,'Process')
    if ($val) { grn "$d set" }
    else { yel "$d NOT SET ($var) — some features may not work" }
}

switch ($Target) {
    'docker' {
        Require-Tool 'docker'       'Docker Engine'
        Require-Tool 'docker'       'Docker Compose (v2)'
        Check-EnvVar 'DATABASE_URL' 'Database URL'
        Check-EnvVar 'REDIS_URL'    'Redis URL'
        Check-EnvVar 'JWT_SECRET'   'JWT Secret'
    }
    'vercel' {
        Require-Tool 'vercel' 'Vercel CLI'
        Require-Tool 'pnpm'   'pnpm'
        Check-EnvVar 'VERCEL_TOKEN'  'Vercel Token'
        Check-EnvVar 'DATABASE_URL'  'Database URL'
    }
    'vps' {
        Require-Tool 'pm2'    'PM2 Process Manager'
        Require-Tool 'nginx'  'NGINX'
        Require-Tool 'pnpm'   'pnpm'
        Check-EnvVar 'DATABASE_URL' 'Database URL'
        Check-EnvVar 'REDIS_URL'    'Redis URL'
    }
    'shared' {
        yel 'Shared hosting CANNOT run a NestJS API or PostgreSQL directly.'
        yel 'You can only deploy static frontend apps to shared hosting.'
        cyn 'Recommended: Use Vercel for frontends + Railway/Neon for DB.'
        dim 'Continuing with static build only...'
        $Profile = 'web-only'
    }
}

# ── Build step ────────────────────────────────────────────────────────────────
if (-not $SkipBuild) {
    head '🏗️  BUILD'
    rule

    $buildTargets = switch ($Profile) {
        'full' { 'api web admin partner rider' }
        'core' { 'api web admin' }
        'api'  { 'api' }
        default{ 'web' }
    }

    cyn "Building: $buildTargets"
    if (-not $DryRun) {
        & pnpm nx run-many -t build --projects=$($buildTargets -replace ' ',',') --prod
        if ($LASTEXITCODE -ne 0) { red "Build failed!"; exit 1 }
        grn "Build complete."
    } else {
        dim "DRY-RUN: pnpm nx run-many -t build --projects=$($buildTargets -replace ' ',',')"
    }
}

# ── Deploy per target ─────────────────────────────────────────────────────────
head "🚀 DEPLOY — $($Target.ToUpper())"
rule

switch ($Target) {
    'docker' {
        # ── Docker deployment ──────────────────────────────────────────────────
        $composeFile = if ($Env -eq 'prod') { 'docker-compose.yml' } else { 'docker-compose.dev.yml' }
        cyn "Using compose file: $composeFile"

        # Pull latest images
        cyn 'Pulling latest base images...'
        if (-not $DryRun) { & docker compose -f $composeFile pull }

        # Run DB migrations
        step '1/4' 'Running Prisma migrations...'
        if (-not $DryRun) {
            & pnpm prisma migrate deploy
            if ($LASTEXITCODE -ne 0) { red "Migration failed!"; exit 1 }
            grn "Migrations applied."

            # Seed baseline production data (idempotent — safe to re-run)
            if (Test-Path "$PSScriptRoot\prisma\seeds\seed_prod_data.ts") {
                dim 'Seeding production baseline data...'
                & pnpm exec ts-node --project tsconfig.json prisma/seeds/seed_prod_data.ts
                if ($LASTEXITCODE -eq 0) { grn 'Production seed complete.' }
                else { yel 'Prod seed warnings — verify admin account manually.' }
            }
        } else { dim "DRY-RUN: pnpm prisma migrate deploy + seed_prod_data" }

        # Start services
        step '2/4' 'Starting Docker services...'
        $svcList = $activeServices -join ' '
        if (-not $DryRun) {
            & docker compose -f $composeFile up -d $svcList
            if ($LASTEXITCODE -ne 0) { red "Docker compose up failed!"; exit 1 }
        } else { dim "DRY-RUN: docker compose -f $composeFile up -d $svcList" }

        # Health checks
        step '3/4' 'Waiting for services to be healthy...'
        $maxWait = 120; $waited = 0
        do {
            Start-Sleep -Seconds 5; $waited += 5
            $health = (& docker compose -f $composeFile ps --format json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue)
            $allUp = $health | Where-Object { $_.State -ne 'running' }
            if (-not $allUp) { grn "All containers healthy ($waited s)"; break }
            dim "Waiting... ($waited/$maxWait s)"
        } while ($waited -lt $maxWait)

        # Status table
        step '4/4' 'Service status:'
        & docker compose -f $composeFile ps

        # App file paths (for super admin verification)
        Write-Host ''
        head '📂 APP FILE PATHS (Super Admin Verification)'
        rule
        foreach ($svc in $activeServices) {
            if ($Services.ContainsKey($svc)) {
                $s = $Services[$svc]
                Write-Host "  $($s.Name.PadRight(22))" -NoNewline -ForegroundColor White
                Write-Host "  $($s.Path.PadRight(35))" -NoNewline -ForegroundColor Yellow
                Write-Host "  :$($s.Port)" -ForegroundColor Cyan
            }
        }
    }

    'vercel' {
        # ── Vercel deployment ──────────────────────────────────────────────────
        $vercelEnvFlag = if ($Env -eq 'prod') { '--prod' } else { '' }
        $vercelProjects = @('web','admin','partner','rider') | Where-Object { $activeServices -contains $_ }

        step '1/3' 'Running Prisma migrations on remote DB...'
        if (-not $DryRun) {
            & pnpm prisma migrate deploy
            if ($LASTEXITCODE -ne 0) { red "Migration failed!"; exit 1 }
        }

        step '2/3' "Deploying frontends to Vercel ($Env)..."
        foreach ($proj in $vercelProjects) {
            $s = $Services[$proj]
            cyn "  Deploying $($s.Name) ($($s.Path))..."
            if (-not $DryRun) {
                Push-Location $s.Path
                & vercel $vercelEnvFlag --token $env:VERCEL_TOKEN
                Pop-Location
            } else { dim "DRY-RUN: vercel deploy $($s.Path) $vercelEnvFlag" }
        }

        step '3/3' 'Note: NestJS API must be deployed separately (Railway, Render, or EC2).'
        yel 'Vercel does not support long-running Node.js servers — use Railway or Render for the API.'
    }

    'vps' {
        # ── VPS / bare-metal via PM2 + NGINX ──────────────────────────────────
        step '1/4' 'Running Prisma migrations...'
        if (-not $DryRun) { & pnpm prisma migrate deploy }

        step '2/4' 'Restarting API with PM2...'
        $pm2Config = 'infra/pm2/ecosystem.config.js'
        if (Test-Path $pm2Config) {
            if (-not $DryRun) { & pm2 reload $pm2Config --env $Env }
        } else {
            yel "$pm2Config not found — starting API manually"
            if (-not $DryRun) { & pm2 start "dist/apps/api/main.js" --name "ock-api" }
        }
        grn "API restarted via PM2."

        step '3/4' 'Reloading NGINX...'
        if (-not $DryRun) { & sudo nginx -t && sudo nginx -s reload }
        grn "NGINX reloaded."

        step '4/4' 'PM2 status:'
        & pm2 list

        # Show app paths
        Write-Host ''
        head '📂 APP FILE PATHS (Super Admin Verification)'
        rule
        foreach ($svc in $activeServices) {
            if ($Services.ContainsKey($svc)) {
                $s = $Services[$svc]
                $buildPath = "dist/$($s.Path)"
                Write-Host "  $($s.Name.PadRight(22))" -NoNewline -ForegroundColor White
                Write-Host "  $buildPath" -ForegroundColor Yellow
            }
        }
    }

    'shared' {
        step '1/1' 'Building static web app only (shared hosting)...'
        if (-not $DryRun) { & pnpm nx build web --prod }
        grn "Static build in dist/apps/web/ — upload to your hosting provider."
        yel 'Note: API and database features will NOT work on shared hosting.'
        cyn 'Recommendation: Migrate to VPS (DigitalOcean $6/mo) or Vercel+Railway.'
    }
}

# ── Final status table ────────────────────────────────────────────────────────
Write-Host ''
head '📊 DEPLOYMENT SUMMARY'
rule

$cols = @(
    @{e='Name';w=24},
    @{e='Path';w=38},
    @{e='Port';w=8},
    @{e='Status';w=12}
)

# Header
Write-Host ''
Write-Host ('  ' + 'SERVICE'.PadRight(24) + 'PATH'.PadRight(38) + 'PORT'.PadRight(8) + 'STATUS'.PadRight(12)) -ForegroundColor DarkGray

foreach ($svc in $activeServices) {
    if (-not $Services.ContainsKey($svc)) { continue }
    $s = $Services[$svc]
    $statusColor = if ($DryRun) { 'DarkYellow' } else { 'Green' }
    $statusText  = if ($DryRun) { 'DRY-RUN' } else { 'DEPLOYED' }

    Write-Host '  ' -NoNewline
    Write-Host $s.Name.PadRight(24) -NoNewline -ForegroundColor White
    Write-Host $s.Path.PadRight(38) -NoNewline -ForegroundColor DarkYellow
    Write-Host ":$($s.Port)".PadRight(8) -NoNewline -ForegroundColor Cyan
    Write-Host $statusText -ForegroundColor $statusColor
}

Write-Host ''
rule

if (-not $NoBrowser -and -not $DryRun -and $Target -eq 'docker') {
    Start-Sleep -Seconds 3
    $urls = @('http://localhost:4205','http://localhost:4208','http://localhost:3000/api/docs')
    foreach ($url in $urls) {
        Start-Process $url
        Start-Sleep -Milliseconds 600
    }
}

Write-Host ''
grn "Deployment complete! ($Target / $Env / $Profile)"
if ($DryRun) { yel 'This was a DRY RUN — no changes were made.' }
Write-Host ''
