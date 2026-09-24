import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import corpus from './corpus.json'
import { Wordmark, DeskStage } from './Brand.jsx'
import './tokens.css'
import './styles.css'

const { guides, coverage } = corpus
type Guide = typeof guides[number]
const nav = [['threshold', '00', 'Start here'], ['doctrine', '01', 'Doctrine'], ['library', '02', 'Field guides'], ['safety', '03', 'Safety']] as const
const groups = ['ALL', 'DESK', 'SAFETY', 'ACCESS', 'PLATFORMS']
const indexText = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const searchIndex = new Map(guides.map(g => [g.slug, indexText(`${g.title} ${g.description} ${g.markdown}`)]))

export function SafeMarkdown({ value }: { value: string }) {
  return <div className="markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    a: ({ href, children }) => (/^https?:\/\//.test(href || '') ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span className="local-ref">{children}</span>),
    img: ({ alt }) => <span className="local-ref">{alt || 'Image omitted'}</span>,
    table: ({ children }) => <div className="table-scroll"><table>{children}</table></div>,
  }}>{value}</Markdown></div>
}

function SectionLabel({ n, title, note }: { n: string; title: string; note: string }) {
  return <div className="chapter-label"><span>{n}</span><b>{title}</b><small>{note}</small></div>
}

function Icon({ name = 'arrow' }: { name?: string }) {
  const paths: Record<string, string> = { arrow: 'M4 12h16m-6-6 6 6-6 6', search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', close: 'm5 5 14 14M19 5 5 19', menu: 'M4 6h16M4 12h16M4 18h16', shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4m-5 10 3 3 7-7' }
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.arrow} /></svg>
}

