import { useState } from 'react'
import { ShieldScore } from '../components/ShieldScore'
import { StatPlaque } from '../components/StatPlaque'
import { SectionTitle } from '../components/SectionTitle'
import type { Job, PipelineEntry } from '../types'

interface Props {
  jobs: Job[]
  onAddToPipeline: (entry: Omit<PipelineEntry, 'addedAt'>) => Promise<void>
  onLoadOracle: (job: Job) => void
  onLoadArmoury: (job: Job) => void
  onSync: () => void
}

type Tab    = 'all' | 'new' | 'saved' | 'sworn' | 'rejected'
type Filter = 'all' | 'senior' | 'director' | 'vp'

function formatDate(d?: string): string {
  if (!d) return ''
  try {
    const dt = new Date(d), diff = Date.now() - dt.getTime()
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch { return d }
}

function statusClass(s?: string): string {
  if (!s || s === 'new') return 's-new'
  if (s === 'saved')     return 's-saved'
  if (s === 'applied')   return 's-applied'
  if (s === 'interview') return 's-interview'
  if (s === 'rejected')  return 's-rejected'
  return 's-new'
}
function statusLabel(s?: string): string {
  if (!s || s === 'new') return 'New'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Modal ─────────────────────────────────────────────
interface ModalProps {
  jobs: Job[]
  initialIdx: number
  onClose: () => void
  onSwear: (job: Job) => void
  onOracle: (job: Job) => void
  onForge: (job: Job) => void
}

function JobModal({ jobs, initialIdx, onClose, onSwear, onOracle, onForge }: ModalProps) {
  const [idx, setIdx] = useState(initialIdx)
  const job = jobs[idx]
  if (!job) return null
  const score = +(job.fitScore ?? 0)
  const tier = score >= 8 ? '#3aaa3a' : score >= 6 ? '#d4a835' : '#c83030'
  const missing = Array.isArray(job.missingKeywords)
    ? job.missingKeywords
    : job.missingKeywords ? [job.missingKeywords] : []

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-civ" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mc-header">
          <span className="mc-ornament">❧</span>
          <span className="mc-title">Quest Briefing</span>
          <span className="mc-ornament">❧</span>
          <button className="mc-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="mc-body">
          {/* Quest list */}
          <div className="mc-quest-list">
            {jobs.map((j, i) => {
              const s = +(j.fitScore ?? 0)
              const c = s >= 8 ? '#3aaa3a' : s >= 6 ? '#d4a835' : '#c83030'
              return (
                <div key={i} className={`mql-item${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)}>
                  <svg width="22" height="26" viewBox="0 0 22 26">
                    <path d="M11 1L20 4.5L20 13Q20 20 11 24Q2 20 2 13L2 4.5Z" fill="#1a0e08" stroke={c} strokeWidth="1.2"/>
                    <text x="11" y="17" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="8" fontWeight="900" fill={c}>{s}</text>
                  </svg>
                  <div>
                    <div className="mql-company">{j.company || 'Unknown House'}</div>
                    <div className="mql-title">{(j.title || 'Untitled').slice(0, 32)}{(j.title?.length ?? 0) > 32 ? '…' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="mc-detail">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div className="mc-detail-meta">{job.company} · {job.location || 'Remote'} · {job.source || ''}</div>
                <div className="mc-detail-title">{job.title}</div>
              </div>
              <ShieldScore score={score} size="lg" />
            </div>

            {/* Score bars */}
            <div className="score-bars">
              {[['Overall Fit', score], ['Experience', Math.min(10, score + 0.5)], ['Domain', Math.max(1, score - 0.5)], ['Skills', Math.min(10, score + 1)]].map(([label, val]) => {
                const v = +(val as number).toFixed(0)
                const fill = v >= 8 ? '#3aaa3a' : v >= 6 ? '#d4a835' : 'var(--crimson3)'
                return (
                  <div key={label as string} className="score-bar-row">
                    <div className="sb-label">{label as string}</div>
                    <div className="sb-track"><div className="sb-fill" style={{ width: `${v * 10}%`, background: fill }} /></div>
                    <div className="sb-val">{v}</div>
                  </div>
                )
              })}
            </div>

            {/* Oracle reason */}
            {job.topReason && (
              <div className="oracle-verdict" style={{ marginBottom: 12 }}>"{job.topReason}"</div>
            )}

            {/* Gap pills */}
            {missing.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--crimson3)', fontFamily: 'Cinzel,serif', marginBottom: 5 }}>Missing Keywords</div>
                <div className="gaps-row">
                  {missing.map(k => <span key={k} className="jc-tag flag-crimson">{k}</span>)}
                </div>
              </div>
            )}

            {/* Notes textarea */}
            <div>
              <label className="input-label">Quest Notes</label>
              <textarea className="parch-input" rows={3} placeholder="Record thy thoughts on this quest…" style={{ background: 'rgba(90,58,16,.06)', border: '1px solid rgba(196,146,42,.3)' }} />
            </div>

            {/* Honour score badge */}
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <svg width="14" height="16" viewBox="0 0 14 16">
                <path d="M7 1L13 3.5L13 8Q13 13 7 15Q1 13 1 8L1 3.5Z" fill="rgba(0,0,0,.2)" stroke={tier} strokeWidth="1"/>
                <text x="7" y="10.5" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="6" fontWeight="900" fill={tier}>{score}</text>
              </svg>
              <span style={{ fontSize: 9, color: 'var(--ink2)', fontFamily: 'IM Fell English,serif', fontStyle: 'italic' }}>
                Honour score · {job.seniority || 'Unknown rank'} · Published {formatDate(job.publishedAt || job.addedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mc-footer">
          {job.url && <a href={job.url} target="_blank" rel="noreferrer"><button className="btn-ghost btn-sm">Apply →</button></a>}
          <button className="btn-ghost btn-sm" onClick={() => { onOracle(job); onClose() }}>Consult Oracle</button>
          <button className="btn-ghost btn-sm" onClick={() => { onForge(job); onClose() }}>Forge Letter</button>
          <button className="btn-crimson btn-sm" onClick={() => { onSwear(job); onClose() }}>⚔ Swear Oath</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ────────────────────────────────────────
export function Scrolls({ jobs, onAddToPipeline, onLoadOracle, onLoadArmoury, onSync }: Props) {
  const [tab, setTab]       = useState<Tab>('all')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [modalIdx, setModalIdx] = useState<number | null>(null)

  const filtered = jobs.filter(j => {
    if (tab === 'new')      return !j.status || j.status === 'new'
    if (tab === 'saved')    return j.status === 'saved'
    if (tab === 'sworn')    return j.status === 'applied' || j.status === 'interview'
    if (tab === 'rejected') return j.status === 'rejected'
    return true
  }).filter(j => {
    if (filter === 'senior')   return /senior|lead/i.test(j.seniority || j.title || '')
    if (filter === 'director') return /director/i.test(j.seniority || j.title || '')
    if (filter === 'vp')       return /vp|vice|head/i.test(j.seniority || j.title || '')
    return true
  }).filter(j =>
    !search || [j.title, j.company, j.location].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const avg = jobs.length ? (jobs.reduce((s, j) => s + (+(j.fitScore ?? 0)), 0) / jobs.length).toFixed(1) : '—'
  const newCount = jobs.filter(j => !j.status || j.status === 'new').length

  async function handleSwear(job: Job) {
    await onAddToPipeline({ title: job.title || '', company: job.company || '', url: job.url, fitScore: job.fitScore, status: 'Scouted' })
  }

  return (
    <>
      <div className="tab-bar">
        {(['all', 'new', 'saved', 'sworn', 'rejected'] as Tab[]).map(t => (
          <div key={t} className={`tab-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All Quests' : t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <button className="btn-ghost btn-sm" onClick={onSync}>↺ Sync Now</button>
        </div>
      </div>

      <div className="screen-scroll">
        {/* Stat plaques */}
        <div className="stat-row">
          <StatPlaque value={jobs.length || '—'} label="Total Quests"   colour="var(--gold3)" />
          <StatPlaque value={newCount || '—'}    label="New Today"       colour="var(--parch3)" />
          <StatPlaque value={avg}                label="Avg Honour"      colour="var(--gold2)" />
          <StatPlaque value={jobs.filter(j => j.flag && j.flag !== 'none').length || '—'} label="Flagged" colour="var(--crimson3)" />
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="toolbar-search"
            placeholder="Search quests, houses, locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-pills">
            {([['all', 'All'], ['senior', 'Senior Knight'], ['director', 'Director'], ['vp', 'VP+']] as [Filter, string][]).map(([f, l]) => (
              <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{l}</button>
            ))}
          </div>
        </div>

        <SectionTitle>
          {filtered.length > 0 ? `${filtered.length} Quest${filtered.length > 1 ? 's' : ''} Found` : 'Quests'}
        </SectionTitle>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">The Scrolls are Empty</div>
            Thy squire hath found no quests. Click Sync to summon them.
          </div>
        ) : (
          <div className="job-grid">
            {filtered.map((job, i) => {
              const score = +(job.fitScore ?? 0)
              const missing = Array.isArray(job.missingKeywords)
                ? job.missingKeywords.slice(0, 3)
                : job.missingKeywords ? [job.missingKeywords] : []
              const flag = job.flag && job.flag !== 'none' ? job.flag.replace(/_/g, ' ') : ''
              const realIdx = jobs.indexOf(job)

              return (
                <div key={i} className="job-card" onClick={() => setModalIdx(realIdx)}>
                  <div className="jc-hl" />
                  <div className="jc-corner tl">✦</div>
                  <div className="jc-corner tr">✦</div>
                  <div className="jc-corner bl">✦</div>
                  <div className="jc-corner br">✦</div>
                  <div className="jc-shield"><ShieldScore score={score} size="md" /></div>
                  <div className="jc-company">{job.company || 'Unknown House'}</div>
                  <div className="jc-title">{job.title || 'Untitled Quest'}</div>
                  <div className="jc-meta">{[job.location, job.source, formatDate(job.publishedAt || job.addedAt)].filter(Boolean).join(' · ')}</div>
                  {job.topReason && <div className="jc-reason">"{job.topReason}"</div>}
                  <div className="jc-tags">
                    {job.seniority && <span className="jc-tag">{job.seniority}</span>}
                    {flag && <span className="jc-tag flag-crimson">{flag}</span>}
                    {missing.map(k => <span key={k} className="jc-tag flag-crimson">{k}</span>)}
                  </div>
                  <div className="jc-footer" onClick={e => e.stopPropagation()}>
                    <span className={`status-bdg ${statusClass(job.status)}`}>{statusLabel(job.status)}</span>
                    <button className="btn-ghost btn-sm" onClick={() => { onLoadArmoury(job) }}>Forge</button>
                    <button className="btn-crimson btn-sm" onClick={() => handleSwear(job)}>⚔ Swear Oath</button>
                    {job.url && <a href={job.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}><button className="btn-ghost btn-sm">Apply →</button></a>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalIdx !== null && (
        <JobModal
          jobs={jobs}
          initialIdx={modalIdx}
          onClose={() => setModalIdx(null)}
          onSwear={handleSwear}
          onOracle={onLoadOracle}
          onForge={onLoadArmoury}
        />
      )}
    </>
  )
}
