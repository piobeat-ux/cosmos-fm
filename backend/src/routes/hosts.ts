import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req, res) => {
  const hosts = await prisma.host.findMany({ include: { shows: true } });
  res.json(hosts);
});

router.get('/:id', async (req, res) => {
  const host = await prisma.host.findUnique({
    where: { id: Number(req.params.id) },
    include: { shows: true, podcasts: { orderBy: { createdAt: 'desc' } } }
  });
  res.json(host);
});

export default router;
