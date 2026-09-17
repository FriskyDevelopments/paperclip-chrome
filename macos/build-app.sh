#!/usr/bin/env bash
# Build "FR!sky Paperclip.app" with swiftc only — no .xcodeproj required.
# Idempotent: safe to re-run; dist/ and build/ are rebuilt from scratch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PROD="${PAPERCLIP_PROD:-$HOME/frisky-paperclip-prod}"
APP_NAME="FR!sky Paperclip"
DIST="$ROOT/dist"
BUILD="$ROOT/build"
APP="$DIST/$APP_NAME.app"
EXECUTABLE="FriskyPaperclip"
SDK="$(xcrun --show-sdk-path)"
TARGET="arm64-apple-macosx14.0"

step() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

step "Inputs"
echo "  sdk:      $SDK"
echo "  target:   $TARGET"
echo "  web src:  $PROD"
for f in "$PROD/index.html" "$PROD/assets" "$PROD/icons/husky.svg"; do
    [[ -e "$f" ]] || { echo "  MISSING: $f" >&2; exit 1; }
done

step "Clean dist + build"
rm -rf "$DIST" "$BUILD"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" "$BUILD"

step "Render icons from husky.svg"
ICONSET="$BUILD/AppIcon.iconset"
mkdir -p "$ICONSET"
render() { # name size
    rsvg-convert -w "$2" -h "$2" "$PROD/icons/husky.svg" -o "$ICONSET/$1"
    echo "  $1 (${2}px)"
}
render icon_16x16.png 16
render icon_16x16@2x.png 32
render icon_32x32.png 32
render icon_32x32@2x.png 64
render icon_128x128.png 128
render icon_128x128@2x.png 256
render icon_256x256.png 256
render icon_256x256@2x.png 512
render icon_512x512.png 512
render icon_512x512@2x.png 1024
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/AppIcon.icns"
echo "  AppIcon.icns written"

step "Render status-bar template image"
rsvg-convert -w 18 -h 18 "$PROD/icons/husky.svg" -o "$BUILD/StatusIcon.png"
rsvg-convert -w 36 -h 36 "$PROD/icons/husky.svg" -o "$BUILD/StatusIcon@2x.png"
cp "$BUILD/StatusIcon.png" "$BUILD/StatusIcon@2x.png" "$APP/Contents/Resources/"
echo "  StatusIcon.png + StatusIcon@2x.png written"

step "Bundle desk SPA → Resources/web"
mkdir -p "$APP/Contents/Resources/web"
cp "$PROD/index.html" "$APP/Contents/Resources/web/"
cp -R "$PROD/assets" "$APP/Contents/Resources/web/"
cp -R "$PROD/icons" "$APP/Contents/Resources/web/"
find "$APP/Contents/Resources/web" -type f | sed "s|^$APP/Contents/Resources/|  |"

step "Compile Swift sources"
swiftc \
    -sdk "$SDK" \
    -target "$TARGET" \
    -O \
    -o "$APP/Contents/MacOS/$EXECUTABLE" \
    "$ROOT"/Sources/*.swift
echo "  $APP/Contents/MacOS/$EXECUTABLE"

step "Bundle metadata"
cp "$ROOT/Info.plist" "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"
echo "  Info.plist + PkgInfo"

step "Ad-hoc codesign (deep, sandbox entitlements)"
codesign --force --deep --sign - \
    --entitlements "$ROOT/entitlements.plist" \
    "$APP"

step "Verify signature"
codesign --verify --deep --strict --verbose=2 "$APP"
codesign -d --entitlements :- "$APP" | sed 's/^/  /'

step "Done"
echo "  $APP"
