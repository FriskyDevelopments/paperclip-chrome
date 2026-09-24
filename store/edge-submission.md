# Edge Add-ons submission runbook — FR!sky Paperclip 0.5.0

Parallel track to the Chrome Web Store item. Same package family, separate store.
Docs source: [Publish a Microsoft Edge extension](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension).

## Readiness verdict: GO with the same 0.5.0 zip

- Manifest V3, MV3-native (no remote code) — Edge accepts Chrome MV3 packages.
  Extension name `FR!sky Paperclip` (16 chars, Edge limit 45). Description
  (92 chars) populates Edge's short description (≤132 chars rule applies on both).
- No `sidePanel` trap: the panel is opened via `chrome.action` in background.js;
  `side_panel.default_path` is tolerated by Edge (degrades to action-popup behavior).
  Real Edge test still scheduled on `paperclip-win` per `tests/windows-test-plan.md`.
- Store icon: re-render from the checked-in SVG for Edge's required logo
  (`store/edge-logo-300.png`, 300×300, ≥128px minimum). Do NOT lift the raw 128px PNG.

## Store assets (checked in)
- `dist/frisky-paperclip-0.5.0-edge.zip` — byte copy of the CWS 0.5.0 package
  (renamed so Partner Center uploads don't collide in your Downloads).
- `store/edge-logo-300.png` — 300×300 extension logo (required, per-language).
- `store/screenshot-1.png` — 1280×800 reuse (Edge accepts 1280×800 or 640×400, max 6).
- `store/permission-justifications.md` — privacy tab answers (purpose, per-permission,
  remote code = none, data usage) map 1:1 to Partner Center's Privacy page fields.
- `store/listing.md` — description base (Edge needs 250–10,000 chars; expand with the
  two-mind + stamp/halt detail from the file, ≤21 search terms, ≤30 chars each).
- Privacy policy URL: `https://friskydevelopments.github.io/paperclip-chrome/privacy.html`
- Support: `https://github.com/FriskyDevelopments/paperclip-chrome/issues`
- Website: `https://friskydevelopments.github.io/paperclip-chrome/`
- Certification notes (paste into "Notes for certification"):
  `No test accounts needed. To exercise the loop: open the side panel, paste any
  xAI or OpenAI key in Options, type a task, press STAMP to arm hands, RUN to plan
  (max 12 steps). Unstamped HANDS calls are blocked and logged. HALT aborts.`

## Steps (Partner Center, ~20 min + ≤7 business days certification)
1. Dashboard → Edge card → **Create new extension** → upload `*-edge.zip` → Continue.
2. **Availability**: Public, all markets → Save & Continue.
3. **Properties**: Category Productivity → Save & Continue.
4. **Privacy**: Single purpose + per-permission justifications + remote code No +
   data-use checkboxes + privacy policy URL → Save & Continue.
5. **Store listings** (en-US): name, description (250+ chars), logo, screenshot(s),
   search terms → Save draft.
6. **Publish** with the certification notes above.

## Blockers / owner actions
- Partner Center developer account with the Edge program (check the LLC account
  already covers Edge — same Partner Center identity as CWS-equivalent; confirm
  before uploading).
- Real-Edge verification on `paperclip-win` (test plan exists; needs RDP creds).
