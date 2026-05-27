import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN!;

export function validateTelegramInitData(initData: string): { valid: boolean; user?: any } {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const keys = Array.from(urlParams.keys()).sort();
  const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');

  const hmac1 = crypto.createHmac('sha256', 'WebAppData');
  hmac1.update(BOT_TOKEN);
  const secretKey = hmac1.digest();

  const hmac2 = crypto.createHmac('sha256', secretKey);
  hmac2.update(dataCheckString);
  const computedHash = hmac2.digest('hex');

  if (computedHash !== hash) {
    return { valid: false };
  }

  const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
  if (Math.floor(Date.now() / 1000) - authDate > 86400) {
    return { valid: false };
  }

  const user = JSON.parse(urlParams.get('user') || '{}');
  return { valid: true, user };
}

export const telegramAuth = (req: Request, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'] as string;
  if (!initData) {
    return res.status(401).json({ error: 'Missing initData' });
  }

  const { valid, user } = validateTelegramInitData(initData);
  if (!valid || !user?.id) {
    return res.status(403).json({ error: 'Invalid initData' });
  }

  (req as any).telegramUser = {
    id: user.id,
    firstName: user.first_name,
    username: user.username,
    photoUrl: user.photo_url,
  };
  next();
};