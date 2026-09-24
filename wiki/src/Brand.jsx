// Paperclip mark — inline SVG wordmark + desk stage. Clean-room brand.
export function Wordmark({ compact = false }) {
  return (
    <svg className={compact ? 'wordmark compact' : 'wordmark'} viewBox="0 0 560 120" aria-label="FR!sky Paperclip" role="img">
      <rect x="6" y="14" width="92" height="92" rx="18" fill="#0b1214" stroke="#ff334e" strokeWidth="4" />
      <path d="M38 78V48a12 12 0 0 1 24 0v36a16 16 0 0 1-32 0V56a9 9 0 0 1 18 0v26" stroke="#b8ff3c" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text x="116" y="72" fill="#f4fbf8" fontFamily="'Barlow Condensed',Arial,sans-serif" fontSize="52" fontWeight="800" letterSpacing="2">FR!SKY</text>
      <text x="116" y="104" fill="none" stroke="#ff6b7a" strokeWidth="1.4" fontFamily="'Barlow Condensed',Arial,sans-serif" fontSize="34" fontWeight="700" letterSpacing="10">PAPERCLIP</text>
    </svg>
  )
}

export function DeskStage() {
  return (
    <div className="desk-stage" aria-label="The agent desk at work">
      <div className="scan scan-a" />
      <div className="scan scan-b" />
      <div className="desk-mock">
        <div className="desk-mock-bar"><i /><i /><i /><span>AGENT DESK · 0.5.0</span><b>STAMPED</b></div>
        {[['PLAN', '12 steps max', 'ready'], ['READ', 'active tab snapshot', 'done'], ['HANDS', 'click · gated by STAMP', 'armed'], ['HALT', 'kills the loop', 'idle']].map(([k, v, s]) => (
          <div className={`desk-mock-row row-${s}`} key={k}><time>{k}</time><i /><div><b>{v}</b></div><em>{s.toUpperCase()}</em></div>
        ))}
      </div>
    </div>
  )
}
