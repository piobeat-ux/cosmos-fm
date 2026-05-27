import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).telegramUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const admin = await prisma.admin.findUnique({
    where: { telegramId: BigInt(user.id) }
  });

  if (!admin) return res.status(403).json({ error: 'Admin only' });
  (req as any).admin = admin;
  next();
};
