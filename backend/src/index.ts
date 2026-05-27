import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import streamRoutes from './routes/stream';
import showsRoutes from './routes/shows';
import podcastsRoutes from './routes/podcasts';
import hostsRoutes from './routes/hosts';
import adminRoutes from './routes/admin';
import { telegramAuth } from './middleware/telegramAuth';
import { initBot } from './services/bot.service';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/stream', streamRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/podcasts', podcastsRoutes);
app.use('/api/hosts', hostsRoutes);
app.use('/api/admin', telegramAuth, adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🚀 API: http://localhost:${PORT}`);
  initBot();
});
