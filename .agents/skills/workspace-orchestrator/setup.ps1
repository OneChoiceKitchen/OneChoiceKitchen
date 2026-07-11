param (
    [string]$ActionArg = "",
    [string]$Profile = "all"
)

# setup.ps1 – script to start/stop all Nx services

# Path to store PIDs of started processes
$pidFile = "$PSScriptRoot\service_pids.txt"

function Kill-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($conn) {
        foreach ($c in $conn) {
            try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
        }
        Write-Host "  Freed port $Port"
    }
}

function Start-Services {
    Write-Host "Stopping any running services first..."
    Stop-Services

    Write-Host "Killing any stale processes on service ports..."
    @(3000, 4205, 4206, 4207, 4208, 4210, 4211, 4212, 1025, 1080, 9229) | ForEach-Object { Kill-Port -Port $_ }

    Write-Host "Resetting Nx cache to ensure fresh builds..."
    npx nx reset

    Write-Host "Generating Prisma client..."
    pnpm prisma generate

    Write-Host "Starting services..."
    # Prevent Nx from hanging on interactive prompts in background processes
    $env:NX_REJECT_DYNAMIC_QUESTIONS = "true"
    $env:CI = "true"
    $env:NODE_OPTIONS = "--no-warnings --max-old-space-size=4096"
    $env:NX_ISOLATE_PLUGINS = "false"
    $env:NX_DAEMON = "false"
    $env:NEXT_TELEMETRY_DISABLED = "1"

    if ($Profile -eq "core") {
        $frontendServices = @("web")
        Write-Host "Running CORE profile (Web + API only) to save CPU."
    } elseif ($Profile -eq "mobile") {
        $frontendServices = @("customer-mobile", "rider-mobile", "mobile-app")
        Write-Host "Running MOBILE profile (API + Mobile Apps)."
    } else {
        $frontendServices = @("web", "admin-portal", "partner-portal", "rider-portal", "customer-mobile", "rider-mobile", "mobile-app")
        Write-Host "Running ALL profile (Heavy CPU usage - Portals + Mobile Apps)."
    }
    
    $pids = @()
    
    Write-Host "Starting Backend API first..."
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/k title api & pnpm nx serve api" -PassThru
    $pids += $process.Id
    Write-Host "Started api (PID=$($process.Id))"

    function Wait-Port {
        param([int]$Port, [int]$Timeout = 120)
        $timer = [Diagnostics.Stopwatch]::StartNew()
        while ($timer.Elapsed.TotalSeconds -lt $Timeout) {
            try {
                $tcp = New-Object System.Net.Sockets.TcpClient
                $tcp.Connect("127.0.0.1", $Port)
                $tcp.Close()
                return $true
            } catch {
                Start-Sleep -Seconds 2
            }
        }
        return $false
    }

    Write-Host "Waiting for Backend API to be ready on port 3000 before starting frontends..."
    Wait-Port -Port 3000 | Out-Null
    Write-Host "Backend API is ready!"

    Write-Host "Starting frontend services..."
    foreach ($app in $frontendServices) {
        $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/k title $app & pnpm nx serve $app" -PassThru
        $pids += $process.Id
        Write-Host "Started $app (PID=$($process.Id))"
        Start-Sleep -Seconds 2
    }

    Write-Host "Starting Mailcatcher (Maildev) on ports 1025/1080..."
    $maildevProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k title maildev & npx maildev" -PassThru
    $pids += $maildevProcess.Id
    Write-Host "Started Mailcatcher (PID=$($maildevProcess.Id))"

    # Save PIDs for later stop
    $pids | Out-File -FilePath $pidFile -Encoding ascii
    Write-Host "All services started successfully! Waiting for frontends to be ready..."

    if ($frontendServices -contains "web") {
        Write-Host "Waiting for Web App (port 4208)..."
        Wait-Port -Port 4208 | Out-Null
    }

    if ($Profile -eq "all" -or $Profile -eq "standard") {
        Write-Host "Waiting for Admin Portal (port 4205)..."
        Wait-Port -Port 4205 | Out-Null
        Write-Host "Waiting for Partner Portal (port 4206)..."
        Wait-Port -Port 4206 | Out-Null
        Write-Host "Waiting for Rider Portal (port 4207)..."
        Wait-Port -Port 4207 | Out-Null
    }

    if ($Profile -eq "all" -or $Profile -eq "mobile") {
        Write-Host "Waiting for Customer Mobile (port 4210)..."
        Wait-Port -Port 4210 | Out-Null
        Write-Host "Waiting for Mobile App (port 4211)..."
        Wait-Port -Port 4211 | Out-Null
        Write-Host "Waiting for Rider Mobile (port 4212)..."
        Wait-Port -Port 4212 | Out-Null
    }

    Write-Host "Launching services in the default browser..."
    Start-Process "http://localhost:3000/api" # Backend API
    Start-Process "http://localhost:3000/api/health" # Backend Health Check
    Start-Process "http://localhost:3000/api/docs" # Backend API Docs
    
    if ($Profile -eq "core" -or $Profile -eq "all") {
        Start-Process "http://localhost:4208" # Web App
    }
    
    if ($Profile -eq "all" -or $Profile -eq "standard") {
        Start-Process "http://localhost:4205" # Admin Portal
        Start-Process "http://localhost:4206" # Partner Portal
        Start-Process "http://localhost:4207" # Rider Portal
    }

    if ($Profile -eq "all" -or $Profile -eq "mobile") {
        Start-Process "http://localhost:4210" # Customer Mobile
        Start-Process "http://localhost:4211" # Mobile App
        Start-Process "http://localhost:4212" # Rider Mobile
    }
    Start-Process "http://localhost:1080" # Mailcatcher/Maildev Live Emails
}

function Stop-Services {
    if (Test-Path $pidFile) {
        $pids = Get-Content $pidFile
        foreach ($processId in $pids) {
            try {
                $cmd = "taskkill /F /T /PID $processId"
                Invoke-Expression $cmd 2>$null | Out-Null
            } catch { }
        }
        Remove-Item $pidFile -Force
    }
    # Also kill any orphaned node processes on our ports
    @(3000, 4205, 4206, 4207, 4208, 4210, 4211, 4212, 1025, 1080) | ForEach-Object {
        $conn = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        if ($conn) { foreach ($c in $conn) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} } }
    }
    Write-Host "Cleanup complete."
}

if ($ActionArg -eq "") {
    $ActionArg = "start"
}

if ($ActionArg.Trim().ToLower() -eq 'start') {
    Start-Services
} elseif ($ActionArg.Trim().ToLower() -eq 'stop') {
    Stop-Services
} else {
    Write-Error "Invalid input. Please run the script again and type exactly 'start' or 'stop'."
}

