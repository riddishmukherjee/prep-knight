# Setup Guide — The Prep Knight

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | any | `npm i -g pnpm` |
| Docker Desktop | any | For running n8n |
| Anthropic API key | — | [console.anthropic.com](https://console.anthropic.com) |
| Google account | — | For Google Sheets |

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd prep-knight
pnpm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
PORT=3000
```

**Getting your ANTHROPIC_API_KEY:**
1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
2. Add at least $5 in billing credits

---

## 3. Google Sheet Setup

### Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) → New spreadsheet
2. Name it `Prep Knight — Job Board`
3. Create **two tabs** (right-click tab → Insert sheet):

**Tab 1 — `Jobs`** (exact name, capital J)

Add these headers in row 1:
```
title | company | location | url | source | publishedAt | fitScore | seniority | topReason | missingKeywords | flag | status | addedAt
```

**Tab 2 — `Seen URLs`** (used by n8n to avoid reprocessing)

Add these headers in row 1:
```
url | seenAt
```

### Publish & Share

1. **File → Share → Publish to web** → Publish (makes CSV endpoint public)
2. **Share** (top right) → General access → **Anyone with the link** → Viewer → Done

### Get the Sheet ID

From the URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

Paste it into `.env` as `GOOGLE_SHEET_ID`.

---

## 4. Start the Server

```bash
pnpm dev        # development (auto-restarts on file changes)
# or
pnpm start      # production
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
```
⚔ The Prep Knight — Paratus ante pugnam — running at http://localhost:3000
```

---

## 5. Dashboard Setup

1. In the sidebar, paste your **Google Sheet ID** into the input field
2. Click **↺ Sync Now**
3. The Job Inbox should populate with your sheet data
4. Top-right dot turns green when Claude API is connected

---

## 6. n8n Automation Setup

n8n runs the autonomous pipeline: RSS feeds → Claude scoring → Google Sheet → dashboard.

### Start n8n via Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Open [http://localhost:5678](http://localhost:5678) and create an account.

### Import the workflow

1. In n8n: **Workflows → Import from file**
2. Select `n8n/workflow.json` from this project
3. The workflow loads with all nodes pre-configured

### Add Credentials

Go to **Credentials → Add Credential**:

- **Anthropic API** → paste your `ANTHROPIC_API_KEY`
- **Google Sheets OAuth2** → follow the OAuth flow to connect your Google account

Attach each credential to the relevant nodes (Claude node → Anthropic, both Google Sheets nodes → Google Sheets OAuth2).

### Set n8n Variables

Go to **Settings → Variables → Add Variable**:

| Variable | Value |
|----------|-------|
| `LINKEDIN_RSS_URL` | Your LinkedIn saved search RSS URL |
| `NAUKRI_RSS_URL` | Your Naukri saved search RSS URL |
| `INDEED_RSS_URL` | `https://in.indeed.com/rss?q=Senior+Product+Manager&l=Remote&sort=date` |
| `GSHEET_DOC_ID` | Your Google Sheet ID |
| `CANDIDATE_PROFILE` | Your background summary (2-3 sentences) |
| `PREFERRED_INDUSTRIES` | e.g. `fintech, SaaS, edtech` |
| `PREFERRED_LOCATIONS` | e.g. `Bangalore, Remote, Hybrid` |
| `KEY_SKILLS` | e.g. `product strategy, roadmap, OKRs, data analytics` |

**Getting RSS URLs:**

- **LinkedIn:** Run a job search with your filters → Save search (bell icon) → The RSS URL follows the pattern `https://www.linkedin.com/jobs/search/rss?keywords=...`
- **Naukri:** Run a search → Save Search → enable email alerts → RSS URL pattern: `https://www.naukri.com/rss/jobsearch/...`
- **Indeed:** `https://in.indeed.com/rss?q=Senior+Product+Manager&l=Remote&sort=date`

### Activate the Workflow

1. Toggle the workflow to **Active** (top-right switch)
2. It runs every 6 hours automatically
3. To test immediately: **Execute Workflow** button

### Real-time Push to Dashboard

The workflow already includes a **"Push to Prep Knight"** node that POSTs scored jobs to `POST /api/ingest`. Jobs appear in your Job Inbox instantly without waiting for a sheet sync.

> **Docker users:** n8n inside Docker cannot reach `localhost:3000` on your machine. Use `http://host.docker.internal:3000/api/ingest` instead in the Push to Prep Knight node URL.

---

## Full Pipeline Flow

```
RSS Feeds (LinkedIn / Naukri / Indeed)
    ↓ every 6 hours
Merge + Deduplicate
    ↓
Filter vs Seen URLs (Google Sheet: Seen URLs tab)
    ↓
Claude scores each job (fit score 1–10)
    ↓
Gate: only score ≥ 6 pass
    ↓
├── Write to Google Sheet (Jobs tab)       ← dashboard reads on sync
├── Mark URL as Seen (Seen URLs tab)       ← prevents re-scoring
└── POST /api/ingest                       ← dashboard updates immediately
```

---

## Troubleshooting

**1. "Claude error" or red dot in header**
- Check `ANTHROPIC_API_KEY` in `.env` — no extra spaces or line breaks
- Confirm you have billing credits at [console.anthropic.com](https://console.anthropic.com)
- Restart the server after editing `.env`

**2. Job Board shows 0 jobs / 502 error**
- Open `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0` in your browser — if it asks for login, the sheet isn't public
- Go to File → Share → Publish to web AND set sharing to "Anyone with the link"
- Make sure the tab is named exactly `Jobs` (capital J)

**3. n8n workflow fails on Google Sheets node**
- Re-authenticate Google Sheets OAuth2 credential in n8n
- Make sure the sheet has both `Jobs` and `Seen URLs` tabs with correct headers

**4. `/api/ingest` returns 404**
- Make sure your server is running the latest code (`pnpm dev`)
- Check server logs for startup errors

**5. Docker n8n can't reach localhost:3000**
- In the "Push to Prep Knight" node, change the URL from `localhost` to `host.docker.internal`:
  ```
  http://host.docker.internal:3000/api/ingest
  ```
