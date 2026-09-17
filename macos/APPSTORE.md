# Mac App Store go-live runbook — FR!sky Paperclip (macOS)

Native menu-bar app in `macos/`. Dev builds use `macos/build-app.sh` (swiftc only,
ad-hoc signed). This runbook covers the real App Store submission.

## Prerequisites — already satisfied

- **Apple Developer Program: paid and active** (confirmed 2026-09-16). Do NOT re-enroll.
- **Xcode: NOT required.** Decision 2026-09-16: no Xcode on this machine (too heavy).
  The full submission chain works with Command Line Tools only — see
  "No-Xcode submission chain" below. If Xcode ever lands, the classic
  Product → Archive flow works too, but it is not needed.
- Bundle id chosen: `com.friskydev.paperclip`. Version `0.3.0` (matches the Chrome extension).

## No-Xcode submission chain (CLT only — the canonical path here)

Everything below uses tools already on this Mac (swiftc, codesign, productbuild)
plus the free **Transporter** app (~100 MB, Mac App Store — the only download):

1. Build: `macos/build-app.sh` (already produces the signed bundle; re-sign with the
   real certs at submission time).
2. Sign the app with **Apple Distribution** + the Mac App Store provisioning profile:
   `codesign --deep --force --options runtime --entitlements macos/entitlements.plist \
     --sign "Apple Distribution: Frisky Developments LLC (<TEAM_ID>)" \
     --timestamp "dist/FR!sky Paperclip.app"` and embed the profile at
   `Contents/embedded.provisionprofile`.
3. Package: `productbuild --component "dist/FR!sky Paperclip.app" /Applications \
     --sign "3rd Party Mac Developer Installer: Frisky Developments LLC (<TEAM_ID>)" \
     frisky-paperclip-0.3.0.pkg` (the installer cert is created in the same portal
   Certificates page as the Apple Distribution cert).
4. Upload: Transporter app → drop the `.pkg` → Deliver. (Or the App Store Connect
   API for metadata; binaries still go through Transporter.)

## Sandbox note — why only two entitlements

`macos/entitlements.plist` grants exactly:

- `com.apple.security.app-sandbox` — required for App Store.
- `com.apple.security.network.client` — the desk talks to `api.x.ai` and loads Google Fonts.

Nothing else is needed, and anything else would invite review questions:

- **Global hotkey ⌥⌘P** uses Carbon `RegisterEventHotKey`, which is sandbox-safe — no
  accessibility or input-monitoring entitlement.
- **Bundled web content** is read from the app's own Resources, which the sandbox
  always allows — no file-access entitlements.
- The app never writes outside its container, never reads other apps' data, and
  receives no inbound network connections (no `network.server`).

## Remaining steps, in order

1. **App ID** — developer.apple.com → Certificates, Identifiers & Profiles → Identifiers
   → create `com.friskydev.paperclip` (macOS). No special capabilities.
2. **Apple Distribution certificate (Mac)** — same portal → Certificates → "Apple
   Distribution". Download and install into the login keychain (or let Xcode →
   Settings → Accounts → Manage Certificates create it).
3. **App Store Connect app record** — appstoreconnect.apple.com → Apps → New App →
   macOS, bundle id `com.friskydev.paperclip`, name "FR!sky Paperclip Desk".
4. **Provisioning profile** — portal → Profiles → "Mac App Store" profile for the App ID.
5. **Sign + package (no Xcode)** — follow the "No-Xcode submission chain" above:
   re-sign with the Apple Distribution certificate + the profile from step 4, then
   `productbuild` the `.pkg` with the installer certificate.
6. **Upload** — Transporter app (free, Mac App Store) → drop the `.pkg` → Deliver.
7. **Listing metadata** — copy from `store/appstore-listing.md` (name, subtitle,
   description, keywords, category, URLs).
8. **Age rating** — 4+ (no objectionable content of any kind).
9. **Privacy nutrition label** —
   - Data collected by Frisky: **none**. No accounts, no analytics, nothing sent to
     Frisky servers.
   - The user's xAI API key is entered by the user and stays on the device.
   - Page content is sent to `api.x.ai` only when the user explicitly presses RUN.
   Declare "Data Not Collected".
10. **Review notes (guideline 4.2)** — preempt the "repackaged website" rejection.
    State clearly: this is NOT a wrapped website. It is a menu-bar resident agent desk
    with a global hotkey (⌥⌘P), a native floating panel that joins all Spaces and
    full-screen apps, native STAMP/HALT controls bridged into the desk via JavaScript
    events, and fully offline bundled content (the desk UI ships inside the app; only
    model calls go to the network, on explicit user action with the user's own key).

## Alternate path: Developer ID direct distribution

If we also ship outside the App Store: sign with **Developer ID Application**
(`--options runtime`), zip, `xcrun notarytool submit … --wait`, then
`xcrun stapler staple`. Full procedure in `../NOTARIZATION.md`. The Developer ID
certificate and notarytool credential profile do not exist on this Mac yet — that is
the first human step for the direct path.
