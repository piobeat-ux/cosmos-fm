import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const bot = new Telegraf(process.env.BOT_TOKEN!);
const prisma = new PrismaClient();

bot.command('start', async (ctx) => {
  await ctx.reply('🎙 Добро пожаловать в Cosmos FM!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎧 Открыть радио', web_app: { url: process.env.WEBAPP_URL! } }]
      ]
    }
  });
});

bot.command('startadmin', async (ctx) => {
  await ctx.reply('🎛 Панель управления', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть админку', web_app: { url: process.env.ADMIN_WEBAPP_URL! } }]
      ]
    }
  });
});

export function initBot() {
  if (process.env.WEBHOOK_URL) {
    bot.telegram.setWebhook(process.env.WEBHOOK_URL);
    console.log('✅ Webhook установлен');
  } else {
    bot.launch();
    console.log('✅ Бот запущен (polling)');
  }
}

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes() + 5;
  const time = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const upcoming = await prisma.schedule.findMany({
    where: { dayOfWeek: day, startTime: time, isActive: true },
    include: { show: { include: { host: true } } }
  });

  for (const item of upcoming) {
    console.log(`🔔 Эфир через 5 мин: ${item.show.title}`);
  }
});

export { bot };
