import { SectionTitle } from '../components/SectionTitle'
import type { Job, PipelineEntry, Screen } from '../types'

interface Props {
  jobs: Job[]
  pipeline: PipelineEntry[]
  onNavigate: (s: Screen) => void
}

const AGENTS = [
  { num: 'I',   id: 'scrolls'  as Screen, name: 'The Scrolls',    desc: 'Scours the realm for Senior Marshal quests and delivers them to thy inbox.',   icon: <svg width="20" height="20" viewBox="0 0 22 22"><rect x="1" y="1" width="8" height="8" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.15)"/><rect x="13" y="1" width="8" height="8" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.15)"/><rect x="1" y="13" width="8" height="8" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.15)"/><rect x="13" y="13" width="8" height="8" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.15)"/></svg> },
  { num: 'II',  id: 'oracle'   as Screen, name: 'Match Oracle',    desc: 'Scores thy fit against each quest and surfaces keyword gaps.',                  icon: <svg width="20" height="20" viewBox="0 0 22 22"><path d="M11 2L14 8.5L21 9.5L16 14L17.5 21L11 17.5L4.5 21L6 14L1 9.5L8 8.5Z" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.15)"/></svg> },
  { num: 'III', id: 'armoury'  as Screen, name: 'The Armoury',     desc: 'Forges tailored resumes and letters of introduction for each house.',          icon: <svg width="20" height="20" viewBox="0 0 22 22"><path d="M3 17L11 3L19 17M5.5 13H16.5" stroke="#5a3a10" strokeWidth="1.2" fill="none"/></svg> },
  { num: 'IV',  id: 'campaign' as Screen, name: 'The Campaign',    desc: 'Tracks every sworn oath and advises on next actions in the pipeline.',         icon: <svg width="20" height="20" viewBox="0 0 22 22"><path d="M11 2L20 6V13Q20 18.5 11 21Q2 18.5 2 13V6Z" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.12)"/><path d="M7 11L10 14L15 8" stroke="#5a3a10" strokeWidth="1.2" fill="none"/></svg> },
  { num: 'V',   id: 'training' as Screen, name: 'Training Ground', desc: 'Drills thee with mock trials and coaches thy answers before the battle.',     icon: <svg width="20" height="20" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.12)"/><path d="M11 5V11L15 15" stroke="#5a3a10" strokeWidth="1.2" fill="none"/></svg> },
  { num: 'VI',  id: 'ransom'   as Screen, name: 'The Ransom',      desc: 'Analyses offers, benchmarks against the market and forges thy counter.',     icon: <svg width="20" height="20" viewBox="0 0 22 22"><path d="M3 5H19V18H3Z" stroke="#5a3a10" strokeWidth="1.2" fill="rgba(90,58,16,.12)"/><path d="M7 5V3H15V5" stroke="#5a3a10" strokeWidth="1.2" fill="none"/><line x1="3" y1="9" x2="19" y2="9" stroke="#5a3a10" strokeWidth=".8"/></svg> },
]

