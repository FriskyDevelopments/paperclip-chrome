# Build + stage "FR!sky Paperclip Desk" on a Windows machine (paperclip-win).
# Mirrors macos/build-app.sh: copies the desk UI at build time, never checks it in.
#
# PREREQUISITES (run once per machine):
#   1. .NET 8 SDK:            winget install Microsoft.DotNet.SDK.8
#   2. VS 2022 + workload:    winget install Microsoft.VisualStudio.2022.Community --override "--add Microsoft.VisualStudio.Workload.ManagedDesktop --add Microsoft.VisualStudio.Workload.Universal --add Microsoft.VisualStudio.Component.WindowsAppSDK.Cpp --includeRecommended --passive"
#      (the Windows App SDK / WinUI workload; Community is free for this use)
#   3. WebView2 Runtime: ships with Windows 11 + current Edge. On Server 2022
#      install the Evergreen Standalone: https://developer.microsoft.com/microsoft-edge/webview2/
#   4. A checkout of this repo (e.g. C:\src\paperclip-chrome).
#
# DESK UI SOURCE (same SPA the macOS app bundles):
#   $env:PAPERCLIP_PROD override, else "$env:USERPROFILE\frisky-paperclip-prod".
#   Must contain index.html + assets\ + icons\. Copy the prod folder to the
#   Windows machine (USB / RDP drive redirect / private zip — never commit it).
#
# USAGE (from this directory):
#   powershell -ExecutionPolicy Bypass -File .\build-windows.ps1            # Debug build
#   powershell -ExecutionPolicy Bypass -File .\build-windows.ps1 -Config Release  # Release build
#
# MSIX / STORE (NOT scripted — needs the Partner Center identity):
#   Do NOT attempt headless MSIX signing here. The Store-associated Publisher ID
#   + signing identity only exist after the Partner Center app record is created
#   (see store/msstore-submission.md). Package from Visual Studio instead:
#     1. Open windows\PaperclipDesk\PaperclipDesk.csproj in VS 2022.
#     2. Right-click project > "Package and Publish" > "Associate App with the Store…"
#        (sign in with the LLC Partner Center account, pick the reserved
#        "FR!sky Paperclip Desk" app record).
#     3. Right-click project > Publish > "Create App Packages…" > Sideloading OFF,
#        Microsoft Store target > Release / x64 (+ x86/ARM64 as needed).
#     4. Upload the generated .msixupload to Partner Center (Packages page).
[CmdletBinding()]
param(
    [ValidateSet('Debug', 'Release')]
    [string]$Config = 'Debug'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = Split-Path -Parent $Root
$Proj = Join-Path $Root 'PaperclipDesk'
$Prod = if ($env:PAPERCLIP_PROD) { $env:PAPERCLIP_PROD } else { Join-Path $env:USERPROFILE 'frisky-paperclip-prod' }
$WebDest = Join-Path $Proj 'Assets\web'

function Step($msg) { Write-Host "`n== $msg ==" -ForegroundColor Cyan }

Step 'Inputs'
Write-Host "  config:   $Config"
Write-Host "  project:  $Proj"
Write-Host "  web src:  $Prod"
foreach ($f in @("$Prod\index.html", "$Prod\assets", "$Repo\..\extension\icons\mark.svg")) { }
if (-not (Test-Path "$Prod\index.html")) { throw "MISSING: $Prod\index.html (set `$env:PAPERCLIP_PROD or copy the prod folder)" }
if (-not (Test-Path "$Prod\assets")) { throw "MISSING: $Prod\assets" }
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { throw 'dotnet not found — install the .NET 8 SDK (see header)' }

Step 'Stage desk UI -> Assets\web (clean rebuild)'
if (Test-Path $WebDest) { Remove-Item -Recurse -Force $WebDest }
New-Item -ItemType Directory -Force -Path $WebDest | Out-Null
Copy-Item "$Prod\index.html" $WebDest
Copy-Item "$Prod\assets" "$WebDest\assets" -Recurse
if (Test-Path "$Prod\icons") { Copy-Item "$Prod\icons" "$WebDest\icons" -Recurse }
Get-ChildItem $WebDest -Recurse -File | ForEach-Object { Write-Host "  $($_.FullName.Substring($WebDest.Length + 1))" }

Step "dotnet build -c $Config"
& dotnet build (Join-Path $Proj 'PaperclipDesk.csproj') -c $Config
if ($LASTEXITCODE -ne 0) { throw "dotnet build failed ($LASTEXITCODE)" }

Write-Host "`nOK — run: dotnet run --project $Proj -c $Config" -ForegroundColor Green
Write-Host 'MSIX for Store upload goes through the VS "Package and Publish" flow (see header).'