export default function App() {
  const [menu, setMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('ALL')
  const [selection, setSelection] = useState<string | null>(null)
  const modal = useRef<HTMLDivElement>(null)
  const guide = guides.find(g => g.slug === selection)
  const matches = (g: Guide) => indexText(query).trim().split(/\s+/).every(t => searchIndex.get(g.slug)?.includes(t))
  const filtered = useMemo(() => guides.filter(g => (group === 'ALL' || g.group === group) && matches(g)), [query, group])
  const openGuide = (slug: string) => { window.location.hash = `guide/${slug}` }
  const closeReader = () => { history.replaceState(null, '', `${location.pathname}${location.search}#library`); setSelection(null) }

  useEffect(() => {
    function syncHash() {
      const m = location.hash.match(/^#guide\/([a-z0-9-]+)$/)
      setSelection(m && guides.some(g => g.slug === m[1]) ? m[1] : null)
    }
    syncHash()
    addEventListener('hashchange', syncHash)
    return () => removeEventListener('hashchange', syncHash)
  }, [])
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (selection) closeReader(); else setMenu(false) } }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [selection])
  useEffect(() => {
    if (!selection) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modal.current?.querySelector<HTMLElement>('button')?.focus()
    return () => { document.body.style.overflow = prev }
  }, [Boolean(selection)])

  return <div className="app">
    <a className="skip-link" href="#library">Skip to field guides</a>
    <header className="mobile-head"><Wordmark compact /><span className="mobile-release">W/01 · FIELD WIKI</span><button aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'} /></button></header>
    <aside className={menu ? 'rail open' : 'rail'}>
      <div className="rail-brand"><Wordmark compact /><div className="release">PAPERCLIP WIKI <b>W/01</b></div></div>
      <nav aria-label="Wiki chapters">{nav.map(([id, n, label]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}><span>{n}</span>{label}</a>)}</nav>
      <a className="rail-app" href="https://friskydevelopments.github.io/paperclip-chrome/">Get the desk <Icon /></a>
      <div className="rail-foot">{coverage.guideCount} GUIDES · 0.5.0<br /><b>FR!SKY PAPERCLIP</b></div>
    </aside>
    <main>
      <section id="threshold" className="hero-section">
        <div className="hero-copy">
          <div className="micro"><span>PAPERCLIP / FIELD WIKI</span><span>W/01 · 0.5.0</span></div>
          <Wordmark />
          <p className="overline">THE AGENT DESK · FIELD MANUAL</p>
          <h1>Stamp to touch.<br />Halt to <em>stop.</em></h1>
          <p className="hero-lead">The agent desk in your Chrome side panel. Grok or GPT plans up to 12 steps — Clip clicks only after you stamp, and everything dies on HALT.</p>
          <div className="hero-actions"><a className="hot-action" href="#library">OPEN THE GUIDES <Icon /></a><a href="#doctrine">READ THE DOCTRINE <Icon name="shield" /></a></div>
          <div className="proof-strip"><span><b>{guides.length}</b>FIELD GUIDES</span><span><b>12</b>MAX STEPS</span><span><b>2</b>MINDS</span></div>
        </div>
        <DeskStage />
      </section>
      <section id="doctrine" className="chapter doctrine">
        <SectionLabel n="01" title="DOCTRINE" note="WHAT MUST REMAIN TRUE" />
        <div className="doctrine-main">
          <p className="display-quote">“The page is data.<br />You are the <em>instruction.</em>”</p>
          <div className="doctrine-notes"><p>Hands stay holstered until STAMP.</p><p>HALT kills the loop instantly — and disarms the hands for the next run.</p></div>
        </div>
        <div className="principles">
          {[['STAMP', 'Arms the hands.', 'Navigate, click, type — only while stamped. Unstamped HANDS calls are blocked and logged.'], ['HALT', 'Kills everything.', 'Loop, hands, pending steps. One press, instant stop, full log left behind.'], ['UNTRUSTED PAGE', 'Data, never orders.', 'Page text can lie. The desk reports on it; it never obeys it.']].map(([label, title, body], i) => (
            <article key={label}><Icon name="shield" /><span>0{i + 1} / {label}</span><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>
      <section id="library" className="chapter library">
        <SectionLabel n="02" title="FIELD GUIDES" note={`${guides.length} GUIDES · W/01`} />
        <div className="library-head">
          <div><p className="eyebrow">THE COMPLETE DESK MANUAL</p><h2>Know the desk<br />before you <em>run it.</em></h2></div>
          <div className="library-search"><Icon name="search" /><input aria-label="Search field guides" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the guides…" /><span aria-live="polite">{filtered.length}/{guides.length}</span></div>
        </div>
        <div className="group-tabs" aria-label="Filter guides">{groups.map(g => <button className={group === g ? 'active' : ''} aria-pressed={group === g} onClick={() => setGroup(g)} key={g}>{g}</button>)}</div>
        <div className="guide-grid">{filtered.map(g => (
          <button className="guide-card" onClick={() => openGuide(g.slug)} key={g.slug}>
            <div><span>{String(g.index).padStart(2, '0')}</span><em>{g.group}</em></div>
            <b>{g.signal}</b><h3>{g.title}</h3><p>{g.description}</p>
            <div className="card-source">{g.sectionCount} sections · {g.bytes} bytes</div>
            <footer>OPEN FIELD GUIDE <Icon /></footer>
          </button>
        ))}</div>
        {filtered.length === 0 && <div className="empty"><p>No matching guides.</p><button onClick={() => { setQuery(''); setGroup('ALL') }}>Clear search and filters</button></div>}
      </section>
      <section id="safety" className="chapter safety">
        <SectionLabel n="03" title="SAFETY" note="ENFORCED IN CODE" />
        <div className="safety-head"><h2>Twelve steps.<br />One stamp. <em>One halt.</em></h2><p>Keys stay local, pages stay untrusted, the loop can't spin forever. Read 03 STAMP &amp; HALT and 09 PRIVACY, then run the desk like you mean it.</p></div>
        <div className="closing"><Wordmark /><p>STAMP TO TOUCH.<br />HALT TO STOP.</p></div>
      </section>
    </main>
    {selection && guide && <div className="drawer-backdrop" onClick={closeReader}><div className="guide-drawer" role="dialog" aria-modal="true" aria-labelledby="reader-title" ref={modal} onClick={e => e.stopPropagation()}>
      <button className="drawer-close" aria-label="Close guide" onClick={closeReader}><Icon name="close" /></button>
      <div className="drawer-index">FIELD GUIDE / {String(guide.index).padStart(2, '0')} · W/01</div>
      <h2 id="reader-title">{guide.title}</h2>
      <p className="drawer-lead">{guide.description}</p>
      <a className="permalink" href={`#guide/${guide.slug}`}>Permanent link</a>
      <SafeMarkdown value={guide.markdown} />
    </div></div>}
  </div>
}
