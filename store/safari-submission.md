# App Store submission kit — FR!sky Paperclip for Safari 0.7.0

Parallel track to the Chrome Web Store item and the Edge Add-ons kit
(`store/edge-submission.md`). Same desk, Safari packaging.

## Packaging — read this first

Safari Web Extensions do NOT upload as a bare zip the way Chrome/Edge do.
They distribute through the Mac App Store **inside a macOS container app**.

- `dist/frisky-paperclip-0.7.0-safari.zip` (built by
  `safari/build-safari-zip.sh` from `safari/`) is the extension payload that
  goes **inside** the container app's Safari Web Extension target in Xcode.
- The container app itself is a thin host target **still to be scaffolded**
  (out of scope for this port — see `safari/README.md`). It is NOT `macos/`
  (that is the separate menu-bar desk product).
- App Store Connect receives the archived container app (`.xcarchive` → App
  Store), never the raw zip. Keep the zip as the auditable source payload.

## Store assets (checked in)

- `dist/frisky-paperclip-0.7.0-safari.zip` — extension payload for the
  container app target (15 files, `manifest.json` at root).
- `store/app-icon-1024.png` — 1024×1024 app icon rendered from
  `extension/icons/mark.svg` via `rsvg-convert` (App Store requires 1024;
  do NOT upscale the 128px PNG).
- `store/screenshot-1.png` — 1280×800 desk proof, reusable for the App Store
  screenshot set (6.5" / 5.5" sets need device-frame exports at submit time —
  owner action).
- `store/permission-justifications.md` — privacy answers map to App Store
  Connect's privacy questionnaire (see "Data Not Collected" below).
- `store/listing.md` — description base (App Store allows 4,000 chars;
  expand past the 250-char floor with the two-mind + stamp/halt detail).
  Replace "Chrome side panel" with "Safari toolbar popup" when pasting.
- Privacy policy URL: `https://friskydevelopments.github.io/paperclip-chrome/privacy.html`
- Support: `https://github.com/FriskyDevelopments/paperclip-chrome/issues`
- Website: `https://friskydevelopments.github.io/paperclip-chrome/`

## App Store Connect fields

- **Category**: Productivity.
- **Age rating**: 4+ (no objectionable content; no user-generated content
  exchange; HALT/STAMP keep the agent user-gated).
- **Price**: paid-up-front or freemium-with-unlock at the owner's call —
  keep parity with the $19 launch / $29 Whop SKU story from `store/listing.md`.
- **Data Not Collected** (privacy label): the extension collects nothing
  itself — API keys stay in `chrome.storage.local` on the machine; page
  content goes only to the user's chosen mind endpoint (xAI or OpenAI) when
  they press RUN; no accounts, no analytics, no Frisky servers. Answer
  "Data Not Collected" with the privacy policy URL linked.
- **Permissions used** (for review notes): `activeTab`, `scripting`,
  `contextMenus` (guarded, popup is the entry point), `storage`,
  `nativeMessaging` (graceful-degrades; companion host app is a follow-up),
  plus `host_permissions` for `127.0.0.1:7429` (local sidecar), `api.x.ai`,
  `api.openai.com` (the two minds, user-keyed, called only on RUN).

## Review notes (paste into App Review)

```
No test accounts needed. To exercise the loop: click the Paperclip toolbar
button to open the desk popup, paste any xAI or OpenAI key in Options, type
a task, press STAMP to arm hands, RUN to plan (max 12 steps). Unstamped
HANDS calls are blocked and logged. HALT aborts and disarms.

Differs from the Chrome/Edge builds in one deliberate way: Safari has no
side-panel API, so the desk surfaces as the toolbar popup
(action.default_popup) instead of a side panel. Same loop, same stamp/halt
safety story, same local-only key storage.
```

## Steps (~30 min + App Review)

1. Scaffold the thin container app in Xcode with a Safari Web Extension
   target pointed at `safari/` (**follow-up, not done in this port**).
2. App Store Connect → macOS Apps → **+** → upload the `.xcarchive` from
   Xcode (bundle ID reserved under the LLC account — owner action).
3. **App Information**: category Productivity, age 4+, privacy policy URL.
4. **Pricing and Availability**: price tier + markets (mirror the other stores).
5. **App Privacy**: Data Not Collected + policy URL.
6. **Prepare for Submission**: description (from `store/listing.md`, Safari
   wording), `store/app-icon-1024.png`, screenshots, review notes above.
7. Submit for review.

## Blockers / owner actions

- Container host app target not scaffolded yet (explicit follow-up).
- Bundle ID + App Store Connect record under the LLC account.
- Device-frame screenshot exports for the required App Store sizes.
- Paid Apple Developer Program membership (LLC) for Mac App Store distribution.
- Real-Safari verification run (see "Could not verify" in the port report):
  popup sizing, `contextMenus` presence, `scripting.executeScript` on the
  active tab, and the sidecar/native degrade chain.
