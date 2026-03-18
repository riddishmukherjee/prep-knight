import express from 'express';
import fetch from 'node-fetch';
import cron from 'node-cron';

const router = express.Router();

const FIELDS = [
  'title', 'company', 'location', 'url', 'source',
  'publishedAt', 'fitScore', 'seniority', 'topReason',
  'missingKeywords', 'flag', 'status', 'addedAt',
];

let cache = { jobs: null, lastSync: null };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse a single CSV line respecting quoted fields
  function parseLine(line) {
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    values.push(cur.trim());
    return values;
  }

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ''));

  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj = {};
    FIELDS.forEach(field => {
      const idx = headers.findIndex(h => h === field.toLowerCase());
      obj[field] = idx >= 0 ? (values[idx] ?? '') : '';
    });
    return obj;
  }).filter(obj => obj.company || obj.title); // skip blank rows
}

async function fetchSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Jobs`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Google Sheets returned ${response.status}`);

  const csv = await response.text();
  const jobs = parseCSV(csv);
  cache = { jobs, lastSync: new Date().toISOString() };
  console.log(`[sheet] Refreshed — ${jobs.length} jobs`);
  return cache;
}

// Refresh every 6 hours
cron.schedule('0 */6 * * *', () => {
  fetchSheet().catch(err => console.error('[sheet] Cron refresh failed:', err.message));
});

router.get('/', async (req, res) => {
  const now = Date.now();
  const cacheAge = cache.lastSync ? now - new Date(cache.lastSync).getTime() : Infinity;

  // Serve cache if fresh
  if (cache.jobs && cacheAge < CACHE_TTL_MS) {
    return res.json({ jobs: cache.jobs, lastSync: cache.lastSync, count: cache.jobs.length });
  }

  // Try live fetch
  try {
    const data = await fetchSheet();
    res.json({ jobs: data.jobs, lastSync: data.lastSync, count: data.jobs.length });
  } catch (err) {
    console.error('[sheet] Fetch error:', err.message);
    if (cache.jobs) {
      return res.json({ jobs: cache.jobs, lastSync: cache.lastSync, count: cache.jobs.length, stale: true });
    }
    res.status(502).json({ error: err.message });
  }
});

// Exported for use by /api/ingest
export function getCache() { return cache; }
export function appendToCache(jobs) {
  if (!cache.jobs) cache.jobs = [];
  // Deduplicate by URL
  const existingUrls = new Set(cache.jobs.map(j => j.url));
  const newJobs = jobs.filter(j => !existingUrls.has(j.url));
  cache.jobs = [...cache.jobs, ...newJobs];
  cache.lastSync = new Date().toISOString();
}

export default router;
