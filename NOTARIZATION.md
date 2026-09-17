# Notarization runbook — FR!sky Paperclip

## Today: nothing to notarize

- This extension is plain JavaScript loaded by Chrome. Chrome Web Store submission does not involve Apple notarization.
- The companion `frisky-paperclip` Homebrew CLI is a bash script. Homebrew formulae (even bottled ones) are not individually notarized by their authors — Gatekeeper does not check scripts.

So for the current store submission: skip everything below.

## When the Clip sidecar ships as a compiled binary or .app

The moment the sidecar becomes a compiled macOS binary or a bundled `.app` distributed outside the App Store, Gatekeeper requires a Developer ID signature plus notarization.

### Prerequisites (human steps, once)

The Apple Developer Program account already exists (confirmed 2026-09-16) — do **not** re-enroll. A Google developer account exists too. What's missing is local signing material on this Mac: zero code-signing identities and no notarytool credential profile.

1. Apple Developer Program membership — **already active**, $99/yr handled.
2. A **Developer ID Application** certificate in the Mac's keychain. This is the first real step: sign in to the existing account at developer.apple.com → Certificates → create a Developer ID Application certificate, download it, and install it into the login keychain (or Xcode → Settings → Accounts → Manage Certificates).
3. Notarization credentials: either an App Store Connect API key (`.p8` + key id + issuer id) or an app-specific password, then store it as a profile: `xcrun notarytool store-credentials …`.
4. Verify an identity exists: `security find-identity -v -p codesigning` should list "Developer ID Application: …".
   As of 2026-09-16 this Mac has **zero** code-signing identities (verified with that command), so certificate creation (step 2) — not program enrollment — is the first human step.

### Sign

```sh
codesign --force --options runtime --timestamp \
  --sign "Developer ID Application: Frisky Developments (<TEAM_ID>)" \
  path/to/Clip.app        # or the bare binary
```

### Notarize

```sh
ditto -c -k --keepParent path/to/Clip.app Clip.zip

xcrun notarytool submit Clip.zip \
  --key-id "$APPLE_API_KEY_ID" \
  --issuer "$APPLE_API_ISSUER" \
  --key path/to/AuthKey_<KEY_ID>.p8 \
  --wait
```

(Or with an app-specific password: `--apple-id … --password … --team-id …`.)

### Staple

```sh
xcrun stapler staple path/to/Clip.app
xcrun stapler validate path/to/Clip.app
```

Bare command-line binaries can't be stapled — distribute them inside the notarized zip/dmg and keep the notarization ticket on Apple's servers (Gatekeeper checks it online).

### CI secret names

Use exactly these names in the repo's CI secrets so the release workflow stays copy-paste stable:

- `APPLE_CERTIFICATES_P12` — base64 of the exported Developer ID .p12
- `APPLE_CERTIFICATES_PASSWORD` — the .p12 export password
- `APPLE_API_KEY_ID`
- `APPLE_API_ISSUER`
- `APPLE_API_KEY_P8` — the .p8 contents (base64)
- `APPLE_TEAM_ID`
