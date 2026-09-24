# Paperclip Field Wiki

The FR!sky Paperclip desk manual — doctrine, minds, safety, seats, sidecar,
platform apps, privacy. Served at `friskydev.com/paperclip/wiki*` by the
`paperclip-wiki` worker.

## Engine provenance

Mechanism ported (clean-room) from the MyFenrir canonical wiki engine:
markdown corpus → `sync-guides` index → esbuild static `dist/` → Cloudflare
Worker serving allowlisted assets. Content is 100% original Paperclip writing;
no source-project copy survives in guides, UI, styles, or brand.

## Commands (run inside `wiki/`)

- `npm install` — fresh install
- `npm run build` — sync corpus from `guides/` then render `dist/`
- `npm test` — corpus + privacy + UI + worker tests (node:test)
- `npm run typecheck` — `tsc -p tsconfig.json`

## Content authoring

1. Add or edit a `.md` file in `guides/`.
2. Add its entry to the `META` array in `scripts/sync-guides.mjs`
   (file, slug, index, group, signal, title, description).
3. Run `npm run build` — `src/corpus.json` regenerates from the markdown.
4. Run `npm test` — the corpus test pins guide count and hashes.

Guides stay 150–400 words, doctrine voice: terse, confident, feral.

## Deploy (parent runs this — no credentials from here)

```sh
cd wiki
npm run build
npx wrangler deploy
```

Route: `friskydev.com/paperclip/wiki*` (+ `www.`). Worker name:
`paperclip-wiki`. Only `/`, `/coverage.json`, `/release.json` are served;
everything else 404s. Non-wiki paths pass through to origin.

## Layout

- `guides/` — the 10 markdown sources of truth
- `scripts/` — `corpus.mjs` (redaction helpers), `sync-guides.mjs` (index),
  `build.mjs` (esbuild render), `*.test.mjs` (suite)
- `src/` — `App.tsx`, `Brand.jsx`, `main.tsx`, `tokens.css`, `styles.css`,
  `corpus.json` (generated, committed for reproducible tests)
- `worker.ts` / `wrangler.jsonc` — serve path + zone config
- `public/` / `dist/` — coverage manifest + built output
