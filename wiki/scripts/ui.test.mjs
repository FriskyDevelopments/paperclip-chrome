import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

await mkdir(new URL('../qa/', import.meta.url), { recursive: true })
await build({ entryPoints: [new URL('../src/App.tsx', import.meta.url).pathname], bundle: true, outfile: new URL('../qa/App.mjs', import.meta.url).pathname, platform: 'node', format: 'esm', jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' } })
const { default: App, SafeMarkdown } = await import('../qa/App.mjs')
const { readFile } = await import('node:fs/promises')
const corpus = JSON.parse(await readFile(new URL('../src/corpus.json', import.meta.url), 'utf8'))

test('all 10 guides render without throwing', () => {
  for (const doc of corpus.guides) {
    const markup = renderToStaticMarkup(React.createElement(SafeMarkdown, { value: doc.markdown }))
    assert.ok(markup.length > 100, doc.slug)
    assert.ok(!markup.includes('<script'), 'raw executable HTML is not rendered')
  }
})

test('app renders hero, all guide cards, and search', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://friskydev.com/paperclip/wiki/' })
  const win = dom.window
  for (const name of ['window', 'document', 'HTMLElement', 'location', 'history', 'Event', 'KeyboardEvent']) globalThis[name] = name === 'window' ? win : win[name]
  globalThis.addEventListener = win.addEventListener.bind(win)
  globalThis.removeEventListener = win.removeEventListener.bind(win)
  const { createRoot } = await import('react-dom/client')
  const { act } = React
  const root = createRoot(win.document.getElementById('root'))
  await act(async () => { root.render(React.createElement(App)) })
  const text = win.document.body.textContent
  assert.match(text, /Stamp to touch/)
  for (const guide of corpus.guides) assert.match(text, new RegExp(guide.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.equal(win.document.querySelectorAll('.guide-card').length, 10)
  root.unmount()
})
