import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { adminGuard } from '../middleware/adminGuard';
const prisma = new PrismaClient();
const router = Router();

router.get('/me', adminGuard, (req, res) => {
  res.json({ ok: true, admin: (req as any).admin });
});

router.post('/hosts', adminGuard, async (req, res) => {
  const host = await prisma.host.create({ data: req.body });
  res.json(host);
});

router.post('/shows', adminGuard, async (req, res) => {
  const show = await prisma.show.create({ data: req.body });
  res.json(show);
});

router.post('/schedule', adminGuard, async (req, res) => {
  const schedule = await prisma.schedule.create({ data: req.body });
  res.json(schedule);
});

router.put('/stream', adminGuard, async (req, res) => {
  const { streamUrl, isActive } = req.body;
  const stream = await prisma.radioStream.updateMany({
    data: { streamUrl, isActive }
  });
  res.json(stream);
});

export default router;
