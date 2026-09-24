The desk, native. Menu bar icon, floating panel, hotkey.

## The shape

A Swift menu-bar app — no Electron, no web wrapper tax. It bundles the same
desk you know from Chrome: STAMP-gated hands, HALT, the run log, your local
key. Press **⌥⌘P** anywhere and the panel floats up over whatever you're
doing.

## Sandbox note

The App Store build runs sandboxed with exactly two entitlements: the sandbox
itself, and outgoing network so the desk can reach your mind's API and load
fonts. Nothing else. No file access, no location, no microphone bargaining —
a desk needs the network and nothing more.

## Status

In development, targeting the Mac App Store — bundle `com.friskydev.paperclip`,
lockstep versioning with the extension. Today: `macos/build-app.sh` produces
a dev build with no Xcode required, ad-hoc signed and ready to run. The
submission runbook covers the rest — real certs, provisioning profile,
`productbuild` packaging, Transporter upload, done. macOS gets the desk the
Mac deserves: native, instant, and always one hotkey away.
