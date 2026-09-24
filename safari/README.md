# FR!sky Paperclip for Safari

The agent desk as a Safari toolbar popup. Same 0.5.0 desk as `extension/`
(Grok/GPT minds, 12-step loop, STAMP-gated HANDS tools, HALT) — surfaced
through `action.default_popup` because Safari has no side-panel API.

Not Claude-in-Chrome. Not a grok.com bookmark.

## Layout

`safari/` is a full standalone copy of the extension UI + logic. Nothing is
symlinked: the Chrome/Edge zips and the Safari package must stay independent.

```
safari/
  manifest.json        # MV3, Safari-adapted (see diffs below)
  background.js        # guarded service worker
  sidepanel.html/js/css/sidepanel-mark.js  # the desk (served as the popup)
  loop.js              # 12-step loop, both minds
  options.html/js      # mind picker + keys + sidecar endpoint
  icons/               # same mark PNGs/SVGs as extension/
  build-safari-zip.sh  # → dist/frisky-paperclip-<version>-safari.zip
  README.md            # this file
```

## Deliberate diffs vs `extension/`

| Area | Chrome (`extension/`) | Safari (`safari/`) | Reason |
|------|----------------------|--------------------|--------|
| Desk surface | `side_panel.default_path` + `sidePanel` permission, opened via `chrome.sidePanel.open` | `action.default_popup: sidepanel.html`, no `side_panel` key, no `sidePanel` permission | Safari has no sidePanel API and no `action.openPanel`; the toolbar popup is the desk |
| `minimum_chrome_version` | `"116"` | removed | Chrome-only key, meaningless (and invalid) for Safari review |
| Host access | `optional_host_permissions` + runtime `chrome.permissions.request` | `host_permissions` upfront for `http://127.0.0.1:7429/*`, `https://api.x.ai/*`, `https://api.openai.com/*` | All three are user-explicit features (sidecar + the two minds); upfront grant is review-safe, and the runtime request is kept as best-effort try/catch for parity |
| `contextMenus` | unguarded `chrome.contextMenus` | same permission + menu item, but every call guarded (`if (chrome.contextMenus)`, try/catch) | Safari menu support could not be confirmed without a real Safari run — kept with guards so the popup remains the entry point either way; if Safari drops the item in testing, delete the block, the desk loses nothing |
| `background.js` | `chrome.sidePanel.*` unguarded | all `sidePanel` uses behind `if (chrome.sidePanel && …)`; `action.onClicked` kept as a no-op fallback | Safari opens `default_popup` automatically on toolbar click, so `onClicked` may never fire — it degrades silently |
| `nativeMessaging` | permission + `sendNativeMessage` fallback | identical permission + code path, degrades gracefully when no host is installed | The localhost sidecar HTTP path stays primary; the native host `com.friskydev.paperclip` requires a companion host-app target (see below) |
| `loop.js` tool text | "attached Chrome" | "attached Safari tab" | The model reads this description; keep it truthful per platform |
| `sidepanel.js` system prompt | "agent desk in Chrome" | "agent desk in Safari" | Same reason |
| Fonts | Google Fonts `<link>` | same `<link>`, unchanged | System-font fallbacks (`Arial Narrow`, `ui-sans-serif`, `ui-monospace`, `Menlo`) are already in every stack — the desk renders fine offline; no fonts bundled |
| Everything else | — | byte-identical apart from the one-line `Safari port of <file>` header comment | Injected page functions (`clickInPage`/`typeInPage`), `chrome.tabs`, `chrome.scripting`, `chrome.storage` are standard MV3 used as-is |

## The native host is a follow-up, not this port

`nativeMessaging` to `com.friskydev.paperclip` works in Safari Web Extensions
only through a host app's `SFSafariExtensionHandler beginRequest`. That host
app target does not exist yet — scaffolding it is out of scope for this port.
Until it exists, Safari runs the same degrade chain as Chrome: sidecar HTTP →
native host (absent, caught) → `read_tab`. Nothing breaks; the snapshot tool
just reports the sidecar as unreachable when it isn't running.

## How to run in Safari (unsigned, dev)

1. Build the zip (optional): `safari/build-safari-zip.sh` →
   `dist/frisky-paperclip-0.4.0-safari.zip`.
2. Safari Web Extensions ship inside a macOS container app: open the `safari/`
   folder as a Safari Web Extension target in Xcode
   (File → New → Target → Safari Web Extension, pointing at this folder),
   then run — Safari loads the `.appex`.
3. Shortcut without a full App Store flow: Safari → Settings → Advanced →
   Show features for web developers, then Develop → Allow Unsigned Extensions,
   and enable the extension in Settings → Extensions.
4. Click the Paperclip toolbar button → the desk popup opens. Options works
   from the popup footer; keys live in `chrome.storage.local` on the machine.

## App Store path

Safari Web Extensions distribute through the Mac App Store inside a container
app. That container is a thin host target still to be scaffolded — explicitly
out of scope here, do not scaffold it in this port. Note: `macos/` in this
repo is a SEPARATE product (the menu-bar desk), not the Safari container app;
do not conflate them.
