import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  const podcasts = await prisma.podcast.findMany({
    include: { show: true, host: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(podcasts);
});

router.post('/', upload.single('audio'), async (req, res) => {
  const { title, description, showId, hostId } = req.body;
  const podcast = await prisma.podcast.create({
    data: {
      title,
      description: description || '',
      audioUrl: `/uploads/${req.file?.filename}`,
      showId: Number(showId),
      hostId: Number(hostId),
      duration: 0
    }
  });
  res.json(podcast);
});

export default router;
