import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🔧 === ИНИЦИАЛИЗАЦИЯ SUPABASE ===\n');

// Читаем .env
const envContent = fs.readFileSync('.env', 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.log('❌ Не найдены переменные в .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const anonKey = keyMatch[1].trim();

console.log('URL:', supabaseUrl);
console.log('Key:', anonKey.substring(0, 30) + '...');
console.log('');

// SQL для создания всех таблиц
const sql = `
-- Создаем таблицы БЕЗ RLS для начала (для тестирования)

CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_name TEXT,
  time TEXT,
  duration TEXT,
  category TEXT,
  day_of_week TEXT,
  is_live BOOLEAN DEFAULT false,
  cover_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  hotel TEXT,
  bio TEXT,
  photo_url TEXT,
  color TEXT,
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_name TEXT,
  episodes INTEGER DEFAULT 0,
  duration TEXT,
  category TEXT,
  likes INTEGER DEFAULT 0,
  color TEXT,
  cover_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'anchor',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ОТКЛЮЧАЕМ RLS для всех таблиц (для быстрого старта)
ALTER TABLE shows DISABLE ROW LEVEL SECURITY;
ALTER TABLE hosts DISABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Вставляем демо данные
INSERT INTO site_settings (key, value) VALUES 
  ('site_title', 'Cosmos FM'),
  ('hero_title', 'Голос вашего отеля'),
  ('hero_subtitle', 'Звуки вашего космоса'),
  ('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
  ('stream_url', 'https://stream.radioparadise.com/aac-128'),
  ('primary_color', '#6366f1'),
  ('neppy_image', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO navigation_links (label, url, order_index, is_active) VALUES
  ('Эфир', '#/', 1, true),
  ('Расписание', '#/schedule', 2, true),
  ('Ведущие', '#/hosts', 3, true),
  ('Подкасты', '#/podcasts', 4, true),
  ('О нас', '#/about', 5, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
  ('Утреннее шоу', 'Бодрое начало дня с лучшими хитами', 'Дмитрий Иванов', '08:00', '2ч', 'Музыка', 'Пн', true),
  ('Новости отелей', 'Главные новости индустрии', 'Анна Петрова', '12:00', '1ч', 'Новости', 'Пн', false),
  ('Вечерний джаз', 'Расслабляющая музыка', 'Михаил Соколов', '20:00', '3ч', 'Музыка', 'Пт', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO hosts (name, role, hotel, bio, color, initials) VALUES
  ('Дмитрий Иванов', 'Ведущий утреннего шоу', 'Cosmos Moscow', 'Профессиональный радиоведущий с 10-летним опытом', 'from-[#f59e0b] to-[#f97316]', 'ДИ'),
  ('Анна Петрова', 'Журналист', 'Cosmos St. Petersburg', 'Эксперт в области гостеприимства', 'from-[#8b5cf6] to-[#6366f1]', 'АП'),
  ('Михаил Соколов', 'Музыкальный редактор', 'Cosmos Sochi', 'DJ с 15-летним стажем', 'from-[#22c55e] to-[#14b8a6]', 'МС')
ON CONFLICT (id) DO NOTHING;

INSERT INTO podcasts (title, description, host_name, episodes, duration, category, color) VALUES
  ('Истории успеха', 'Интервью с лидерами индустрии', 'Анна Петрова', 12, '45 мин', 'Интервью', 'from-[#6366f1] to-[#8b5cf6]'),
  ('Тренды гостеприимства', 'Что нового в мире отелей', 'Дмитрий Иванов', 8, '30 мин', 'Обучение', 'from-[#22c55e] to-[#14b8a6]'),
  ('Музыка без границ', 'Лучшие мировые хиты', 'Михаил Соколов', 24, '60 мин', 'Музыка', 'from-[#f59e0b] to-[#f97316]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name, icon, description) VALUES
  ('Музыка', '🎵', 'Музыкальные программы'),
  ('Новости', '📰', 'Новости индустрии'),
  ('Интервью', '🎙️', 'Интервью с экспертами'),
  ('Обучение', '📚', 'Образовательный контент')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotels (name, city) VALUES
  ('Cosmos Moscow', 'Москва'),
  ('Cosmos St. Petersburg', 'Санкт-Петербург'),
  ('Cosmos Sochi', 'Сочи')
ON CONFLICT (id) DO NOTHING;
`;

console.log('✅ SQL скрипт подготовлен');
console.log('\n📋 ИНСТРУКЦИЯ:');
console.log('1. Откройте: https://supabase.com/dashboard');
console.log('2. Выберите ваш проект');
console.log('3. Откройте SQL Editor');
console.log('4. Скопируйте SQL из файла setup-final.sql');
console.log('5. Нажмите Run');
console.log('6. Перезапустите приложение: npm run dev');

// Сохраняем SQL в файл
fs.writeFileSync('setup-final.sql', sql);
console.log('\n✅ SQL сохранен в setup-final.sql');

rl.close();