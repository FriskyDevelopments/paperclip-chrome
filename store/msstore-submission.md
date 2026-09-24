# Microsoft Store submission kit — FR!sky Paperclip Desk 0.4.0 (native Windows app)

Separate track from the Edge Add-ons extension (`store/edge-submission.md`).
This is the **native WinUI 3 app** in `windows/` — packaged as MSIX, filed
through Partner Center → Microsoft Store. Docs source: [App submissions](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/overview).

## Readiness verdict: SCAFFOLD COMPLETE, filing needs paperclip-win + Partner Center

The project compiles only on Windows (`dotnet` absent on the Mac — verified).
What ships from here: reviewed XAML/C# + staged assets + this runbook.
What remains: first `dotnet build` on paperclip-win, Store screenshots
captured on Windows, and the owner actions below.

## App identity (Partner Center)

- **Reserve the name first**: "FR!sky Paperclip Desk" (Dashboard → Apps →
  **Reserve a new app name**). The manifest identity must then match:
  `Name="FriskyDevelopments.FRskyPaperclipDesk"`,
  `Publisher="CN=…"` ← **replaced by Store association** (VS rewrites the
  placeholder `CN=Frisky Developments LLC` + generates
  `Package.StoreAssociation.xml` — commit that file when it exists).
- **Version**: 0.4.0.0 (lockstep with the extension + macOS desk).
- **Category**: Productivity. **Age rating**: 4+ (IARC questionnaire: no
  objectionable content, no user-generated content exchange, no accounts;
  STAMP/HALT keep the agent user-gated).

## Required assets

- **Store logo 300×300**: reuse `store/edge-logo-300.png` for the Partner
  Center listing graphic (same mark, already 300×300 from the SVG).
- **Screenshots — MUST be captured on Windows** (1366×768 and/or 1920×1080,
  at least 1, up to 10): launch the Release build on paperclip-win, STAMP-armed
  desk visible. `store/screenshot-1.png` (1280×800, browser build) is a
  **placeholder only** for layout reference — do NOT upload it as the app's
  screenshots; certification rejects non-representative captures.
- **Tile/logo set**: already in `windows/PaperclipDesk/Assets/` (rendered from
  `extension/icons/mark.svg` via `rsvg-convert`): `StoreLogo.png` 300×300,
  `Square150x150Logo.png`, `Square44x44Logo.png`, `Wide310x150Logo.png`,
  splash 620×300. Wide/splash sit on doctrine ink `#030708`.
- **Description base**: `store/listing.md` (replace "Chrome side panel" with
  "native Windows desk app"; keep the two-mind + stamp/halt detail; search
  terms ≤30 chars each).
- Privacy policy URL: `https://friskydevelopments.github.io/paperclip-chrome/privacy.html`
- Support: `https://github.com/FriskyDevelopments/paperclip-chrome/issues`
- Website: `https://friskydevelopments.github.io/paperclip-chrome/`

## "Data Not Collected"-equivalent answers (Store age/data questionnaire)

The app collects nothing itself — mirror of the Safari "Data Not Collected"
label (`store/safari-submission.md`):

- API keys: stored in the app's local storage on the machine, never leave it
  except as the user's own calls to their chosen mind endpoint.
- Page/task content: sent only to xAI or OpenAI, only when the user presses
  RUN (max 12 steps). No accounts, no analytics, no Frisky servers.
- Network capability declared: `internetClient` ONLY (mind endpoints on
  explicit RUN + Google Fonts). No other capabilities.
- Certification notes (paste into "Notes for certification"):
  `No test accounts needed. To exercise the loop: launch the app, paste any
  xAI or OpenAI key in the desk, type a task, press STAMP to arm hands, RUN
  to plan (max 12 steps). Unstamped HANDS calls are blocked and logged. HALT
  aborts. Taskbar/Start presence is the menu/status equivalent; Ctrl+Shift+P
  focuses the desk while the app runs (system-wide hotkey intentionally out
  of v1 — sandboxed MSIX apps cannot register one).`

## Steps (Partner Center, ~30 min + 1–3 business days certification)

1. **Reserve the name** "FR!sky Paperclip Desk" (creates the app record +
   the real Publisher ID).
2. On paperclip-win: open `windows/PaperclipDesk` in VS 2022 → **Associate
   App with the Store…** → pick the reserved record (rewrites manifest
   Publisher, generates `Package.StoreAssociation.xml`).
3. **Create App Packages…** → Microsoft Store target → Release → x64 (+
   x86/ARM64) → produces the `.msixupload`.
4. Submission tabs: **Pricing & availability** (Public, all markets; price at
   owner's call, parity with the $19 launch / $29 Whop SKU story) →
   **Properties** (Productivity, 4+) → **Privacy** (policy URL + answers
   above) → **Listings** (en-US: name, description, Store logo, Windows
   screenshots, search terms) → **Packages**: upload `.msixupload`.
5. **Submit for certification** with the notes above.

## Owner actions

- [ ] Partner Center developer account (LLC) with the **Windows program**
  (confirm it covers Store app submissions, not just Edge — same identity as
  the Edge kit, different program entitlement).
- [ ] Reserve "FR!sky Paperclip Desk" → creates the app record + Publisher ID.
- [ ] RDP session on paperclip-win: toolchain install → first build → smoke →
  Windows screenshots → VS Store association → `.msixupload`.
- [ ] Pricing call ($19 launch / $29 Whop parity vs free + unlock).