export function Home({ jobs, pipeline, onNavigate }: Props) {
  const avg = jobs.length
    ? (jobs.reduce((s, j) => s + (+(j.fitScore ?? 0)), 0) / jobs.length).toFixed(1)
    : '—'

  const counts = { scouted: jobs.length, applied: 0, interview: 0, offer: 0 }
  pipeline.forEach(p => {
    const s = (p.status || '').toLowerCase()
    if (s === 'applied')   counts.applied++
    if (s === 'interview') counts.interview++
    if (s === 'offer')     counts.offer++
  })

  return (
    <div className="screen-scroll">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="wb-top">
          <div>
            <div className="wb-greeting">⚔ &nbsp; Welcome, Sir Knight &nbsp; ⚔</div>
            <div className="wb-title">
              Your realm awaits.{jobs.length > 0 ? ` ${jobs.length} quest${jobs.length > 1 ? 's' : ''} scouted.` : ''}
            </div>
            <div className="wb-sub">
              "Thy squire hath scoured the realm. The finest quests stand ready — choose wisely and ride forth to glory."
            </div>
          </div>
          <svg width="68" height="80" viewBox="0 0 72 84" style={{ flexShrink: 0 }}>
            <path d="M36 4L66 16L66 48Q66 70 36 80Q6 70 6 48L6 16Z" fill="#1a0e08" stroke="#c9a030" strokeWidth="2"/>
            <path d="M36 10L60 20L60 48Q60 66 36 74Q12 66 12 48L12 20Z" fill="none" stroke="#c9a030" strokeWidth=".8" opacity=".35"/>
            <rect x="18" y="22" width="36" height="36" fill="none" stroke="#c9a030" strokeWidth="1.2"/>
            <line x1="18" y1="40" x2="54" y2="40" stroke="#c9a030" strokeWidth="1"/>
            <line x1="36" y1="22" x2="36" y2="58" stroke="#c9a030" strokeWidth="1"/>
            <rect x="20" y="24" width="14" height="14" fill="#8a1010"/>
            <rect x="38" y="24" width="14" height="14" fill="#8a1010"/>
            <text x="36" y="77" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="7" fontWeight="700" fill="#1a0e04" letterSpacing="1.5">TPK</text>
          </svg>
        </div>
        <div className="wb-divider" />
        <div className="wb-stats">
          <div className="wb-stat"><div className="wb-stat-n" style={{ color: 'var(--gold3)' }}>{jobs.length || '—'}</div><div className="wb-stat-l">New Quests</div></div>
          <div className="wb-vsep" />
          <div className="wb-stat"><div className="wb-stat-n" style={{ color: 'var(--gold2)' }}>{avg}</div><div className="wb-stat-l">Avg Honour</div></div>
          <div className="wb-vsep" />
          <div className="wb-stat"><div className="wb-stat-n" style={{ color: '#3aaa3a' }}>{counts.applied || '—'}</div><div className="wb-stat-l">Sworn To</div></div>
          <div className="wb-vsep" />
          <div className="wb-stat"><div className="wb-stat-n" style={{ color: 'var(--gold)' }}>{counts.offer || '—'}</div><div className="wb-stat-l">Offer Received</div></div>
          <div className="wb-motto">"Paratus ante pugnam"<br/><span style={{ fontSize: 8, color: 'var(--muted)' }}>Ready before the fight</span></div>
        </div>
      </div>

      {/* Campaign Status */}
      <SectionTitle>Campaign Status</SectionTitle>
      <div className="pipeline-row" style={{ marginBottom: 18 }}>
        <div className="pipe-stage"><div className="ps-n">{counts.scouted}</div><div className="ps-l">Scouted</div></div>
        <div className="pipe-stage"><div className="ps-n" style={{ color: 'var(--gold2)' }}>{counts.applied}</div><div className="ps-l">Applied</div></div>
        <div className="pipe-stage"><div className="ps-n" style={{ color: '#3aaa3a' }}>{counts.interview}</div><div className="ps-l">Interview</div></div>
        <div className="pipe-stage"><div className="ps-n" style={{ color: 'var(--gold)' }}>{counts.offer}</div><div className="ps-l">Offer</div></div>
      </div>

      {/* Agent Roster */}
      <SectionTitle>The Guild — Six Agents at Thy Service</SectionTitle>
      <div className="agent-grid">
        {AGENTS.map((a, i) => (
          <div key={a.id} className="agent-card" onClick={() => onNavigate(a.id)} style={{ animationDelay: `${i * 0.6}s` }}>
            <div className="ac-hl" />
            <div className="ac-corner tl">✦</div><div className="ac-corner tr">✦</div>
            <div className="ac-num">Agent {a.num}</div>
            <div className="ac-icon">{a.icon}</div>
            <div className="ac-name">{a.name}</div>
            <div className="ac-desc">{a.desc}</div>
            <div className="ac-status">
              <div className={`ac-dot ${a.id === 'ransom' ? 'dot-idle' : 'dot-ready'}`} />
              <span style={{ fontSize: 7, color: a.id === 'ransom' ? 'var(--muted)' : '#3aaa3a' }}>
                {a.id === 'scrolls' ? (jobs.length ? `${jobs.length} quests` : 'Empty') :
                 a.id === 'campaign' ? (pipeline.length ? `${pipeline.length} active` : 'Empty') :
                 a.id === 'ransom' ? 'Awaiting offer' : 'Ready'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <div className="qa-row">
        <button className="qa-btn" onClick={() => onNavigate('scrolls')}>Open The Scrolls</button>
        <button className="qa-btn ghost" onClick={() => onNavigate('oracle')}>Consult the Oracle</button>
        <button className="qa-btn ghost" onClick={() => onNavigate('training')}>Training Ground</button>
        <button className="qa-btn ghost" onClick={() => onNavigate('forge')}>n8n Forge Setup</button>
      </div>
    </div>
  )
}
