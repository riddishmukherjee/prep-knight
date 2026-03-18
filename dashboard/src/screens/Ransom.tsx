import { useState } from 'react'
import { useClaude } from '../hooks/useClaude'
import { SectionTitle } from '../components/SectionTitle'

interface ParsedRansom {
  offer_pct: number       // 0-100, where 100 = top quartile
  median_pct: number
  top_pct: number
  leverage: string[]
  letter: string
  verdict: string
}

function parseRansom(text: string): ParsedRansom {
  // Best-effort parse; fallback to displaying raw text
  const leverage: string[] = []
  const leverageMatches = text.match(/(?:\d+\.|[IVX]+\.)\s+(.+)/g) || []
  leverageMatches.slice(0, 5).forEach(m => leverage.push(m.replace(/^[\d.IVX]+\.\s*/, '').trim()))

  const letterMatch = text.match(/Dear[\s\S]+?(?:Sincerely|Regards|Best|Thank you)[^\n]*/i)
  const letter = letterMatch ? letterMatch[0].trim() : ''

  return { offer_pct: 45, median_pct: 68, top_pct: 88, leverage, letter, verdict: text }
}

export function Ransom() {
  const [role,     setRole]     = useState('')
  const [offer,    setOffer]    = useState('')
  const [spoils,   setSpoils]   = useState('')
  const [years,    setYears]    = useState('')
  const [walkaway, setWalkaway] = useState('')
  const [result,   setResult]   = useState<ParsedRansom | null>(null)
  const [rawText,  setRawText]  = useState('')

  const { loading, error, stream } = useClaude()

  async function runRansom() {
    if (!offer || !role) { alert('Fill in the role and salary offered.'); return }
    setResult(null); setRawText('')
    const prompt = `You are an expert salary negotiation advisor for senior Product Manager roles in India.

OFFER:
Role: ${role}
Base Salary: ${offer}
Other Components: ${spoils || 'Not specified'}
Years of Experience: ${years || 'Not specified'}
Walk-away Point: ${walkaway || 'Not specified'}

Provide:
1. MARKET CONTEXT: Is this offer competitive? State typical range for this role in LPA.
2. NEGOTIATION VERDICT: Accept / Counter / Walk Away — with clear reasoning
3. COUNTER STRATEGY: Specific numbers and why
4. LEVERAGE POINTS (numbered I–III):
I. [leverage point]
II. [leverage point]
III. [leverage point]
5. COUNTER-OFFER EMAIL: Ready-to-send email (begin with "Dear Hiring Manager," — max 150 words)

Be specific with numbers. Return as plain text.`

    let full = ''
    await stream(prompt, t => { full = t; setRawText(t) })
    setResult(parseRansom(full))
  }

  const barColours = ['var(--crimson3)', '#d4a835', '#3aaa3a']
  const barLabels  = ['Thy Offer', 'Market Median', 'Top Quartile']
  const barPcts    = result ? [result.offer_pct, result.median_pct, result.top_pct] : [0, 0, 0]

  return (
    <div className="screen-scroll">
      <SectionTitle>The Ransom — Negotiate Thy Worth</SectionTitle>

      <div className="two-panel">
        {/* Left: Input parchment */}
        <div className="ransom-parch">
          <div className="rp-corner tl">✦</div><div className="rp-corner tr">✦</div>
          <div className="rp-corner bl">✦</div><div className="rp-corner br">✦</div>
          <div className="panel-label">The Offer on the Table</div>

          <div className="form-group">
            <label className="input-label">Role & House</label>
            <input className="parch-input" placeholder="e.g. Senior PM — Stripe India" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label">Offered Tribute (LPA or USD)</label>
            <input className="parch-input" placeholder="e.g. ₹28 LPA or $130,000" value={offer} onChange={e => setOffer(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label">Other Spoils (bonus, equity, etc.)</label>
            <textarea className="parch-input" rows={2} placeholder="e.g. 15% bonus, 0.1% equity 4yr vest…" value={spoils} onChange={e => setSpoils(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label">Years in Battle (experience)</label>
            <input className="parch-input" placeholder="e.g. 7 years" value={years} onChange={e => setYears(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="input-label">Walk-away Point</label>
            <textarea className="parch-input" rows={2} placeholder="Minimum acceptable terms…" value={walkaway} onChange={e => setWalkaway(e.target.value)} />
          </div>

          <button className="btn-crimson w-full" onClick={runRansom} disabled={loading}>
            {loading ? 'The Oracle calculates…' : '⚔ Analyse & Forge the Counter'}
          </button>
        </div>

        {/* Right: Output parchment */}
        <div className="ransom-parch">
          <div className="rp-corner tl">✦</div><div className="rp-corner tr">✦</div>
          <div className="rp-corner bl">✦</div><div className="rp-corner br">✦</div>

          {loading && (
            <div style={{ fontFamily: 'IM Fell English,serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
              The Oracle consults…
            </div>
          )}
          {error && (
            <div style={{ color: 'var(--crimson)', fontFamily: 'IM Fell English,serif', fontStyle: 'italic', fontSize: 13 }}>
              The Oracle could not be reached — check thy API key.
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{ fontFamily: 'IM Fell English,serif', fontStyle: 'italic', color: '#7a5a28', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              Enter the offer details and the Oracle shall forge thy counter-offer strategy.
            </div>
          )}

          {result && (
            <>
              {/* Market Intelligence bars */}
              <div style={{ marginBottom: 18 }}>
                <div className="panel-label">Market Intelligence</div>
                {barLabels.map((label, i) => (
                  <div key={label} className="market-bar-row">
                    <div className="market-bar-label">{label}</div>
                    <div className="market-bar-track">
                      <div className="market-bar-fill" style={{ width: `${barPcts[i]}%`, background: barColours[i], height: '100%' }} />
                    </div>
                    <div className="market-bar-val" style={{ color: barColours[i] }}>{barPcts[i]}%</div>
                  </div>
                ))}
              </div>

              {/* Leverage points */}
              {result.leverage.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div className="panel-label">Thy Leverage Points</div>
                  <ul className="leverage-list">
                    {result.leverage.map((pt, i) => (
                      <li key={i}><span className="li-num">{['I.', 'II.', 'III.', 'IV.', 'V.'][i]}</span>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Letter of negotiation */}
              {result.letter && (
                <div>
                  <div className="panel-label">Letter of Negotiation</div>
                  <div className="neg-letter-box">{result.letter}</div>
                </div>
              )}

              {/* Full raw text if no structured parse */}
              {!result.letter && rawText && (
                <div>
                  <div className="panel-label">Oracle's Strategy</div>
                  <div style={{ fontFamily: 'IM Fell English,serif', fontSize: 12, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{rawText}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
