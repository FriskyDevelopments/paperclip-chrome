#!/usr/bin/env bash
#
# package-dmg.sh — build a styled distributable DMG for "FR!sky Paperclip Desk".
#
# *** SIGNING STATUS — READ BEFORE PUBLIC DISTRIBUTION ***
# The .app staged into this DMG is AD-HOC signed (codesign --sign -) because
# NO Developer ID identity exists on this machine (verified:
# `security find-identity -v -p codesigning` returns 0 valid identities).
# An ad-hoc-signed app installs locally but Gatekeeper blocks it on other Macs.
# BEFORE PUBLIC DISTRIBUTION: create a Developer ID Application certificate,
# re-sign + notarize per NOTARIZATION.md, then REBUILD this DMG so the shipped
# app is the notarized one. DO NOT sign anything in this script with a real
# identity — it only re-packages whatever macos/build-app.sh produced.
#
# Input : macos/dist/"FR!sky Paperclip.app" (runs macos/build-app.sh if missing)
# Output: macos/dist/"FR!sky Paperclip-<version>.dmg"
#         (version read from the app's Info.plist CFBundleShortVersionString)
#
# Layout: 660x440 Finder window, icon size 128, app icon left, /Applications
# symlink right, doctrine-dark background rendered from dmg-background.svg.
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
MARK="$REPO/extension/icons/mark.svg"
APP_NAME="FR!sky Paperclip"
DIST="$ROOT/dist"
APP="$DIST/$APP_NAME.app"
VOLNAME="FR!sky Paperclip"
WIN_W=660
WIN_H=440

step() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

# --- Input: build the app first if it is missing (safe to re-run, ~35s) ---
if [[ ! -d "$APP" ]]; then
    step "App missing — running build-app.sh first"
    "$ROOT/build-app.sh"
fi
[[ -d "$APP" ]] || { echo "MISSING: $APP" >&2; exit 1; }

VERSION="$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "$APP/Contents/Info.plist")"
[[ -n "$VERSION" ]] || { echo "Could not read CFBundleShortVersionString" >&2; exit 1; }
FINAL="$DIST/$APP_NAME-$VERSION.dmg"
echo "  version: $VERSION"
echo "  output:  $FINAL"

BUILD="$ROOT/build/dmg"
rm -rf "$BUILD"
mkdir -p "$BUILD"

# --- Background: substitute version, render at 2x (1320x880 for 660x440) ---
step "Render DMG background"
sed "s/%%VERSION%%/$VERSION/" "$ROOT/dmg-background.svg" > "$BUILD/dmg-background-$VERSION.svg"
rsvg-convert -w $((WIN_W * 2)) -h $((WIN_H * 2)) \
    "$BUILD/dmg-background-$VERSION.svg" -o "$BUILD/background.png"
echo "  $BUILD/background.png"
echo "  (inspect this PNG visually before shipping — craft claims need eyes)"

# --- Volume icon: mark.svg -> iconset -> .VolumeIcon.icns (build-app.sh pattern) ---
step "Render volume icon"
VICONSET="$BUILD/VolumeIcon.iconset"
mkdir -p "$VICONSET"
vrender() { rsvg-convert -w "$2" -h "$2" "$MARK" -o "$VICONSET/$1"; }
vrender icon_16x16.png 16
vrender icon_16x16@2x.png 32
vrender icon_32x32.png 32
vrender icon_32x32@2x.png 64
vrender icon_128x128.png 128
vrender icon_128x128@2x.png 256
vrender icon_256x256.png 256
vrender icon_256x256@2x.png 512
vrender icon_512x512.png 512
vrender icon_512x512@2x.png 1024
iconutil -c icns "$VICONSET" -o "$BUILD/.VolumeIcon.icns"
echo "  $BUILD/.VolumeIcon.icns"

# --- Stage a writable image ---
step "Stage writable image"
STAGING="$BUILD/staging.dmg"
rm -f "$STAGING" "$FINAL"
hdiutil create -size 64m -fs HFS+ -volname "$VOLNAME" "$STAGING" -ov -quiet
MOUNT="$(hdiutil attach -readwrite -noverify -noautoopen "$STAGING" \
    | grep -E '^/dev/' | sed -n 's/.*\(\/Volumes\/.*\)/\1/p' | tail -1)"
[[ -n "$MOUNT" && -d "$MOUNT" ]] || { echo "Attach failed for $STAGING" >&2; exit 1; }
echo "  mounted at $MOUNT"

