<#
.SYNOPSIS
  One-line sideload installer for FR!sky Paperclip Desk (no Store needed).

.USAGE (run on Windows 10 build 19041+):
  irm https://raw.githubusercontent.com/FriskyDevelopments/paperclip-chrome/main/windows/install.ps1 | iex

  With an explicit package (self-signed CI builds, prereleases) save first —
  parameters cannot be passed through the | iex one-liner:
  irm https://raw.githubusercontent.com/FriskyDevelopments/paperclip-chrome/main/windows/install.ps1 -OutFile install.ps1
  powershell -ExecutionPolicy Bypass -File .\install.ps1 -PackageUrl <url> [-CertUrl <url-to-cer>]

.PARAMETER PackageUrl
  Direct URL to PaperclipDesk.msix. Default: the latest GitHub release asset
  matching PaperclipDesk.msix via the redirect
  https://github.com/FriskyDevelopments/paperclip-chrome/releases/latest/download/PaperclipDesk.msix
  That asset only exists after the first signed MSIX is published — until then
  this script FAILS LOUD and tells you exactly that (see windows/winget/README.md).

.PARAMETER CertUrl
  Optional URL of the .cer to trust in LocalMachine\TrustedPeople. Only needed
  for SELF-SIGNED sideload packages. Store-signed MSIX needs no cert step.

.NOTES
  Review-safe plain text: no obfuscation, every step prints what it is doing.
  The | iex one-liner runs the downloaded script as-is; nothing else remote
  is fetched or executed besides the -PackageUrl MSIX (+ -CertUrl cert).
  Requires Windows 10 19041+
  (Add-AppxPackage + the packaged app's own floor is 17763; the installer
  demands 19041 so WebView2 Evergreen + modern App Installer are present).
  Admin is required ONLY when -CertUrl is given (cert goes to LocalMachine).
#>
[CmdletBinding()]
param(
    [string]$PackageUrl = 'https://github.com/FriskyDevelopments/paperclip-chrome/releases/latest/download/PaperclipDesk.msix',
    [string]$CertUrl = ''
)

$ErrorActionPreference = 'Stop'

$Red   = 'Red'
$Mint  = 'Green'   # closest console color to doctrine mint #22c7a8
$Gold  = 'Yellow'
$Cream = 'White'

function Header {
    Write-Host ''
    Write-Host '   ___  ___  ___  _____  _  ____   __' -ForegroundColor $Red
    Write-Host '  | _ \| _ \|_ _|/ __| |/ /\__ \ / /' -ForegroundColor $Red
    Write-Host '  |  _/|   / | | \__ \   <  / _/ | |' -ForegroundColor $Red
    Write-Host '  |_|  |_|_\|___||___/_|\_\ \___/_/ ' -ForegroundColor $Red
    Write-Host '   FR!SKY PAPERCLIP DESK — sideload installer' -ForegroundColor $Cream
    Write-Host '   Stamp-gated agent desk. No telemetry, no accounts.' -ForegroundColor $Gold
    Write-Host ''
}

function Fail($msg) {
    Write-Host "  ERROR: $msg" -ForegroundColor $Red
    throw $msg
}

Header

# --- OS floor: Windows 10 build 19041+ ---
$build = [System.Environment]::OSVersion.Version.Build
Write-Host "  Windows build: $build" -ForegroundColor $Cream
if ($build -lt 19041) {
    Fail "Windows 10 build 19041 or newer is required (you have build $build). Update Windows, then re-run."
}

# --- Resolve the package URL (honest defaults: fail loud, never 404 silently) ---
Write-Host "  Package: $PackageUrl" -ForegroundColor $Cream
try {
    $probe = Invoke-WebRequest -Uri $PackageUrl -Method Head -UseBasicParsing -ErrorAction Stop
    $size = $probe.Headers['Content-Length']
    if ($size) { Write-Host ("  Size: {0:N1} MB" -f ([double]$size / 1MB)) -ForegroundColor $Mint }
} catch {
    Fail ("Could not reach the package URL.`n  Tried: $PackageUrl`n" +
        "  Reason: $($_.Exception.Message)`n" +
        '  The first signed PaperclipDesk.msix has not been published yet — releases are empty. ' +
        'See windows/winget/README.md for how the first MSIX gets built on paperclip-win, ' +
        'or re-run with -PackageUrl pointing at a real .msix.')
}

