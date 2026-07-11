Add-Type -AssemblyName System.Drawing

$sourcePath = "$PSScriptRoot\apps\web\public\branding\logo-icon.png"
if (-Not (Test-Path $sourcePath)) {
    Write-Host "Source image not found!"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
$bmp = New-Object System.Drawing.Bitmap($img)
$img.Dispose()

# Make pure white transparent
$bmp.MakeTransparent([System.Drawing.Color]::White)

$targets = @(
    "$PSScriptRoot\apps\web\public\favicon.png",
    "$PSScriptRoot\apps\web\public\favicon.ico",
    "$PSScriptRoot\apps\admin-portal\public\favicon.png",
    "$PSScriptRoot\apps\admin-portal\public\favicon.ico",
    "$PSScriptRoot\apps\partner-portal\public\favicon.png",
    "$PSScriptRoot\apps\partner-portal\public\favicon.ico",
    "$PSScriptRoot\apps\rider-portal\public\favicon.png",
    "$PSScriptRoot\apps\rider-portal\public\favicon.ico",
    "$PSScriptRoot\apps\api\public\favicon.png",
    "$PSScriptRoot\apps\api\public\favicon.ico",
    "$PSScriptRoot\apps\public\favicon.png",
    "$PSScriptRoot\apps\public\favicon.ico"
)

foreach ($target in $targets) {
    $dir = Split-Path $target
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    if ($target.EndsWith(".ico")) {
        $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Icon)
    } else {
        $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    Write-Host "Saved to $target"
}

$bmp.Dispose()
Write-Host "Done!"
