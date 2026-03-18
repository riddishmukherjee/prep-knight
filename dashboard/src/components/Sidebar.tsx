import { FireTorch } from './FireTorch'
import type { Screen } from '../types'

interface Props {
  active: Screen
  onNavigate: (s: Screen) => void
  jobCount: number
  lastSynced: Date | null
  syncing: boolean
  onSync: () => void
}

const NAV_REALM: { id: Screen; label: string; icon: React.ReactNode; badge?: boolean }[] = [
  {
    id: 'scrolls', label: 'The Scrolls', badge: true,
    icon: <svg className="n-ico" viewBox="0 0 13 13"><rect x="1" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth=".9" fill="none"/><rect x="7.5" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth=".9" fill="none"/><rect x="1" y="7.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth=".9" fill="none"/><rect x="7.5" y="7.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth=".9" fill="none"/></svg>,
  },
  {
    id: 'campaign', label: 'The Campaign',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><path d="M6.5 1L9 5.5L13 6L10 9L11 13L6.5 10.5L2 13L3 9L0 6L4 5.5Z" stroke="currentColor" strokeWidth=".8" fill="none"/></svg>,
  },
]

const NAV_GUILD: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: 'oracle', label: 'Match Oracle',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><path d="M6.5 1.5L12 4.5V9L6.5 12L1 9V4.5Z" stroke="currentColor" strokeWidth=".8" fill="none"/></svg>,
  },
  {
    id: 'armoury', label: 'The Armoury',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><path d="M2 9.5L6.5 1.5L11 9.5M3.5 7H9.5" stroke="currentColor" strokeWidth=".9" fill="none"/></svg>,
  },
  {
    id: 'training', label: 'Training Ground',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth=".8" fill="none"/><path d="M6.5 3.5V6.5L9 9" stroke="currentColor" strokeWidth=".9" fill="none"/></svg>,
  },
  {
    id: 'ransom', label: 'The Ransom',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><path d="M2 3.5H11V11H2Z" stroke="currentColor" strokeWidth=".8" fill="none"/><path d="M4.5 3.5V2H8.5V3.5" stroke="currentColor" strokeWidth=".8" fill="none"/></svg>,
  },
  {
    id: 'forge', label: 'n8n Forge',
    icon: <svg className="n-ico" viewBox="0 0 13 13"><path d="M6.5 1.5L2 4V8Q2 11.5 6.5 13Q11 11.5 11 8V4Z" stroke="currentColor" strokeWidth=".8" fill="none"/></svg>,
  },
]

function lastScoutedLabel(d: Date | null, syncing: boolean): string {
  if (syncing) return 'Scouting the realm…'
  if (!d) return 'Not yet scouted'
  const diff = Date.now() - d.getTime()
  if (diff < 60000)   return 'Last scouted — just now'
  if (diff < 3600000) return `Last scouted — ${Math.floor(diff / 60000)}m ago`
  return `Last scouted — ${Math.floor(diff / 3600000)}h ago`
}

export function Sidebar({ active, onNavigate, jobCount, lastSynced, syncing, onSync }: Props) {
  return (
    <nav className="sidebar">
      <div className="sb-frame" />
      <div className="sb-glow" />

      {/* Brand */}
      <div className="sb-brand">
        <svg width="34" height="40" viewBox="0 0 36 42" style={{ flexShrink: 0 }}>
          <path d="M18 2L33 8L33 24Q33 35 18 40Q3 35 3 24L3 8Z" fill="#1a0e08" stroke="#c9a030" strokeWidth="1.5"/>
          <path d="M18 6L29 11L29 24Q29 32 18 36Q7 32 7 24L7 11Z" fill="none" stroke="#c9a030" strokeWidth=".5" opacity=".4"/>
          <rect x="10" y="13" width="16" height="16" fill="none" stroke="#c9a030" strokeWidth=".8"/>
          <line x1="10" y1="21" x2="26" y2="21" stroke="#c9a030" strokeWidth=".7"/>
          <line x1="18" y1="13" x2="18" y2="29" stroke="#c9a030" strokeWidth=".7"/>
          <rect x="12" y="15" width="4" height="4" fill="#8a1010"/>
          <rect x="20" y="15" width="4" height="4" fill="#8a1010"/>
          <text x="18" y="38" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="4" fontWeight="700" fill="#1a0e04" letterSpacing="1">TPK</text>
        </svg>
        <div>
          <div className="brand-name">The Prep<br/>Knight</div>
          <div className="brand-sub">Paratus ante pugnam</div>
        </div>
        <div className="sb-torch-wrap">
          <FireTorch width={36} height={52} seed={0} cupW={10} cupH={6} bodyW={6} bodyH={14} />
        </div>
      </div>

      <div className="sb-banner">⚔ Open Quests: {jobCount || '—'} ⚔</div>

      {/* Home nav item */}
      <div className="nav-sec">The Realm</div>
      <div
        className={`nav-item${active === 'home' ? ' active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <svg className="n-ico" viewBox="0 0 13 13"><path d="M6.5 2L11 5V11H8.5V8H4.5V11H2V5Z" stroke="currentColor" strokeWidth=".9" fill="none"/></svg>
        Command Post
      </div>
      {NAV_REALM.map(n => (
        <div key={n.id} className={`nav-item${active === n.id ? ' active' : ''}`} onClick={() => onNavigate(n.id)}>
          {n.icon}
          {n.label}
          {n.badge && jobCount > 0 && <span className="nav-bdg">{jobCount}</span>}
        </div>
      ))}

      <div className="nav-sep" />
      <div className="nav-sec">The Guild</div>
      {NAV_GUILD.map(n => (
        <div key={n.id} className={`nav-item${active === n.id ? ' active' : ''}`} onClick={() => onNavigate(n.id)}>
          {n.icon}
          {n.label}
        </div>
      ))}

      {/* Footer */}
      <div className="sb-foot">
        <div className="sb-foot-lbl">{lastScoutedLabel(lastSynced, syncing)}</div>
        <button className="sb-btn" onClick={onSync} disabled={syncing}>
          {syncing ? '⏳ Scouting…' : '⚔ Scout the Realm'}
        </button>
      </div>
    </nav>
  )
}
