import { useState, useEffect } from 'react'
import { useClaude } from '../hooks/useClaude'
import { ParchmentBox } from '../components/ParchmentBox'
import { SectionTitle } from '../components/SectionTitle'
import type { Job } from '../types'

interface Props {
  preloadJob: Job | null
  onClearPreload: () => void
}

type Tone = 'confident' | 'warm' | 'formal'
type ArmTab = 'resume' | 'cover'

export function Armoury({ preloadJob, onClearPreload }: Props) {
  const [tab, setTab] = useState<ArmTab>('resume')

  // Resume forge
  const [bullets, setBullets] = useState('')
  const [resumeJD, setResumeJD] = useState('')
  const [resumeRole, setResumeRole] = useState('')
  const [resumeText, setResumeText] = useState('')

  // Cover letter
  const [clCompany, setClCompany] = useState('')
  const [clRole,    setClRole]    = useState('')
  const [clJD,      setClJD]      = useState('')
  const [clBg,      setClBg]      = useState('')
  const [tone,      setTone]      = useState<Tone>('confident')
  const [coverText, setCoverText] = useState('')

  const resume = useClaude()
  const cover  = useClaude()

  useEffect(() => {
    if (preloadJob) {
      setResumeRole(preloadJob.title || '')
      setResumeJD(preloadJob.description || '')
      setClCompany(preloadJob.company || '')
      setClRole(preloadJob.title || '')
      setClJD(preloadJob.description || '')
      onClearPreload()
    }
  }, [preloadJob, onClearPreload])

  async function runResume() {
    if (!bullets || !resumeJD) { alert('Paste thy bullets and the job description.'); return }
    setResumeText('')
    const prompt = `You are an expert PM resume writer. Rewrite these bullet points to match the target role.

TARGET ROLE: ${resumeRole}
JOB DESCRIPTION:
${resumeJD}

CURRENT BULLETS:
${bullets}

Rules:
- Same number of bullets
- Start each with a strong action verb
- Quantify impact where possible
- Mirror exact keywords from the JD
- Maximum 2 lines per bullet
- Return ONLY the rewritten bullets, one per line starting with •`
    await resume.stream(prompt, t => setResumeText(t))
  }

  async function runCover() {
    if (!clCompany || !clJD) { alert('Fill in company and job description.'); return }
    setCoverText('')
    const toneDesc: Record<Tone, string> = {
      confident: 'direct, authoritative, achievement-focused',
      warm:      'personable, enthusiastic, connection-focused',
      formal:    'professional, structured, traditional',
    }
    const prompt = `Write a cover letter for this job application.

TONE: ${tone} — ${toneDesc[tone]}
COMPANY: ${clCompany}
ROLE: ${clRole}
${clBg ? `CANDIDATE BACKGROUND:\n${clBg}\n` : ''}JOB DESCRIPTION:
${clJD}

Rules:
- Maximum 320 words
- No clichés
- Open with a bold specific hook
- Three body paragraphs: fit, impact evidence, motivation
- Confident call to action
- Return ONLY the letter text`
    await cover.stream(prompt, t => setCoverText(t))
  }

  return (
    <div className="screen-scroll">
      <SectionTitle>The Armoury — Forge Thy Weapons</SectionTitle>

      <div className="step-tabs">
        <div className={`step-tab${tab === 'resume' ? ' active' : ''}`} onClick={() => setTab('resume')}>
          Forge Resume
        </div>
        <div className={`step-tab${tab === 'cover' ? ' active' : ''}`} onClick={() => setTab('cover')}>
          Letter of Introduction
        </div>
      </div>

      {/* ── Forge Resume ── */}
      <div className={`step-panel${tab === 'resume' ? ' active' : ''}`}>
        <div className="two-panel">
          <div>
            <div className="stone-block" style={{ marginBottom: 10 }}>
              <div className="panel-label">Thy Current Bullets</div>
              <div className="form-group">
                <label className="input-label">Resume Bullet Points</label>
                <textarea className="dark-input" rows={6} placeholder="• Led cross-functional team of 8…&#10;• Increased retention by 22%…" value={bullets} onChange={e => setBullets(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="input-label">Role Title</label>
                <input className="dark-input" placeholder="e.g. Senior Product Manager" value={resumeRole} onChange={e => setResumeRole(e.target.value)} />
              </div>
            </div>
            <div className="stone-block">
              <div className="panel-label">Job Description</div>
              <textarea className="dark-input" rows={6} placeholder="Paste the target job description…" value={resumeJD} onChange={e => setResumeJD(e.target.value)} />
            </div>
            <button className="btn-crimson" style={{ marginTop: 10, width: '100%' }} onClick={runResume} disabled={resume.loading}>
              {resume.loading ? 'Forging…' : '⚔ Forge the Scroll ↗'}
            </button>
          </div>
          <div>
            <div className="panel-label">The Forged Armour</div>
            <ParchmentBox
              loading={resume.loading}
              error={resume.error}
              text={resumeText}
              placeholder="The smithy awaits thy command. Paste thy bullets and the quest scroll, then forge."
            />
          </div>
        </div>
      </div>

      {/* ── Letter of Introduction ── */}
      <div className={`step-panel${tab === 'cover' ? ' active' : ''}`}>
        <div className="two-panel">
          <div>
            <div className="stone-block" style={{ marginBottom: 10 }}>
              <div className="panel-label">Quest Details</div>
              <div className="form-group">
                <label className="input-label">House (Company)</label>
                <input className="dark-input" placeholder="e.g. Stripe" value={clCompany} onChange={e => setClCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="input-label">Quest (Role)</label>
                <input className="dark-input" placeholder="e.g. Senior PM" value={clRole} onChange={e => setClRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="input-label">Job Description</label>
                <textarea className="dark-input" rows={4} placeholder="Paste the job description…" value={clJD} onChange={e => setClJD(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="input-label">Thy Background (optional)</label>
                <textarea className="dark-input" rows={3} placeholder="Brief experience summary…" value={clBg} onChange={e => setClBg(e.target.value)} />
              </div>
            </div>
            <div className="stone-block">
              <div className="input-label" style={{ marginBottom: 8 }}>Tone of Voice</div>
              <div className="tone-row">
                {(['confident', 'warm', 'formal'] as Tone[]).map(t => (
                  <button key={t} className={`tone-btn${tone === t ? ' active' : ''}`} onClick={() => setTone(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-crimson" style={{ marginTop: 10, width: '100%' }} onClick={runCover} disabled={cover.loading}>
              {cover.loading ? 'Composing…' : 'Compose the Letter ↗'}
            </button>
          </div>
          <div>
            <div className="panel-label">Letter of Introduction</div>
            <ParchmentBox
              loading={cover.loading}
              error={cover.error}
              text={coverText}
              placeholder="Fill the quest details and choose thy tone, then commission the letter."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
