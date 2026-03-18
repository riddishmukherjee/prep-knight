import { useState } from 'react'
import { useClaude } from '../hooks/useClaude'
import { SectionTitle } from '../components/SectionTitle'

type TrialType = 'behavioral' | 'technical' | 'case' | 'culture'
type Difficulty = 'squire' | 'knight' | 'lord'

const ROMAN = ['I', 'II', 'III', 'IV', 'V'] as const
const TYPE_LABELS: Record<TrialType, string> = {
  behavioral: 'Deeds & Honour',
  technical:  'Technical Sorcery',
  case:       'The Grand Case',
  culture:    'Court & Culture',
}
const DIFF_LABELS: Record<Difficulty, string> = {
  squire: 'Squire',
  knight: 'Knight',
  lord:   'Lord',
}

interface Session {
  questions: string[]
  currentIdx: number
  scores: (number | null)[]
  feedbacks: string[]
}

function parseQuestions(raw: string): string[] {
  return raw
    .split('\n')
    .filter(l => /^\d+[\.\)]/.test(l.trim()))
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5)
}

function extractScore(feedback: string): number | null {
  const m = feedback.match(/(\d+)\s*\/\s*10/)
  return m ? parseInt(m[1]) : null
}

function extractSuggestion(feedback: string): string {
  const m = feedback.match(/Suggested improvement[:\s]+([^\n]+)/i)
    || feedback.match(/Stronger Opening[:\s]+([^\n]+)/i)
    || feedback.match(/suggestion[:\s]+([^\n]+)/i)
  return m ? m[1].trim() : ''
}

