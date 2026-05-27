import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();

router.get('/current', async (req, res) => {
  const now = new Date();
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5);

  const stream = await prisma.radioStream.findFirst({
    where: { isActive: true },
    include: { currentShow: { include: { host: true } } }
  });

  const currentSchedule = await prisma.schedule.findFirst({
    where: { dayOfWeek: day, isActive: true, startTime: { lte: time }, endTime: { gt: time } },
    include: { show: { include: { host: true } } }
  });

  const todaySchedule = await prisma.schedule.findMany({
    where: { dayOfWeek: day, isActive: true },
    include: { show: { include: { host: true } } },
    orderBy: { startTime: 'asc' }
  });

  res.json({
    stream,
    onAir: { show: currentSchedule?.show || null, schedule: currentSchedule },
    todaySchedule
  });
});

export default router;
