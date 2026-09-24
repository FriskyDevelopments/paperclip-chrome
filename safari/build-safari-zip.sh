#!/usr/bin/env bash
# Build dist/frisky-paperclip-<version>-safari.zip from safari/ contents only.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAFARI_DIR="$ROOT/safari"
DIST_DIR="$ROOT/dist"
MANIFEST="$SAFARI_DIR/manifest.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required (brew install jq)" >&2
  exit 1
fi

VERSION="$(jq -r '.version' "$MANIFEST")"
if [[ -z "$VERSION" || "$VERSION" == "null" ]]; then
  echo "error: could not read version from $MANIFEST" >&2
  exit 1
fi

ZIP_NAME="frisky-paperclip-${VERSION}-safari.zip"
mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"

(
  cd "$SAFARI_DIR"
  zip -r -X "$DIST_DIR/$ZIP_NAME" . \
    -x '.*' -x '*/.*' -x 'node_modules/*' -x '*.map' \
    -x 'build-safari-zip.sh' -x 'README.md'
)

echo "built $DIST_DIR/$ZIP_NAME"
