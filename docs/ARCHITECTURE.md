# Architecture — The Prep Knight

## System Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SOURCES                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ LinkedIn RSS│  │  Naukri RSS │  │  Indeed RSS │                      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
└─────────┼────────────────┼────────────────┼─────────────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOW  (every 6h)                         │
│                                                                          │
│  Merge All Feeds                                                         │
│       │                                                                  │
│       ▼                                                                  │
│  Deduplicate & Normalise  ──────────────────────────────┐                │
│       │                                                 │                │
│       ▼                                                 ▼                │
│  Load Seen URLs (Google Sheet)              Filter New Jobs Only         │
│                                                    │                     │
│                                                    ▼                     │
│                                          Claude — Score & Filter         │
│                                          (Anthropic API)                 │
│                                                    │                     │
│                                          Parse + Gate (fitScore ≥ 6)    │
│                                                    │                     │
│                              ┌─────────────────────┼──────────────────┐ │
│                              ▼                     ▼                  ▼ │
│                       Write to Sheet        Mark URL Seen     POST /ingest│
└──────────────────────────────────────────────────────────────────────────┘
          │                     │                                │
          ▼                     ▼                                ▼
┌─────────────────┐  ┌──────────────────┐          ┌────────────────────┐
│  Google Sheet   │  │  Seen URLs tab   │          │  Express Server    │
│  Jobs tab       │  │  (dedup store)   │          │  localhost:3000    │
└────────┬────────┘  └──────────────────┘          └─────────┬──────────┘
         │                                                    │
         │  GET /api/jobs (CSV→JSON, 5min cache)             │  in-memory
         └────────────────────────────────────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   dashboard/index.html │
                          │                       │
                          │  📥 Job Inbox          │
                          │  🏰 Pipeline           │
                          │  🎯 Match Analyser     │
                          │  ✍️  Tailor & Apply    │
                          │  🎤 Interview Coach    │
                          │  💰 Offer Negotiator   │
                          └───────────┬───────────┘
                                      │
                                      ▼
                                    YOU
