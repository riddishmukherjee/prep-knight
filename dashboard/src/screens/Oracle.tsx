import { useState, useEffect } from 'react'
import { useClaude } from '../hooks/useClaude'
import { SectionTitle } from '../components/SectionTitle'
import type { Job, OracleResult } from '../types'

interface Props {
  preloadJob: Job | null
  onClearPreload: () => void
}

export function Oracle({ preloadJob, onClearPreload }: Props) {
  const [jd,     setJd]     = useState('')
  const [resume, setResume] = useState('')
  const [result, setResult] = useState<OracleResult | null>(null)
  const [verdict, setVerdict] = useState('')
  const { loading, error, call } = useClaude()

  useEffect(() => {
    if (preloadJob) {
      setJd([
        preloadJob.title && `Role: ${preloadJob.title}`,
        preloadJob.company && `Company: ${preloadJob.company}`,
        preloadJob.description,
      ].filter(Boolean).join('\n\n'))
      onClearPreload()
    }
  }, [preloadJob, onClearPreload])

  async function runOracle() {
    if (!jd.trim()) { alert('Paste a job description first.'); return }
    setResult(null); setVerdict('')
    const prompt = `You are a senior career coach. Analyse the candidate fit for this job.

${resume.trim() ? `CANDIDATE CV / BACKGROUND:\n${resume}\n\n` : ''}JOB DESCRIPTION:
${jd}

Return ONLY valid JSON (no markdown, no prose):
{
  "overall_score": 1-10,
  "technical_score": 1-10,
  "experience_score": 1-10,
  "domain_score": 1-10,
  "soft_skills_score": 1-10,
  "verdict": "2-3 sentence honest assessment",
  "strengths": ["s1","s2","s3"],
  "gaps": ["g1","g2","g3"],
  "missing_keywords": ["k1","k2","k3","k4"],
  "recommendation": "Apply / Apply with tailoring / Skip"
}`
    try {
      const text = await call(prompt)
      const json: OracleResult = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
      setResult(json)
      setVerdict(
        `Recommendation: ${json.recommendation}\n\n${json.verdict}\n\nStrengths:\n${json.strengths.map(s => `• ${s}`).join('\n')}\n\nGaps:\n${json.gaps.map(g => `• ${g}`).join('\n')}`
      )
    } catch { /* error shown via useClaude */ }
  }

  const go = result && result.overall_score >= 7

  return (
    <div className="screen-scroll">
      <SectionTitle>Match Oracle — Consult thy Fit</SectionTitle>

      {/* Two stone blocks */}
      <div className="two-panel" style={{ marginBottom: 14 }}>
        <div className="stone-block">
          <div className="panel-label">The Quest Scroll</div>
          <textarea
            className="dark-input"
            rows={12}
            placeholder="Paste the full job description here…"
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
        </div>
        <div className="stone-block">
          <div className="panel-label">Thy Battle Record</div>
          <textarea
            className="dark-input"
            rows={12}
            placeholder="Paste thy CV or background summary (optional)…"
            value={resume}
            onChange={e => setResume(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-crimson w-full" onClick={runOracle} disabled={loading} style={{ marginBottom: 18 }}>
        {loading ? 'The Oracle consults…' : 'Consult the Oracle ↗'}
      </button>

      {/* Results parchment */}
      {(result || loading || error) && (
        <div className="parch-torn" style={{ marginTop: 8 }}>
          {loading && (
            <div style={{ fontFamily: 'IM Fell English,serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              The Oracle consults…
            </div>
          )}
          {error && (
            <div style={{ color: 'var(--crimson)', fontFamily: 'IM Fell English,serif', fontStyle: 'italic', fontSize: 13 }}>
              The Oracle could not be reached — check thy API key.<br/>
              <small style={{ opacity: 0.7, fontSize: 10 }}>{error}</small>
            </div>
          )}
          {result && (
            <>
              {/* Verdict badge + score bars */}
              <div className="verdict-row">
                <div className={`verdict-badge ${go ? 'badge-go' : 'badge-nogo'}`}>{go ? '⚔ GO' : '✕ NO-GO'}</div>
                <div style={{ fontSize: 9, fontFamily: 'IM Fell English,serif', fontStyle: 'italic', color: 'var(--ink2)' }}>
                  Recommendation: {result.recommendation}
                </div>
              </div>

              <div className="score-bars">
                {[
                  ['Overall Fit',    result.overall_score],
                  ['Technical',      result.technical_score],
                  ['Experience',     result.experience_score],
                  ['Domain',         result.domain_score],
                  ['Soft Skills',    result.soft_skills_score],
                ].map(([label, val]) => {
                  const v = val as number
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

              {/* Oracle verdict box (crimson left border) */}
              <div className="oracle-verdict">{verdict}</div>

              {/* Gap pills */}
              {result.missing_keywords.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--crimson3)', fontFamily: 'Cinzel,serif', marginBottom: 6 }}>
                    Missing Keywords
                  </div>
                  <div className="gaps-row">
                    {result.missing_keywords.map(k => <span key={k} className="jc-tag flag-crimson">{k}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
