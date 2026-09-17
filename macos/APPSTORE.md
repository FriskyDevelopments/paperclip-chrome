# Mac App Store go-live runbook — FR!sky Paperclip (macOS)

Native menu-bar app in `macos/`. Dev builds use `macos/build-app.sh` (swiftc only,
ad-hoc signed). This runbook covers the real App Store submission.

## Prerequisites — already satisfied

- **Apple Developer Program: paid and active** (confirmed 2026-09-16). Do NOT re-enroll.
- **Xcode: installing.** Not needed for the dev build; required for archiving/upload.
- Bundle id chosen: `com.friskydev.paperclip`. Version `0.3.0` (matches the Chrome extension).

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
5. **Archive with Xcode** — once Xcode finishes installing, wrap `macos/Sources` in a
   minimal Xcode project (or move the swiftc build into an Xcode target), set signing
   to the Apple Distribution certificate + the profile from step 4, Product → Archive.
   Keep `macos/build-app.sh` for dev builds.
6. **Upload** — Xcode Organizer → Distribute App → App Store Connect, or Transporter
   with the exported `.pkg`.
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