export function Training() {
  const [role,       setRole]       = useState('')
  const [trialType,  setTrialType]  = useState<TrialType>('behavioral')
  const [difficulty, setDifficulty] = useState<Difficulty>('knight')
  const [session,    setSession]    = useState<Session | null>(null)
  const [answer,     setAnswer]     = useState('')
  const [feedback,   setFeedback]   = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [score,      setScore]      = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const { loading: genLoading, call: callClaude } = useClaude()
  const { loading: fbLoading,  call: callFeedback } = useClaude()

  const currentQ = session ? session.questions[session.currentIdx] : null
  const avgScore = session
    ? (() => {
        const scored = session.scores.filter((s): s is number => s !== null)
        return scored.length ? (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1) : '—'
      })()
    : '—'

  async function startOrNext() {
    if (!session) {
      // Generate 5 questions
      const prompt = `Generate exactly 5 interview questions for a Product Manager role.

TYPE: ${TYPE_LABELS[trialType]}
DIFFICULTY: ${DIFF_LABELS[difficulty]}
${role ? `ROLE: ${role}` : ''}

Rules:
- Specific, realistic, challenging
- Number each question 1–5 (format: "1. Question text")
- Return ONLY the numbered questions, no extra text`

      try {
        const text = await callClaude(prompt)
        const questions = parseQuestions(text)
        if (questions.length === 0) { alert('Oracle returned no questions — try again.'); return }
        setSession({ questions, currentIdx: 0, scores: Array(questions.length).fill(null), feedbacks: [] })
        setAnswer(''); setFeedback(''); setSuggestion(''); setScore(null); setShowFeedback(false)
      } catch { /* useClaude handles error display */ }
    } else {
      // Move to next question
      const nextIdx = session.currentIdx + 1
      if (nextIdx >= session.questions.length) {
        alert(`Trial complete! Average honour: ${avgScore}/10`)
        setSession(null)
        return
      }
      setSession(s => s ? { ...s, currentIdx: nextIdx } : s)
      setAnswer(''); setFeedback(''); setSuggestion(''); setScore(null); setShowFeedback(false)
    }
  }

  async function submitAnswer() {
    if (!currentQ || !answer.trim()) { alert('Write thy answer first.'); return }
    const prompt = `You are an expert interview coach. Evaluate this PM interview answer.

QUESTION: ${currentQ}

CANDIDATE'S ANSWER: ${answer}

Provide structured feedback:
1. STAR Framework: Did they cover Situation/Task/Action/Result?
2. Strength: What worked well
3. Weakness: What was missing
4. Suggested improvement: 1-2 specific sentences to add
5. Score: X/10 with brief rationale

Be honest but constructive. Return as plain text.`
    try {
      const text = await callFeedback(prompt)
      const s = extractScore(text)
      const sug = extractSuggestion(text)
      setFeedback(text)
      setSuggestion(sug)
      setScore(s)
      setShowFeedback(true)
      // Store score in session
      setSession(prev => {
        if (!prev) return prev
        const scores = [...prev.scores]
        scores[prev.currentIdx] = s
        const feedbacks = [...prev.feedbacks]
        feedbacks[prev.currentIdx] = text
        return { ...prev, scores, feedbacks }
      })
    } catch { /* handled */ }
  }

  function skipQuestion() {
    if (!session) return
    setSession(prev => {
      if (!prev) return prev
      const scores = [...prev.scores]
      scores[prev.currentIdx] = null
      return { ...prev, scores }
    })
    startOrNext()
  }

  return (
    <div className="training-layout">
      {/* ── LEFT CONFIG PANEL ── */}
      <div className="training-sidebar">

        {/* Block 1: The Quest */}
        <div className="stone-block">
          <SectionTitle>The Quest</SectionTitle>
          <div className="form-group">
            <label className="input-label">Role (optional)</label>
            <input className="dark-input" placeholder="e.g. Senior PM, Director" value={role} onChange={e => setRole(e.target.value)} disabled={!!session} />
          </div>
          <div className="input-label" style={{ marginBottom: 6 }}>Trial Type</div>
          <div className="type-grid">
            {(Object.keys(TYPE_LABELS) as TrialType[]).map(t => (
              <button
                key={t}
                className={`tone-btn${trialType === t ? ' active' : ''}`}
                style={{ fontSize: '7px' }}
                onClick={() => !session && setTrialType(t)}
                disabled={!!session}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="input-label" style={{ marginBottom: 6 }}>Difficulty</div>
          <div className="diff-btns">
            {(Object.keys(DIFF_LABELS) as Difficulty[]).map(d => (
              <button
                key={d}
                className={`diff-btn${difficulty === d ? ' active' : ''}`}
                onClick={() => !session && setDifficulty(d)}
                disabled={!!session}
              >
                {DIFF_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Block 2: Thy Progress */}
        <div className="stone-block">
          <SectionTitle>Thy Progress</SectionTitle>
          <div className="progress-dots">
            {ROMAN.map((_, i) => {
              let cls = 'pd-todo'
              if (session) {
                if (i < session.currentIdx) cls = session.scores[i] !== null ? 'pd-done' : 'pd-skip'
                else if (i === session.currentIdx) cls = 'pd-current'
              }
              return (
                <div key={i} className={`pd-dot ${cls}`}>
                  {cls === 'pd-done' ? '✓' : cls === 'pd-skip' ? '–' : i + 1}
                </div>
              )
            })}
          </div>
          <div className="avg-score-display">{avgScore}</div>
          <div className="avg-score-lbl">Avg Honour Score</div>
          <button
            className="btn-crimson"
            style={{ width: '100%', marginTop: 14 }}
            onClick={startOrNext}
            disabled={genLoading}
          >
            {genLoading ? 'Summoning…' : session ? '⚔ Next Trial' : '⚔ Begin Session'}
          </button>
          {session && (
            <button className="btn-ghost" style={{ width: '100%', marginTop: 6 }} onClick={() => { setSession(null); setAnswer(''); setFeedback(''); setSuggestion(''); setScore(null); setShowFeedback(false) }}>
              End Session
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PRACTICE PANEL ── */}
      <div className="training-main">

        {/* 1. Question parchment */}
        <div className="parch-torn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="trial-badge">
              Trial {session ? ROMAN[session.currentIdx] : 'I'}
            </span>
            <span style={{ fontSize: 8, fontFamily: 'Cinzel,serif', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              The Master-at-Arms asks:
            </span>
          </div>
          <div className="trial-question">
            {currentQ || 'Configure thy quest in the left panel and press "Begin Session" to start thy trials.'}
          </div>
        </div>

        {/* 2. Answer stone block */}
        <div className="stone-block">
          <div className="panel-label">Thy Answer</div>
          <textarea
            className="dark-input"
            rows={5}
            placeholder="Write thy answer in full…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={!session || showFeedback}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn-crimson" onClick={submitAnswer} disabled={!session || showFeedback || fbLoading || !answer.trim()}>
              {fbLoading ? 'Judging…' : '✒ Submit for Judgement'}
            </button>
            <button className="btn-ghost" onClick={skipQuestion} disabled={!session || showFeedback}>
              Skip
            </button>
          </div>
        </div>

        {/* 3. Feedback parchment (green tinted) */}
        {showFeedback && (
          <div className="feedback-parch">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span className="mas-badge">Master-at-Arms speaks</span>
              {score !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
                  <div className="honour-num">{score}</div>
                  <div className="honour-lbl">/ 10 Honour</div>
                </div>
              )}
            </div>
            <div style={{ fontFamily: 'IM Fell English,serif', fontSize: 12, lineHeight: 1.7, color: '#1a2a0c', whiteSpace: 'pre-wrap', marginBottom: suggestion ? 0 : 8 }}>
              {feedback}
            </div>
            {suggestion && (
              <div className="suggestion-box">
                <strong style={{ fontFamily: 'Cinzel,serif', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: '#2a5018', fontStyle: 'normal' }}>Stronger Opening</strong>
                <br/>{suggestion}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
