# ⚔️ The Prep Knight

> **Your AI squire does the hunt. You ride in for the offer.**
>
> Autonomous pipeline that finds, scores, and surfaces Senior PM+ quests.
> You only intervene at submission.

*Paratus ante pugnam — Ready before the battle.*

<!-- Add screenshot of dashboard here -->

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                     THE PREP KNIGHT PIPELINE                        │
└─────────────────────────────────────────────────────────────────────┘

  RSS Feeds          n8n               Claude API
  ──────────    ──────────────    ──────────────────
  LinkedIn  ──▶ Deduplicate   ──▶ Score & Filter
  Naukri    ──▶ Normalise     ──▶ fitScore 1–10
  Indeed    ──▶ Dedup vs seen ──▶ Structured JSON
                     │
                     ▼
            Google Sheet (Jobs tab)        POST /api/ingest
            ──────────────────────    ──────────────────────
            Persistent store      ──▶ In-memory cache
            Seen URLs dedup            Real-time push
                     │
                     ▼
              Dashboard (localhost:3000)
              ────────────────────────────
              📥 Job Inbox    (scored cards)
              🏰 My Pipeline  (Kanban tracker)
              🎯 Match Analyser
              ✍️  Tailor & Apply
              🎤 Interview Coach
              💰 Offer Negotiator
                     │
                     ▼
                    YOU
              (review → apply)
```

Every 6 hours n8n scouts the feeds, Claude scores each listing, and only the best quests land in your inbox — pre-analysed and ready to act on.

---

## Features

- **Autonomous Discovery** — RSS feeds from LinkedIn, Naukri, and Indeed run on a schedule. No manual searching.
- **AI Scoring** — Claude evaluates every listing against your candidate profile: fit score 1–10, seniority detection, missing keywords, red flags.
- **Smart Deduplication** — Seen URLs are tracked in Google Sheets. Each listing is scored exactly once.
- **Real-time Push** — Passing jobs hit your dashboard instantly via `POST /api/ingest`, no sync needed.
- **Resume Tailor** — Paste your bullets + JD → Claude rewrites them for the role.
- **Cover Letter Generator** — Confident / Warm / Formal tone selector. Under 320 words, no clichés.
- **Match Analyser** — Visual score bars across Technical, Experience, Domain, and Soft Skills.
- **Interview Coach** — Question generator by type and difficulty → write your answer → get structured feedback.
- **Offer Negotiator** — Input the offer → get market context, leverage points, and a ready-to-send counter-offer email.
- **Pipeline Tracker** — Track every application from Scouted → Applied → Interview → Offer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS — single `dashboard/index.html`, no framework |
| Backend | Node.js + Express — API proxy, sheet cache, pipeline state |
| Automation | n8n — scheduled workflow, RSS ingestion, Claude scoring |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Database | Google Sheets (live CSV) + local `pipeline.json` |

---

## Quick Start

```bash
git clone https://github.com/riddishmukherjee/prep-knight.git
cd prep-knight
pnpm install
cp .env.example .env          # add ANTHROPIC_API_KEY + GOOGLE_SHEET_ID
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> See [docs/SETUP.md](docs/SETUP.md) for the full setup guide including n8n, Google Sheet configuration, and RSS feed URLs.

---

## The 6-Stage Pipeline

| Stage | What Happens |
|-------|-------------|
| **1. Fetch** | n8n reads RSS feeds from LinkedIn, Naukri, Indeed every 6 hours |
| **2. Deduplicate** | URLs normalised and checked against `Seen URLs` tab — already-processed jobs are skipped |
| **3. Score** | Claude evaluates each listing vs your candidate profile and returns structured JSON with `fitScore`, `seniority`, `topReason`, `missingKeywords`, `flag` |
| **4. Gate** | Only jobs with `fitScore >= 6` pass. Everything else is marked seen and discarded. |
| **5. Store** | Passing jobs written to Google Sheet `Jobs` tab (persistent) and pushed to `/api/ingest` (real-time) |
| **6. Surface** | Dashboard displays scored cards. You open a card, read the AI analysis, and decide to apply — squire already has the cover letter ready. |

---

## Project Structure

```
prep-knight/
├── server/
│   ├── index.js              Express server
│   ├── routes/
│   │   ├── claude.js         POST /api/claude  — Anthropic proxy
│   │   ├── sheet.js          GET  /api/jobs    — Google Sheet cache
│   │   ├── pipeline.js       GET/POST/PATCH /api/pipeline
│   │   └── ingest.js         POST /api/ingest  — n8n webhook receiver
│   └── data/
│       ├── pipeline.json     Local application tracker
│       └── jobs-cache.json   Backup of ingested jobs
├── dashboard/
│   └── index.html            6-page dashboard (single file)
├── n8n/
│   └── workflow.json         Import this into n8n
└── docs/
    ├── SETUP.md
    ├── ARCHITECTURE.md
    └── PROMPTS.md
```

---

## Contributing

This is a personal tool — PRs welcome if they improve the core pipeline without adding complexity. Open an issue first for anything larger than a bug fix.

---

## License

MIT © [Riddish Mukherjee](https://github.com/riddishmukherjee)
