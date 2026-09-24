# FR!sky Paperclip Desk for Windows

Native Windows app — **the agent desk**, not the Edge extension (that's the
separate `store/edge-submission.md` track). WinUI 3 / Windows App SDK, C#,
single project in `windows/PaperclipDesk/`. Ships to users as MSIX through
the Microsoft Store (`store/msstore-submission.md`).

## How the shell maps to `macos/`

| macOS (`macos/Sources/`) | Windows (`windows/PaperclipDesk/`) |
|---|---|
| `AppDelegate` panel 1100×720, min 720×480 | `MainWindow.xaml.cs` — same geometry via `AppWindow.Resize` + `OverlappedPresenter.PreferredMinimum*` |
| `WKWebView` + `loadFileURL(index)` | WebView2, virtual host `https://paperclipdesk` mapped to `Assets\web` (file URIs are restricted for WebView2 app content; the mapping keeps `fetch`/relative paths working offline) |
| `window.PaperclipNative={platform:'macos'}` user script | `AddScriptToExecuteOnDocumentCreatedAsync` with `platform:'windows'`, version `0.5.0` |
| STAMP (red) / HALT (ink) SwiftUI buttons → `frisky-native` CustomEvent | STAMP (`#FF334E`) / HALT (ink outline) WinUI buttons → same `frisky-native` CustomEvent via `ExecuteScriptAsync` |
| Status-bar item + ⌥⌘P global hotkey + menu | **Not in v1** — windowed app launched from Start (see below) |
| `build-app.sh` stages `$PAPERCLIP_PROD` → `Resources/web` | `build-windows.ps1` stages `$PAPERCLIP_PROD` → `Assets\web` |

Doctrine skin: dark `#030708` window, ink `#0A0F11` top bar, cream text.
WinUI ships Segoe UI Variable for v1 (system heavy); bundling Barlow Condensed
offline for full doctrine parity is a follow-up.

## The hotkey limitation (read before promising anything)

`RegisterHotKey` (user32 system-wide hotkeys) does **not** work from inside
the MSIX app-container sandbox — a packaged Store app cannot register a
system-wide hotkey. So v1 ships:

- **Ctrl+Shift+P** — in-app `KeyboardAccelerator` that focuses the desk
  window while the app runs (plus Ctrl+Shift+S / Ctrl+Shift+H mirrors of the
  STAMP/HALT buttons).
- No tray residency, no global hotkey.

Follow-ups (unpackaged companion, post-Store): a sidecar unpackaged helper
(full-trust, outside the container) can own `RegisterHotKey` + tray icon and
activate the packaged app via protocol (`paperclip-desk://show`). That is a
separate project + fullTrustProcess capability — do not bolt it onto v1.

## Privacy

No telemetry, no accounts, no network except the web content's own calls:
the desk page calls the user's chosen mind endpoint (xAI / OpenAI) only on
explicit RUN, plus Google Fonts. API keys stay in the app's local storage on
the machine. Same story as the macOS desk and the browser builds.

## Installers

Three ways onto a machine — Store, sideload script, winget:

1. **Microsoft Store** (primary path): `store/msstore-submission.md` — the
   Store-signed MSIX. No cert steps, auto-updates.
2. **Sideload one-liner** (`install.ps1`, no Store needed, Windows 10 19041+):
   `irm https://raw.githubusercontent.com/FriskyDevelopments/paperclip-chrome/main/windows/install.ps1 | iex`
   Branded header, OS-floor check, downloads `PaperclipDesk.msix` from the
   latest GitHub release, optional `-CertUrl` (self-signed builds only: installs
   the `.cer` to `LocalMachine\TrustedPeople`, needs admin), `Add-AppxPackage`,
   auto-launch, Ctrl+Shift+P first-run hint. Until the first signed MSIX is
   published the default URL fails LOUD with the reason (never a silent 404) —
   pass `-PackageUrl` explicitly (save the file first; params can't go through
   `| iex`).
3. **winget** (`winget/`, STAGED — not submittable yet):
   `FriskyDevelopments.PaperclipDesk` / Moniker `paperclip-desk`. The
   `InstallerSha256` is the `000…0` placeholder until the first signed MSIX
   exists; `winget/README.md` has the exact `Get-FileHash` fill-in steps, and
   the PR to `microsoft/winget-pkgs` goes out only after that.

## Build on paperclip-win, step by step

Machine: `paperclip-win` (Windows Server 2022, RDP only — see
`tests/windows-test-plan.md` for access). The C# project **cannot** compile
on the Mac (`dotnet` absent) — first green build happens here.

1. RDP in. Install the toolchain (one time):
   `winget install Microsoft.DotNet.SDK.8`
   VS 2022 Community + WinUI workload (see exact override flags in
   `build-windows.ps1` header). Install the WebView2 Evergreen Runtime
   (Server SKUs don't guarantee it).
2. Get the sources: clone `FriskyDevelopments/paperclip-chrome` (main) and
   copy the `frisky-paperclip-prod` folder (`index.html` + `assets/` +
   `icons/`) to `%USERPROFILE%\frisky-paperclip-prod` (or set
   `$env:PAPERCLIP_PROD`).
3. `cd windows` → `powershell -ExecutionPolicy Bypass -File .\build-windows.ps1`
   (Debug). Expect: staged file list + `dotnet build` success.
4. `-Config Release` for the shippable bits. Launch: Start the app from the
   build output (or `dotnet run --project PaperclipDesk -c Release`).
5. Smoke: window 1100×720 titled "FR!sky Paperclip" → desk UI loads offline →
   STAMP arms hands, HALT aborts mid-run (same gates as the mac desk).
   Screenshots at 1366×768 / 1920×1080 feed the Store listing
   (`store/msstore-submission.md`).
6. Store packaging: open the project in VS → Associate App with the Store →
   Create App Packages → upload `.msixupload` (full click-path in
   `build-windows.ps1` header + `store/msstore-submission.md`).

## Files

- `PaperclipDesk/PaperclipDesk.csproj` — net8.0-windows, WinAppSDK 1.6, MSIX tooling.
- `PaperclipDesk/Package.appxmanifest` — identity
  `FriskyDevelopments.FRskyPaperclipDesk`, `CN=Frisky Developments LLC`
  placeholder publisher (Store association rewrites it), `internetClient` only.
- `PaperclipDesk/MainWindow.xaml` + `.cs` — top bar + WebView2 + bridge.
- `PaperclipDesk/App.xaml` + `.cs` — entry point.
- `PaperclipDesk/Assets/` — `mark.svg` (source) + tile/logo/splash PNGs
  rendered from it via `rsvg-convert` on the Mac (wide/splash centered on
  doctrine ink `#030708`).
- `build-windows.ps1` — stage + build, the only documented build path.
