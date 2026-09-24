# FR!sky Paperclip for Chrome

The agent desk as a side panel. Codex, Grok, Fenrir, Bruma, codePup, Clip.

Grok plans up to 12 steps via the xAI API. Clip clicks only after you stamp. Halt anytime. PAGE is untrusted.

Not Claude-in-Chrome. Not a grok.com bookmark.

## Panel
Chrome → Extensions → Developer mode → Load unpacked → `extension/`

Options: paste an xAI key. It stays on the machine. Run loop.

## Clip sidecar
`sidecar/` — HTTP on this computer, or native host `com.friskydev.paperclip`.

## SKU
$29 → $19 on Whop. The $49 kit already includes this room.
https://friskydevelopments.github.io/paperclip-chrome/

## Mac app
`macos/` — native menu-bar desk (⌥⌘P, floating panel, bundled web desk).
Status: in development, targeting the Mac App Store.
Dev build (no Xcode needed): `macos/build-app.sh` → `macos/dist/FR!sky Paperclip.app`.
Submission runbook: `macos/APPSTORE.md`; listing copy: `store/appstore-listing.md`.

## Store
Dev: Chrome → Extensions → Developer mode → Load unpacked → `extension/`.
Chrome Web Store: link coming after review.
Safari: port staged in `safari/` (toolbar-popup build, 0.4.0) — container host app pending, runbook in `store/safari-submission.md`.
Windows: native desk app scaffolded in `windows/` (WinUI 3 + WebView2, 0.4.0) — Store filing needs paperclip-win build + Partner Center record, runbook in `store/msstore-submission.md`.
Privacy policy: https://friskydevelopments.github.io/paperclip-chrome/privacy.html
Store zip: `scripts/build-store-zip.sh` → `dist/frisky-paperclip-<version>.zip`.
