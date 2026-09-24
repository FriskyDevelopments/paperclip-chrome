# Windows test plan — FR!sky Paperclip 0.4.0 on `paperclip-win`

VM: `paperclip-win` (Standard_D4s_v5, Windows Server 2022 Datacenter Azure Edition),
RG `PAPERCLIP-RG`, `mexicocentral`. Public IP `68.155.148.111`, RDP 3389 open
(verified 2026-09-24). WinRM/SSH closed — access is RDP only.

## Access (OWNER ACTION — pick one)
- [ ] RDP in (Microsoft Remote Desktop) and create a local test user, or
- [ ] Approve `az vm user update` admin-password reset (invalidates the current credential), or
- [ ] Store admin user/pass in 1Password as `paperclip-win-admin`

## Session prep (agent, ~10 min, RDP)
1. Confirm Chrome present (install from `https://dl.google.com/chrome/install/latest/chrome_installer.exe` if missing).
2. Confirm Edge present (ships with Server 2022 — get Edge coverage free).
3. Copy `dist/frisky-paperclip-0.4.0.zip` to the VM (RDP drive redirect or
   `https://github.com/FriskyDevelopments/paperclip-chrome` raw download).
4. `chrome://extensions` → Developer mode → Load unpacked → `extension/`.
   Repeat on `edge://extensions`.

## Test matrix (both browsers unless noted)

| # | Check | Pass bar |
|---|-------|----------|
| 1 | Panel opens, doctrine-dark skin intact (no font fallbacks — Barlow/JetBrains/Manrope load) | Visual match to `store/screenshot-1.png` |
| 2 | Options: GROK card selected by default; GPT card selectable; matching key block shows/hides | Blocks toggle, no JS console errors |
| 3 | Run loop vs Grok (real xAI key) on a live page: read_tab → tool calls → done summary ≤12 steps | Summary logged, step counter correct |
| 4 | Run loop vs GPT (real OpenAI key): routes to `api.openai.com`, model `gpt-4o-mini` | Network shows openai host, no xAI call |
| 5 | STAMP gate: unstamped click blocked + logged in red; stamped click executes | Exact safety story from screenshot |
| 6 | HALT mid-run: loop aborts, status → halted, hands disarm | No further tool calls after HALT |
| 7 | Fresh profile, no keys: nokey hint shows, RUN errors cleanly to Options | No crash, no console errors |
| 8 | `chrome.storage.local` persists keys + mind across browser restart | Reload → settings intact |
| 9 | Fonts offline check: block Google Fonts (or unplug network briefly) — UI must stay usable on fallback stacks | No invisible text, no layout break |
| 10 | High-DPI (RDP 1440×900+): side panel layout, no overflow at 390px-equivalent narrow width | Matches narrow proof |

## Out of scope (documented, not tested here)
- Mac `.app` (can't run on Windows — macOS only, tested on the Mac via ad-hoc build).
- Native messaging host `com.friskydev.paperclip` (not shipped yet — sidecar falls back
  to HTTP `127.0.0.1:7429`, then degrades to `read_tab`; verify the degrade path in #3).
- Chrome Web Store install flow (item still in draft — sideload only until submit).

## Evidence to attach
- Screenshots: panel mid-run (both browsers), options with each mind selected, devtools console (clean).
- `chrome://extensions` errors page (must be empty).
- Note any Windows-only rendering deltas vs the Mac proofs in `store/`.
