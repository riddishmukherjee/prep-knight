import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../data/pipeline.json');

async function read() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/pipeline
router.get('/', async (req, res) => {
  const data = await read();
  res.json(data);
});

// POST /api/pipeline — append new entry
router.post('/', async (req, res) => {
  const { company, title, url, fitScore, status, appliedAt, notes } = req.body;

  if (!company) return res.status(400).json({ error: 'company is required' });

  const entry = {
    company,
    title: title || '',
    url: url || '',
    fitScore: fitScore ?? null,
    status: status || 'scouted',
    appliedAt: appliedAt || new Date().toISOString(),
    notes: notes || '',
  };

  const data = await read();
  data.push(entry);
  await write(data);

  res.status(201).json({ ok: true, index: data.length - 1, entry });
});

// PATCH /api/pipeline/:id — update status by index
router.patch('/:id', async (req, res) => {
  const idx = parseInt(req.params.id, 10);
  const data = await read();

  if (isNaN(idx) || idx < 0 || idx >= data.length) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  data[idx] = { ...data[idx], ...req.body };
  await write(data);

  res.json({ ok: true, entry: data[idx] });
});

export default router;
