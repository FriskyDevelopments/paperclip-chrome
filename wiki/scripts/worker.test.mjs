import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { build } from 'esbuild'

await mkdir(new URL('../qa/', import.meta.url), { recursive: true })
await build({ entryPoints: [new URL('../worker.ts', import.meta.url).pathname], bundle: true, outfile: new URL('../qa/worker.mjs', import.meta.url).pathname, platform: 'node', format: 'esm' })
const { default: worker } = await import('../qa/worker.mjs')
const origin = 'https://friskydev.com'

test('canonical redirects and allowlisted assets do not expose other files', async () => {
  const calls = []
  const env = { ASSETS: { fetch: async request => { calls.push(request); return new Response('wiki') } } }
  for (const path of ['/paperclip/wiki', '/paperclip/wiki/index.html']) {
    const r = await worker.fetch(new Request(origin + path + '?v=W01'), env)
    assert.equal(r.status, 308)
    assert.equal(r.headers.get('location'), origin + '/paperclip/wiki/?v=W01')
  }
  for (const path of ['/paperclip/wiki/', '/paperclip/wiki/coverage.json', '/paperclip/wiki/release.json']) {
    const r = await worker.fetch(new Request(origin + path, { headers: { Cookie: 'synthetic=not-forwarded' } }), env)
    assert.equal(r.status, 200)
    assert.equal(r.headers.get('x-paperclip-wiki-release'), 'W01')
    assert.equal(calls.at(-1).headers.has('Cookie'), false)
  }
  assert.equal((await worker.fetch(new Request(origin + '/paperclip/wiki/live-audit.json'), env)).status, 404)
  assert.equal((await worker.fetch(new Request(origin + '/paperclip/wiki/', { method: 'POST' }), env)).status, 405)
})

test('non-wiki routes pass through and asset failure is controlled', async () => {
  const original = globalThis.fetch
  const paths = []
  globalThis.fetch = async request => { paths.push(new URL(request.url).pathname); return new Response('app-origin') }
  try {
    for (const path of ['/', '/paperclip/', '/api/health', '/wikipedia']) {
      const r = await worker.fetch(new Request(origin + path), {})
      assert.equal(await r.text(), 'app-origin')
    }
    assert.equal(paths.length, 4)
  } finally { globalThis.fetch = original }
  const r = await worker.fetch(new Request(origin + '/paperclip/wiki/'), { ASSETS: { fetch: async () => { throw new Error('synthetic failure') } } })
  assert.equal(r.status, 503)
  assert.equal(r.headers.get('cache-control'), 'no-store')
})
