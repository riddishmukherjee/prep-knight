import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCache, appendToCache } from './sheet.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, '../data/jobs-cache.json');

const REQUIRED_FIELDS = ['title', 'company', 'url', 'fitScore'];

router.post('/', async (req, res) => {
  const body = req.body;
  const items = Array.isArray(body) ? body : [body];

  const valid = [];
  const rejected = [];

  for (const job of items) {
    const missing = REQUIRED_FIELDS.filter(f => job[f] === undefined || job[f] === '');
    if (missing.length) {
      rejected.push({ job, reason: `Missing fields: ${missing.join(', ')}` });
      continue;
    }
    valid.push({
      title:           String(job.title),
      company:         String(job.company),
      location:        String(job.location        || ''),
      url:             String(job.url),
      source:          String(job.source          || 'n8n'),
      publishedAt:     String(job.publishedAt     || new Date().toISOString()),
      fitScore:        job.fitScore,
      seniority:       String(job.seniority       || ''),
      topReason:       String(job.topReason       || ''),
      missingKeywords: String(job.missingKeywords || ''),
      flag:            String(job.flag            || 'none'),
      status:          String(job.status          || 'new'),
      addedAt:         String(job.addedAt         || new Date().toISOString()),
    });
  }

  if (valid.length) {
    // Merge into the in-memory sheet cache
    appendToCache(valid);

    // Persist to backup file
    try {
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      const existing = await fs.readFile(CACHE_FILE, 'utf-8').then(JSON.parse).catch(() => []);
      const merged = [...existing, ...valid];
      await fs.writeFile(CACHE_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ingest] Cache file write failed:', err.message);
    }
  }

  if (rejected.length) {
    console.warn('[ingest] Rejected items:', JSON.stringify(rejected, null, 2));
  }

  const total = getCache()?.jobs?.length ?? valid.length;
  console.log(`[ingest] Received ${valid.length} valid jobs (${rejected.length} rejected). Total in cache: ${total}`);

  res.json({ received: valid.length, rejected: rejected.length, total });
});

export default router;
