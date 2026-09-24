import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { publicEdition, headings, hash } from './corpus.mjs'

test('publicEdition redacts secret-shaped values without eating chapters', () => {
  const raw = '# Setup\nToken: sk_live_abcdefghijklmnopqrstu\n## Done\nOK with eyJhbGciOiJIUzI1NiJ9.cGF5bG9hZA.c2lnbmF0dXJlCg content.'
  const { markdown } = publicEdition(raw)
  assert.doesNotMatch(markdown, /sk_live_abcdefghijklmnopqrstu|eyJhbGciOi/)
  assert.deepEqual(headings(markdown).map(x => x.title), ['Setup', 'Done'])
})

test('all 10 guide sources sync into a verifiable corpus', () => {
  const { guides, coverage } = JSON.parse(readFileSync(new URL('../src/corpus.json', import.meta.url)))
  assert.equal(guides.length, 10)
  assert.equal(coverage.guideCount, 10)
  assert.equal(new Set(guides.map(g => g.slug)).size, 10)
  for (const g of guides) {
    assert.ok(g.markdown.length > 200, g.slug)
    assert.equal(hash(g.markdown), g.publicHash)
    assert.ok(g.sectionCount >= 1)
  }
  assert.deepEqual(coverage.guideIds, guides.map(g => g.slug))
})