cleanup_mount() { hdiutil detach "$MOUNT" -force >/dev/null 2>&1 || true; }
trap cleanup_mount EXIT

cp -R "$APP" "$MOUNT/$APP_NAME.app"
ln -s /Applications "$MOUNT/Applications"
mkdir -p "$MOUNT/.background"
cp "$BUILD/background.png" "$MOUNT/.background/background.png"
# Volume icon: the canonical blessed file is "Icon\r" + the volume custom bit.
# (A plain .VolumeIcon.icns gets eaten by modern Finder on open — verified.)
cp "$BUILD/.VolumeIcon.icns" "$MOUNT/Icon"$'\r'
/usr/bin/SetFile -a C "$MOUNT" 2>/dev/null || SetFile -a C "$MOUNT"
/usr/bin/SetFile -a V "$MOUNT/Icon"$'\r' 2>/dev/null || SetFile -a V "$MOUNT/Icon"$'\r'
chflags hidden "$MOUNT/.background"
echo "  app + Applications link + background + volume icon staged"

# --- Finder layout via osascript ---
step "Finder layout (osascript)"
osascript <<EOF
tell application "Finder"
    tell disk "$VOLNAME"
        open
        set current view of container window to icon view
        set toolbar visible of container window to false
        set statusbar visible of container window to false
        set the bounds of container window to {200, 120, $((200 + WIN_W)), $((120 + WIN_H))}
        set theViewOptions to the icon view options of container window
        set arrangement of theViewOptions to not arranged
        set icon size of theViewOptions to 128
        set background picture of theViewOptions to POSIX file "$MOUNT/.background/background.png"
        delay 1
        set position of item "$APP_NAME.app" of container window to {170, 230}
        set position of item "Applications" of container window to {490, 230}
        close
        open
        update without registering applications
        delay 2
    end tell
end tell
EOF
echo "  window ${WIN_W}x${WIN_H}, icons 128, app@(170,230) Applications@(490,230)"

# Flush layout (.DS_Store) and seal the staging image as compressed read-only.
sync
sleep 1
# Re-assert the custom-icon bit AFTER the Finder pass (Finder can clear it).
/usr/bin/SetFile -a C "$MOUNT" 2>/dev/null || SetFile -a C "$MOUNT"
trap - EXIT
hdiutil detach "$MOUNT"
unset MOUNT

step "Compress to final UDZO"
hdiutil convert "$STAGING" -format UDZO -imagekey zlib-level=9 -o "$FINAL" -ov -quiet
rm -f "$STAGING"
echo "  $FINAL"

# --- End-to-end verify: mount the FINAL artifact and confirm contents ---
step "Verify final DMG"
VMOUNT="$(hdiutil attach -readonly -noverify -noautoopen "$FINAL" \
    | grep -E '^/dev/' | sed -n 's/.*\(\/Volumes\/.*\)/\1/p' | tail -1)"
[[ -n "$VMOUNT" && -d "$VMOUNT" ]] || { echo "Attach failed for $FINAL" >&2; exit 1; }
trap 'hdiutil detach "$VMOUNT" -force >/dev/null 2>&1 || true' EXIT
echo "  mounted at $VMOUNT"
ls -la "$VMOUNT"
[[ -d "$VMOUNT/$APP_NAME.app" ]] || { echo "VERIFY FAIL: app missing" >&2; exit 1; }
[[ -L "$VMOUNT/Applications" ]] || { echo "VERIFY FAIL: Applications link missing" >&2; exit 1; }
[[ -f "$VMOUNT/.background/background.png" ]] || { echo "VERIFY FAIL: background missing" >&2; exit 1; }
[[ -f "$VMOUNT/Icon"$'\r' ]] || { echo "VERIFY FAIL: volume icon (Icon\\r) missing" >&2; exit 1; }
[[ -f "$VMOUNT/.DS_Store" ]] || echo "  WARN: no .DS_Store — Finder layout may not persist"
if /usr/bin/GetFileInfo -a "$VMOUNT" 2>/dev/null | tr 'a-z' 'A-Z' | grep -q 'C'; then
    echo "  volume custom-icon flag: set"
else
    echo "  WARN: volume custom-icon flag not detected"
fi
hdiutil detach "$VMOUNT"
trap - EXIT

step "Done"
echo "  $FINAL"
echo "  Mount it once yourself (open \"$FINAL\") for the Finder-window beauty check."
