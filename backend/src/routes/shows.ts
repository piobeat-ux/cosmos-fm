import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req, res) => {
  const shows = await prisma.show.findMany({
    include: { host: true, schedule: true, _count: { select: { podcasts: true } } }
  });
  res.json(shows);
});

router.get('/:id', async (req, res) => {
  const show = await prisma.show.findUnique({
    where: { id: Number(req.params.id) },
    include: { host: true, podcasts: { orderBy: { createdAt: 'desc' } }, schedule: true }
  });
  if (!show) return res.status(404).json({ error: 'Not found' });
  res.json(show);
});

export default router;
