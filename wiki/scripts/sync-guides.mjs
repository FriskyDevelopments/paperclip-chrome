import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { publicEdition, headings, hash } from './corpus.mjs'

const root = path.resolve(import.meta.dirname, '..')
const guidesDir = path.join(root, 'guides')

const META = [
  { file: '00-start-here.md', slug: 'start-here', index: 0, group: 'DESK', signal: 'START', title: 'Start here', description: 'What the desk is, in thirty seconds.' },
  { file: '01-doctrine.md', slug: 'doctrine', index: 1, group: 'DESK', signal: 'CREED', title: 'Doctrine', description: 'STAMP, HALT, and the untrusted-page rule.' },
  { file: '02-minds.md', slug: 'minds', index: 2, group: 'DESK', signal: 'MINDS', title: 'Minds', description: 'Grok vs GPT, and why keys stay local.' },
  { file: '03-stamp-halt.md', slug: 'stamp-halt', index: 3, group: 'SAFETY', signal: 'STAMP', title: 'Stamp & Halt', description: 'The safety story, enforced in code.' },
  { file: '04-seats-keys.md', slug: 'seats-keys', index: 4, group: 'ACCESS', signal: 'SEATS', title: 'Seats & Keys', description: 'FRSKY-PC format and the Whop-to-email flow.' },
  { file: '05-sidecar.md', slug: 'sidecar', index: 5, group: 'DESK', signal: 'LOCAL', title: 'Sidecar', description: 'Localhost snapshots with graceful degrade.' },
  { file: '06-mac-app.md', slug: 'mac-app', index: 6, group: 'PLATFORMS', signal: 'MAC', title: 'Mac app', description: 'Menu-bar desk, hotkey, sandbox note.' },
  { file: '07-windows-app.md', slug: 'windows-app', index: 7, group: 'PLATFORMS', signal: 'WIN', title: 'Windows app', description: 'WinUI desk and the Store path.' },
  { file: '08-safari.md', slug: 'safari', index: 8, group: 'PLATFORMS', signal: 'SAFARI', title: 'Safari', description: 'Popup port and the container-app note.' },
  { file: '09-privacy.md', slug: 'privacy', index: 9, group: 'SAFETY', signal: 'PROOF', title: 'Privacy', description: 'What the desk touches, in plain words.' },
]

const files = await readdir(guidesDir)
const guides = []
for (const meta of META) {
  if (!files.includes(meta.file)) throw new Error(`Missing guide source: ${meta.file}`)
  const raw = await readFile(path.join(guidesDir, meta.file), 'utf8')
  const edition = publicEdition(raw)
  guides.push({
    ...meta,
    source: `guides/${meta.file}`,
    markdown: edition.markdown,
    sectionCount: headings(edition.markdown).length,
    sourceHash: hash(raw),
    publicHash: hash(edition.markdown),
    bytes: Buffer.byteLength(raw),
  })
}

const coverage = {
  release: 'W01',
  generatedAt: new Date().toISOString(),
  guideCount: guides.length,
  guideIds: guides.map(g => g.slug),
  groups: [...new Set(guides.map(g => g.group))],
}

await mkdir(path.join(root, 'src'), { recursive: true })
await mkdir(path.join(root, 'public'), { recursive: true })
await writeFile(path.join(root, 'src/corpus.json'), JSON.stringify({ guides, coverage }))
await writeFile(path.join(root, 'public/coverage.json'), JSON.stringify(coverage, null, 2) + '\n')
console.log(`[corpus] ${guides.length}/10 guides synced`)
