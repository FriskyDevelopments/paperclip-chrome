import { createHash } from 'node:crypto'
export const hash = value => createHash('sha256').update(value).digest('hex')

export function headings(markdown) {
  const out = []
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const m = line.match(/^(#{1,6})\s+(.+)$/)
    if (m) out.push({ level: m[1].length, title: m[2].trim() })
  }
  return out
}

const SECRET_PATTERNS = [
  /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9]+ )*PRIVATE KEY-----/g,
  /\b(?:sk_live_|sk_test_|rk_live_|whsec_|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{12,}/g,
  /\b\d{7,13}:[A-Za-z0-9_-]{30,}\b/g,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
]

export function publicEdition(markdown) {
  let redactions = 0
  let out = markdown
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, () => { redactions++; return '[REDACTED]' })
  }
  return { markdown: out.trim(), redactions }
}
