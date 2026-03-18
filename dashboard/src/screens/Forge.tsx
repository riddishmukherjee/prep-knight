import { useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return <button className="code-copy" onClick={copy}>{copied ? '✓' : 'Copy'}</button>
}

export function Forge() {
  const [sheetId, setSheetId] = useState('')
  const [bound,   setBound]   = useState(false)

  function bindRealm() {
    if (!sheetId.trim()) { alert('Paste thy Google Sheet ID first.'); return }
    localStorage.setItem('prepknight_sheet_id', sheetId.trim())
    setBound(true)
  }

  const dockerCmd = `docker run -it --rm \\
  --name n8n \\
  -p 5678:5678 \\
  -v ~/.n8n:/home/node/.n8n \\
  docker.n8n.io/n8nio/n8n`

  const sheetHeaders = `title | company | location | url | source | publishedAt | fitScore | seniority | topReason | missingKeywords | flag | status | addedAt`

  const envFile = `ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SHEET_ID=${sheetId || 'your-sheet-id-here'}
PORT=3000`

  const pushUrl = `http://host.docker.internal:3000/api/ingest`

  return (
    <div className="screen-scroll">
      <SectionTitle>n8n Forge — Automation Setup</SectionTitle>

      {/* Open Book */}
      <div className="book-wrap">
        {/* Left page: Steps */}
        <div className="book-page book-page-left">
          <div className="book-page-title">⚔ Setup Steps ⚔</div>

          <div className="book-step">
            <div className="bs-num">I</div>
            <div className="bs-body">
              <div className="bs-title">Start n8n via Docker</div>
              <div className="bs-text">Run the command opposite in thy terminal, then open <strong style={{ color: 'var(--gold)' }}>http://localhost:5678</strong> and create an account.</div>
            </div>
          </div>

          <div className="book-step">
            <div className="bs-num">II</div>
            <div className="bs-body">
              <div className="bs-title">Import the Workflow</div>
              <div className="bs-text">In n8n: <strong style={{ color: 'var(--gold)' }}>Workflows → Import from file</strong> → select <code style={{ color: 'var(--gold)', background: 'rgba(0,0,0,.3)', padding: '1px 4px' }}>n8n/workflow.json</code> from this project.</div>
            </div>
          </div>

          <div className="book-step">
            <div className="bs-num">III</div>
            <div className="bs-body">
              <div className="bs-title">Add Credentials</div>
              <div className="bs-text">In n8n → Credentials, add:<br/>
                <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Anthropic API</strong> — paste thy key<br/>
                <strong style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Google Sheets OAuth2</strong> — follow the OAuth flow
              </div>
            </div>
          </div>

          <div className="book-step">
            <div className="bs-num">IV</div>
            <div className="bs-body">
              <div className="bs-title">Google Sheet Setup</div>
              <div className="bs-text">Create a sheet named <strong style={{ color: 'var(--gold)' }}>Prep Knight — Job Board</strong> with two tabs: <strong style={{ color: 'var(--gold)' }}>Jobs</strong> and <strong style={{ color: 'var(--gold)' }}>Seen URLs</strong>. Share it as "Anyone with link → Viewer" AND publish it to web.</div>
            </div>
          </div>

          <div className="book-step">
            <div className="bs-num">V</div>
            <div className="bs-body">
              <div className="bs-title">Activate & Test</div>
              <div className="bs-text">Toggle the workflow <strong style={{ color: '#3aaa3a' }}>Active</strong>. It fires every 6 hours. Click <strong style={{ color: 'var(--gold)' }}>Execute Workflow</strong> to test immediately. Bind thy Sheet ID below.</div>
            </div>
          </div>
        </div>

        {/* Right page: Code blocks */}
        <div className="book-page book-page-right">
          <div className="book-page-title">⚔ Commands & Config ⚔</div>

          <div className="code-label">I. Docker Command</div>
          <div className="book-code">
            {dockerCmd}
            <CopyBtn text={dockerCmd} />
          </div>

          <div className="code-label">IV. Jobs Tab Headers</div>
          <div className="book-code">
            {sheetHeaders}
            <CopyBtn text={sheetHeaders} />
          </div>

          <div className="code-label">IV. Seen URLs Tab</div>
          <div className="book-code">
            {'url | seenAt'}
            <CopyBtn text="url | seenAt" />
          </div>

          <div className="code-label">V. n8n Push Node URL (Docker)</div>
          <div className="book-code">
            {pushUrl}
            <CopyBtn text={pushUrl} />
          </div>

          <div className="code-label">.env File</div>
          <div className="book-code" style={{ fontSize: 10 }}>
            {envFile}
            <CopyBtn text={envFile} />
          </div>
        </div>
      </div>

      {/* Bind the Realm */}
      <SectionTitle>Bind the Realm</SectionTitle>
      <div className="stone-block">
        <div className="panel-label">Google Sheet ID</div>
        <div style={{ fontSize: 9, fontFamily: 'IM Fell English,serif', fontStyle: 'italic', color: 'var(--muted)', marginBottom: 10 }}>
          Extract from your Sheet URL: docs.google.com/spreadsheets/d/<strong style={{ color: 'var(--gold)' }}>THIS_PART</strong>/edit
        </div>
        <div className="bind-row">
          <input
            className="bind-input"
            placeholder="Paste thy Google Sheet ID here…"
            value={sheetId}
            onChange={e => setSheetId(e.target.value)}
          />
          <button className="btn-crimson" onClick={bindRealm}>
            {bound ? '✓ Realm Bound' : '⚔ Bind the Realm'}
          </button>
        </div>

        {/* n8n Variables reference */}
        <div style={{ marginTop: 16 }}>
          <div className="panel-label" style={{ marginBottom: 8 }}>n8n Variables (Settings → Variables)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IM Fell English,serif' }}>
            <thead>
              <tr>
                <th style={{ fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--timber)' }}>Variable</th>
                <th style={{ fontSize: 7, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--timber)' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['LINKEDIN_RSS_URL',    'Thy LinkedIn saved search RSS URL'],
                ['INDEED_RSS_URL',      'https://in.indeed.com/rss?q=Senior+PM&sort=date'],
                ['GSHEET_DOC_ID',       sheetId || 'Your Sheet ID'],
                ['CANDIDATE_PROFILE',   'Thy background summary (2–3 sentences)'],
                ['PREFERRED_INDUSTRIES','e.g. fintech, SaaS, edtech'],
                ['PREFERRED_LOCATIONS', 'e.g. Bangalore, Remote'],
                ['KEY_SKILLS',          'e.g. product strategy, roadmap, OKRs'],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: 'var(--gold)', padding: '5px 8px', borderBottom: '1px solid rgba(196,146,42,.1)', fontStyle: 'normal' }}>{k}</td>
                  <td style={{ fontSize: 10, color: 'var(--parch2)', padding: '5px 8px', borderBottom: '1px solid rgba(196,146,42,.1)', fontStyle: 'italic' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Troubleshooting */}
      <SectionTitle>Troubleshooting</SectionTitle>
      <div className="stone-block" style={{ borderLeft: '4px solid var(--crimson)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IM Fell English,serif' }}>
          <thead>
            <tr>
              <th style={{ fontSize: 7, color: 'var(--gold)', textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--timber)', fontFamily: 'Cinzel,serif', letterSpacing: '.1em', textTransform: 'uppercase' }}>Issue</th>
              <th style={{ fontSize: 7, color: 'var(--gold)', textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--timber)', fontFamily: 'Cinzel,serif', letterSpacing: '.1em', textTransform: 'uppercase' }}>Fix</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Red dot / Claude error',      'Check ANTHROPIC_API_KEY in .env — no extra spaces. Confirm billing credits at console.anthropic.com.'],
              ['0 jobs / 502 error',           'Sheet must be published (Publish to web) AND shared (Anyone with link → Viewer).'],
              ['n8n can\'t reach localhost',   'Use http://host.docker.internal:3000/api/ingest in the n8n push node.'],
              ['/api/ingest returns 404',      'Restart the server (pnpm dev in project root). Check server logs.'],
              ['Dashboard not loading',        'Run: cd dashboard && pnpm dev — open http://localhost:5173'],
            ].map(([issue, fix]) => (
              <tr key={issue}>
                <td style={{ fontSize: 9, color: 'var(--crimson3)', padding: '6px 8px', borderBottom: '1px solid rgba(196,146,42,.1)', fontStyle: 'normal', fontFamily: 'Cinzel,serif' } as React.CSSProperties}>{issue}</td>
                <td style={{ fontSize: 10, color: 'var(--parch2)', padding: '6px 8px', borderBottom: '1px solid rgba(196,146,42,.1)', fontStyle: 'italic' }}>{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
