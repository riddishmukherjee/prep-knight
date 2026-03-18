import { useState } from 'react'
import { StatPlaque } from '../components/StatPlaque'
import { SectionTitle } from '../components/SectionTitle'
import type { Job, PipelineEntry } from '../types'

interface Props {
  pipeline: PipelineEntry[]
  jobs: Job[]
  onMove: (idx: number, status: string) => Promise<void>
  onAdd: (entry: Omit<PipelineEntry, 'addedAt'>) => Promise<void>
}

const STAGES = ['Scouted', 'Applied', 'Interview', 'Offer']
const NEXT_ACTION: Record<string, string> = {
  Scouted:   'Research the house',
  Applied:   'Follow up in 7 days',
  Interview: 'Send thank-you note',
  Offer:     'Consult the Ransom Oracle',
}

function statusClass(s: string): string {
  const l = s.toLowerCase()
  if (l === 'scouted')   return 's-new'
  if (l === 'applied')   return 's-applied'
  if (l === 'interview') return 's-interview'
  if (l === 'offer')     return 's-saved'
  return 's-new'
}

export function Campaign({ pipeline, onMove, onAdd }: Props) {
  const [company, setCompany] = useState('')
  const [role,    setRole]    = useState('')
  const [status,  setStatus]  = useState('Scouted')
  const [adding,  setAdding]  = useState(false)

  const counts = { scouted: 0, applied: 0, interview: 0, offer: 0 }
  pipeline.forEach(p => {
    const s = (p.status || '').toLowerCase()
    if (s in counts) counts[s as keyof typeof counts]++
  })
  const responseRate = counts.applied > 0
    ? Math.round(((counts.interview + counts.offer) / counts.applied) * 100)
    : 0

  async function handleAdd() {
    if (!company || !role) return
    setAdding(true)
    await onAdd({ title: role, company, status })
    setCompany(''); setRole(''); setStatus('Scouted')
    setAdding(false)
  }

  return (
    <div className="screen-scroll">
      {/* Stat plaques */}
      <div className="stat-row">
        <StatPlaque value={pipeline.length || '—'} label="Total Applications" colour="var(--parch3)" />
        <StatPlaque value={counts.interview || '—'} label="Interviews"        colour="#3aaa3a" />
        <StatPlaque value={counts.offer || '—'}     label="Offers"            colour="var(--gold2)" />
        <StatPlaque value={`${responseRate}%`}      label="Response Rate"     colour="var(--gold)" />
      </div>

      <SectionTitle>Campaign Pipeline</SectionTitle>

      {/* Parchment table with torn edges */}
      <div className="parch-torn camp-table-wrap">
        {pipeline.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-title">No Oaths Sworn</div>
            Add a quest to thy campaign below.
          </div>
        ) : (
          <table className="camp-table">
            <thead>
              <tr>
                <th>House & Quest</th>
                <th>Status</th>
                <th>Next Action</th>
                <th>Honour</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.map((p, idx) => {
                const stage = p.status || 'Scouted'
                const stageIdx = STAGES.indexOf(stage)
                const next = STAGES[stageIdx + 1]
                const prev = STAGES[stageIdx - 1]
                return (
                  <tr key={idx}>
                    <td>
                      <div className="td-company">{p.company}</div>
                      <div style={{ fontSize: 11, fontFamily: 'IM Fell English,serif', color: 'var(--ink)', fontStyle: 'italic' }}>{p.title}</div>
                    </td>
                    <td><span className={`status-bdg ${statusClass(stage)}`}>{stage}</span></td>
                    <td><div className="td-next">{NEXT_ACTION[stage] || '—'}</div></td>
                    <td style={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 13, color: 'var(--gold2)' }}>
                      {p.fitScore || '—'}
                    </td>
                    <td>
                      <div className="td-actions">
                        {next && <button className="camp-btn" onClick={() => onMove(idx, next)}>→ {next}</button>}
                        {prev && <button className="camp-btn ghost" onClick={() => onMove(idx, prev)}>← {prev}</button>}
                        {p.url && <a href={p.url} target="_blank" rel="noreferrer"><button className="camp-btn ghost">Apply</button></a>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Application form */}
      <SectionTitle>Add to Campaign</SectionTitle>
      <div className="stone-block">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">House (Company)</label>
            <input className="dark-input" placeholder="e.g. Stripe" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Quest (Role)</label>
            <input className="dark-input" placeholder="e.g. Senior PM" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Status</label>
            <select className="parch-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn-crimson" onClick={handleAdd} disabled={adding}>
            {adding ? '…' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
