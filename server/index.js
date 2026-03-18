import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import claudeRouter from './routes/claude.js';
import sheetRouter from './routes/sheet.js';
import pipelineRouter from './routes/pipeline.js';
import ingestRouter from './routes/ingest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: /localhost/ }));
app.use(express.json());

// Serve dashboard
app.use(express.static(path.join(__dirname, '../dashboard/dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
});

// API routes
app.use('/api/claude', claudeRouter);
app.use('/api/jobs', sheetRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/ingest', ingestRouter);

app.listen(PORT, () => {
  console.log(`⚔ The Prep Knight — Paratus ante pugnam — running at http://localhost:${PORT}`);
});