```

---

## Data Flow: From RSS Feed to Your Inbox

1. **Trigger** — n8n's schedule node fires every 6 hours.

2. **Fetch** — Three RSS Feed nodes fetch LinkedIn, Naukri, and Indeed in parallel. Each returns a list of job objects with fields like `title`, `link`, `contentSnippet`, `isoDate`.

3. **Merge** — The Merge node combines all three feeds into a single stream.

4. **Deduplicate & Normalise** — A Code node:
   - Deduplicates by URL within the current batch
   - Normalises inconsistent field names across sources (`link` → `url`, `creator` → `company`, etc.)
   - Outputs clean objects with: `title`, `company`, `location`, `url`, `description`, `source`, `publishedAt`

5. **Filter vs Seen** — The `Seen URLs` Google Sheet tab is loaded and converted to a Set. Jobs whose URLs already exist are dropped — they were processed in a previous run.

6. **Claude Scoring** — Each new job is sent to Claude with a structured prompt containing the candidate profile and job listing. Claude returns a JSON object (not prose) with:
   - `pass` — boolean gate
   - `fit_score` — 1 to 10
   - `seniority` — detected level
   - `top_reason` — one-line summary
   - `missing_keywords` — array
   - `flag` — `none` / `overqualified` / `underqualified` / `wrong_industry` / `contract_only`

7. **Gate** — The Parse + Gate node parses Claude's JSON response and filters out any job where `pass === false` or `fit_score < 6`. Failed jobs are still marked seen to avoid re-scoring.

8. **Store (parallel)**:
   - `Write to Google Sheet` — appends the job to the `Jobs` tab (persistent record)
   - `Mark URL as Seen` — appends the URL to `Seen URLs` tab
   - `Push to Prep Knight` — `POST /api/ingest` to the Express server

9. **Dashboard** — The ingest route merges the job into the in-memory cache (same object used by `/api/jobs`). The dashboard auto-refreshes every 10 minutes, or the user clicks Sync Now.

---

## Component Responsibilities

### n8n
- Owns the **scheduling and orchestration** of the full pipeline
- Handles **RSS parsing** and **field normalisation** across sources
- Manages the **seen-URL deduplication** state via Google Sheets
- Calls the **Anthropic API** for scoring (via the LangChain Anthropic node)
- Routes output to Sheet, Seen URLs, and the dashboard webhook simultaneously

### Claude API (`claude-sonnet-4-6`)
- **Scoring** — evaluates each job against the candidate profile, returns structured JSON
- **Resume tailoring** — rewrites bullet points to match JD keywords
- **Cover letter generation** — writes under-320-word letters in chosen tone
- **Match analysis** — scores candidate vs JD across 4 dimensions (returns parseable format)
- **Interview coaching** — generates questions, evaluates answers
- **Offer negotiation** — analyses market, extracts leverage, drafts counter-offer email

### Google Sheets
- **`Jobs` tab** — persistent job store; the dashboard reads from here on sync
- **`Seen URLs` tab** — deduplication log; prevents re-scoring across workflow runs
- Acts as a **human-readable audit log** — you can open the sheet and see every scored job

### Express Server (`server/`)
- Proxies all Anthropic API calls — **the API key never reaches the browser**
- Serves the dashboard static file
- Caches Google Sheet data in-memory (5-minute TTL) to avoid hammering the CSV endpoint
- Exposes `/api/ingest` as a **webhook receiver** for n8n real-time pushes
- Persists pipeline state (applications) to `server/data/pipeline.json`

### Dashboard (`dashboard/index.html`)
- Single-file vanilla JS — **no build step, no framework**
- All Claude interactions go through `/api/claude` (never direct to Anthropic)
- State is ephemeral (in-memory) except pipeline data which round-trips to the server

---

## Claude Scoring Prompt Design

### Why Structured JSON Output

Claude is instructed to return **only valid JSON with no markdown fences or prose**:

```
Respond with ONLY valid JSON. No explanation, no markdown, no code fences:
{
  "pass": true or false,
  "fit_score": 1-10,
  ...
}
```

**Reasons:**
- The n8n Code node parses the output with `JSON.parse()` — prose would break it
- Structured output makes the gate condition (`fit_score >= 6`) trivially checkable
- Each field maps directly to a dashboard UI element — no post-processing needed
- Failures are caught and defaulted to `{ pass: false, fit_score: 0 }` so bad parses don't halt the workflow

### Prompt Variables

The scoring prompt is parameterised via n8n Variables:
- `CANDIDATE_PROFILE` — free-text description of the candidate's background
- `PREFERRED_INDUSTRIES`, `PREFERRED_LOCATIONS`, `KEY_SKILLS` — structured criteria
- These live in n8n Settings → Variables, not in the code — **no redeploy needed to update your profile**

### Gate Threshold

The default gate is `fitScore >= 6`. Jobs scoring 5 or below are silently dropped and marked seen. You can adjust this in the `Parse Claude + Gate` Code node.

---

## Extending the System

### Add a New Job Source

1. Add a new RSS Feed node in n8n (or an HTTP Request node for non-RSS sources)
2. Connect its output to the **Merge All Feeds** node as a new input
3. The Deduplicate & Normalise code handles unknown field names — add mappings for the new source's fields if needed

For non-RSS sources (e.g. a company careers page), use n8n's **HTML Extract** or **HTTP Request** node to scrape/parse the listing, then shape the output to match the normalised schema before the merge.

### Change Scoring Criteria

Edit the Claude scoring prompt in the `Claude — Score & Filter` node. The prompt is in plain English — update `CANDIDATE_PROFILE` in n8n Variables or modify the criteria block directly.

To raise/lower the quality bar: change `fit_score < 6` to your preferred threshold in the `Parse Claude + Gate` Code node.

### Add Email Notifications

After the `Parse Claude + Gate` node, add:
1. An **If** node: `{{ $json.fitScore >= 9 }}` — only notify on exceptional fits
2. A **Gmail** or **SendGrid** node with a template referencing `{{ $json.company }}`, `{{ $json.title }}`, `{{ $json.topReason }}`

This sends you an email alert only for the highest-scoring jobs, without spamming you on every run.

### Add Slack Notifications

Same pattern — use n8n's **Slack** node instead of email. Send to a `#job-alerts` channel with a message block including the fit score, company, role, and `topReason`.
