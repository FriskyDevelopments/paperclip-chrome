import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { publicEdition } from './corpus.mjs'

test('guide corpus contains no credential blocks', async () => {
  const corpus = JSON.parse(await readFile(new URL('../src/corpus.json', import.meta.url), 'utf8'))
  const patterns = [/-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/, /\bAKIA[A-Z0-9]{16}\b/, /Bearer\s+[A-Za-z0-9_-]{25,}/, /\b(?:sk_live_|ghp_|github_pat_)[A-Za-z0-9_-]{12,}/]
  for (const guide of corpus.guides) {
    for (const pattern of patterns) assert.equal(pattern.test(guide.markdown), false, `Sensitive literal in ${guide.slug}`)
    assert.doesNotMatch(publicEdition(guide.markdown).markdown, /\[REDACTED\]/)
  }
})

test('every guide is original project content', async () => {
  const corpus = JSON.parse(await readFile(new URL('../src/corpus.json', import.meta.url), 'utf8'))
  for (const guide of corpus.guides) assert.match(guide.markdown, /desk/i, guide.slug)
})
