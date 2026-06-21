import fs from 'fs';

// 1. Проверяем .env
console.log('📋 Проверка .env файла...\n');

let envContent = '';
try {
  envContent = fs.readFileSync('.env', 'utf-8');
  console.log('✅ .env файл найден');
  
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch) {
    console.log('URL:', urlMatch[1]);
  } else {
    console.log('❌ VITE_SUPABASE_URL не найден');
  }
  
  if (keyMatch) {
    console.log('Key:', keyMatch[1].substring(0, 20) + '...');
  } else {
    console.log('❌ VITE_SUPABASE_ANON_KEY не найден');
  }
} catch (e) {
  console.log('❌ .env файл не найден! Создайте его:');
  console.log(`
VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=ВАШ_КЛЮЧ_ИЗ_https://supabase.com/dashboard/project/ozchhkjsrstdnowutsow/settings/api
  `);
}

// 2. Создаем тестовый файл для проверки подключения
const testContent = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Тестирование подключения к Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствует URL или ключ!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('\\n📡 Проверка подключения...');
    const { data, error } = await supabase.from('site_settings').select('*').limit(1);
    
    if (error) {
      console.error('❌ Ошибка:', error.message);
      console.error('Code:', error.code);
    } else {
      console.log('✅ Подключение успешно!');
      console.log('Данные:', data);
    }
  } catch (err) {
    console.error('❌ Исключение:', err.message);
  }
}

test();
`;

fs.writeFileSync('test-supabase-connection.mjs', testContent);
console.log('\n✅ Создан тестовый файл test-supabase-connection.mjs');
console.log('Запустите: node test-supabase-connection.mjs');

// 3. Создаем SQL для создания всех таблиц
const sqlContent = `
-- Включаем UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица шоу/передач
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Таблица ведущих
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  hotel TEXT,
  bio TEXT,
  photo_url TEXT,
  color TEXT,
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица подкастов
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица отелей
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица навигации
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'anchor',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица настроек сайта
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies для всех таблиц
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON shows FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hosts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hotels FOR SELECT USING (true);
CREATE POLICY "Public read access" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);

CREATE POLICY "Public write access" ON shows FOR ALL USING (true);
CREATE POLICY "Public write access" ON hosts FOR ALL USING (true);
CREATE POLICY "Public write access" ON podcasts FOR ALL USING (true);
CREATE POLICY "Public write access" ON categories FOR ALL USING (true);
CREATE POLICY "Public write access" ON hotels FOR ALL USING (true);
CREATE POLICY "Public write access" ON navigation_links FOR ALL USING (true);
CREATE POLICY "Public write access" ON site_settings FOR ALL USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read" ON storage.objects;
DROP POLICY IF EXISTS "Public upload" ON storage.objects;
DROP POLICY IF EXISTS "Public update" ON storage.objects;
DROP POLICY IF EXISTS "Public delete" ON storage.objects;

CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Public update" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Public delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- Начальные данные
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

-- Демо данные
INSERT INTO shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
  ('Утреннее шоу', 'Бодрое начало дня', 'Дмитрий Иванов', '08:00', '2ч', 'Музыка', 'Пн', true),
  ('Новости отелей', 'Главные новости', 'Анна Петрова', '12:00', '1ч', 'Новости', 'Пн', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO hosts (name, role, hotel, bio, color, initials) VALUES
  ('Дмитрий Иванов', 'Ведущий', 'Cosmos Moscow', 'Профессиональный радиоведущий', 'from-[#f59e0b] to-[#f97316]', 'ДИ'),
  ('Анна Петрова', 'Журналист', 'Cosmos St. Petersburg', 'Эксперт в области гостеприимства', 'from-[#8b5cf6] to-[#6366f1]', 'АП')
ON CONFLICT (id) DO NOTHING;

INSERT INTO podcasts (title, description, host_name, episodes, duration, category, color) VALUES
  ('Истории успеха', 'Интервью с лидерами', 'Анна Петрова', 12, '45 мин', 'Интервью', 'from-[#6366f1] to-[#8b5cf6]'),
  ('Тренды гостеприимства', 'Что нового в отелях', 'Дмитрий Иванов', 8, '30 мин', 'Обучение', 'from-[#22c55e] to-[#14b8a6]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name, icon, description) VALUES
  ('Музыка', '🎵', 'Музыкальные программы'),
  ('Новости', '📰', 'Новости индустрии'),
  ('Интервью', '🎙️', 'Интервью с экспертами')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotels (name, city) VALUES
  ('Cosmos Moscow', 'Москва'),
  ('Cosmos St. Petersburg', 'Санкт-Петербург'),
  ('Cosmos Sochi', 'Сочи')
ON CONFLICT (id) DO NOTHING;
`;

fs.writeFileSync('setup-supabase.sql', sqlContent);
console.log('\n✅ Создан SQL файл setup-supabase.sql');
console.log('Выполните его в Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/ozchhkjsrstdnowutsow/sql/new');

console.log('\n' + '='.repeat(60));
console.log('ИНСТРУКЦИЯ:');
console.log('='.repeat(60));
console.log('1. Проверьте .env файл (должен быть в корне проекта)');
console.log('2. Запустите: node test-supabase-connection.mjs');
console.log('3. Если ошибка - выполните SQL в Supabase Dashboard');
console.log('4. Перезапустите: npm run dev');