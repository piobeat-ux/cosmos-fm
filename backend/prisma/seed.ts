import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const host = await prisma.host.create({
    data: {
      name: 'Анна Петрова',
      initials: 'АП',
      position: 'Ведущая утреннего шоу',
      bio: '5 лет в индустрии гостеприимства. Любит кофе и добрые утренние разговоры.',
      telegramUsername: 'anna_example'
    }
  });

  const show = await prisma.show.create({
    data: {
      title: 'Утренний кофе',
      description: 'Бодрое начало дня с музыкой и разговорами',
      hostId: host.id
    }
  });

  await prisma.schedule.createMany({
    data: [
      { showId: show.id, dayOfWeek: 1, startTime: '07:00', endTime: '10:00', isActive: true },
      { showId: show.id, dayOfWeek: 3, startTime: '07:00', endTime: '10:00', isActive: true },
      { showId: show.id, dayOfWeek: 5, startTime: '07:00', endTime: '10:00', isActive: true },
    ]
  });

  await prisma.radioStream.create({
    data: {
      name: 'Cosmos FM Main',
      streamUrl: 'https://radio.example.com/stream.mp3',
      isActive: true
    }
  });

  console.log('✅ Демо-данные созданы');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
