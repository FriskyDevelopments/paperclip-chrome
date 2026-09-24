Same desk, Apple packaging. Toolbar popup today, container app tomorrow.

## The shape

A toolbar-popup build of the desk for Safari — the same loop, the same
STAMP/HALT contract, adapted to Safari's extension model. Version 0.5.0,
staged and ready.

## The container-app note

Safari Web Extensions don't ship as bare zips. Apple wants them inside a
macOS container app distributed through the App Store — the extension payload
rides in the container's extension target, and App Store Connect receives the
archived container, never the raw zip. The payload zip is built and staged;
the thin host container is the remaining scaffold. It is a separate, tiny
host — not the menu-bar desk, which is its own product with its own runbook.

## What to expect

Popup, not side panel — Safari's surface, Safari's rules. Underneath, the
desk behaves identically: local keys, untrusted pages, twelve steps, stamp to
touch, halt to stop. Different frame, same animal.