# --- Optional self-signed cert -> LocalMachine\TrustedPeople (admin needed) ---
if ($CertUrl -ne '') {
    $isAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole( `
        [Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Fail "A -CertUrl was given, which installs to LocalMachine\TrustedPeople and needs admin. Re-run in an elevated PowerShell."
    }
    $cerFile = Join-Path $env:TEMP 'PaperclipDesk.cer'
    Write-Host "  Downloading cert: $CertUrl" -ForegroundColor $Cream
    try {
        Invoke-WebRequest -Uri $CertUrl -OutFile $cerFile -UseBasicParsing -ErrorAction Stop
    } catch {
        Fail "Could not download the cert: $($_.Exception.Message)"
    }
    Write-Host '  Trusting cert in LocalMachine\TrustedPeople ...' -ForegroundColor $Cream
    try {
        Import-Certificate -FilePath $cerFile -CertStoreLocation 'Cert:\LocalMachine\TrustedPeople' | Out-Null
        Write-Host '  Cert trusted.' -ForegroundColor $Mint
    } catch {
        Fail "Import-Certificate failed: $($_.Exception.Message)"
    }
} else {
    Write-Host '  No -CertUrl: assuming Store-signed package (needs no extra trust).' -ForegroundColor $Gold
    Write-Host '  Self-signed build? Re-run with -CertUrl <url-to-cer> in an elevated shell.' -ForegroundColor $Gold
}

# --- Download the MSIX with progress ---
$msixFile = Join-Path $env:TEMP 'PaperclipDesk.msix'
Write-Host "  Downloading to $msixFile ..." -ForegroundColor $Cream
try {
    Invoke-WebRequest -Uri $PackageUrl -OutFile $msixFile -UseBasicParsing -ErrorAction Stop
} catch {
    Fail "Download failed: $($_.Exception.Message)"
}
$bytes = (Get-Item $msixFile).Length
if ($bytes -lt 1MB) {
    Fail "Downloaded file is only $bytes bytes — that is an error page, not an MSIX. Check the release asset URL."
}
Write-Host ("  Downloaded {0:N1} MB." -f ($bytes / 1MB)) -ForegroundColor $Mint

# --- Install ---
Write-Host '  Installing (Add-AppxPackage) ...' -ForegroundColor $Cream
try {
    Add-AppxPackage -Path $msixFile -ErrorAction Stop
} catch {
    $tip = switch -Wildcard ("$($_.Exception.Message)") {
        '*0x80073CF9*' { 'Install rejected the package signature. Self-signed? Install its .cer first (-CertUrl, elevated).' }
        '*0x80073CF3*' { 'A conflicting package identity is installed. Uninstall the old Paperclip Desk (Settings > Apps) and re-run.' }
        default        { 'See the error above; common fix is the -CertUrl step for self-signed builds.' }
    }
    Fail "Add-AppxPackage failed: $($_.Exception.Message)`n  Hint: $tip"
}

# --- Launch via the app's Start-menu entry (family name from the manifest) ---
$pkg = Get-AppxPackage -Name 'FriskyDevelopments.FRskyPaperclipDesk' -ErrorAction SilentlyContinue
if ($null -eq $pkg) {
    Fail 'Installed, but the package FriskyDevelopments.FRskyPaperclipDesk was not found. Check Settings > Apps.'
}
$family = $pkg.PackageFamilyName
Write-Host "  Installed: $($pkg.Name) v$($pkg.Version)" -ForegroundColor $Mint
Write-Host "  Launching  shell:AppsFolder\$family!App ..." -ForegroundColor $Cream
try {
    Start-Process -FilePath 'explorer.exe' -ArgumentList "shell:AppsFolder\$family!App" -ErrorAction Stop
} catch {
    Write-Host '  Installed OK, but auto-launch failed — open "FR!sky Paperclip Desk" from Start.' -ForegroundColor $Gold
}

Write-Host ''
Write-Host '  DONE — FR!sky Paperclip Desk is installed.' -ForegroundColor $Mint
Write-Host '  First run: press Ctrl+Shift+P to summon the desk, STAMP to arm Clip hands, HALT to stop.' -ForegroundColor $Cream
Write-Host ''
