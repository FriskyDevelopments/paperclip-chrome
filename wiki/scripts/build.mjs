import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { build } from 'esbuild'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
await mkdir(path.join(root, 'dist'), { recursive: true })
const result = await build({
  entryPoints: [path.join(root, 'src/main.tsx')],
  bundle: true,
  write: false,
  outfile: path.join(root, 'dist/app.js'),
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  loader: { '.json': 'json', '.css': 'css' },
})
const script = result.outputFiles.find(x => x.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script')
const style = result.outputFiles.find(x => x.path.endsWith('.css')).text.replace(/<\/style/gi, '<\\/style')
const html = `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#030708"><meta name="description" content="The FR!sky Paperclip field wiki: doctrine, minds, safety, seats, sidecar, apps, and privacy."><link rel="canonical" href="https://friskydev.com/paperclip/wiki/"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23030708'/%3E%3Cpath d='M11 16 8a4 4 0 0 1 4 4v9a5 5 0 0 1-10 0v-8a3 3 0 0 1 6 0v7' stroke='%23ff334e' stroke-width='2.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"><title>Paperclip — Field Wiki</title><style>${style}</style></head><body><div id="root"></div><script type="module">${script}</script></body></html>`
await writeFile(path.join(root, 'dist/index.html'), html)
await copyFile(path.join(root, 'public', 'coverage.json'), path.join(root, 'dist', 'coverage.json'))
const release = { release: 'W01', builtAt: new Date().toISOString(), sha256: createHash('sha256').update(html).digest('hex'), bytes: Buffer.byteLength(html), guides: 10 }
await writeFile(path.join(root, 'dist/release.json'), JSON.stringify(release, null, 2))
console.log(JSON.stringify(release))
