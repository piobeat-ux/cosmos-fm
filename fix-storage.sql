-- ==========================================
-- ИСПРАВЛЕНИЕ STORAGE И RLS ПОЛИТИК
-- ==========================================

-- 1. ПРОВЕРКА СУЩЕСТВОВАНИЯ ТАБЛИЦ
DO $$
BEGIN
  -- Создаем таблицы если не существуют
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
    CREATE TABLE public.hotels (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT,
      logo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hosts') THEN
    CREATE TABLE public.hosts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      hotel TEXT,
      bio TEXT,
      photo_url TEXT,
      shows TEXT[],
      schedule TEXT,
      color TEXT,
      initials TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE TABLE public.categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      color TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shows') THEN
    CREATE TABLE public.shows (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcasts') THEN
    CREATE TABLE public.podcasts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      host_name TEXT,
      episodes INTEGER DEFAULT 0,
      duration TEXT,
      category TEXT,
      likes INTEGER DEFAULT 0,
      color TEXT,
      audio_url TEXT,
      cover_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'navigation_links') THEN
    CREATE TABLE public.navigation_links (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'anchor',
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      target TEXT DEFAULT '_self',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
    CREATE TABLE public.site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 2. ВКЛЮЧЕНИЕ RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. УДАЛЕНИЕ СТАРЫХ ПОЛИТИК
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admin write hotels" ON public.hotels;
DROP POLICY IF EXISTS "Public read hosts" ON public.hosts;
DROP POLICY IF EXISTS "Admin write hosts" ON public.hosts;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "Public read shows" ON public.shows;
DROP POLICY IF EXISTS "Admin write shows" ON public.shows;
DROP POLICY IF EXISTS "Public read podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Admin write podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_links;
DROP POLICY IF EXISTS "Admin write navigation" ON public.navigation_links;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin write settings" ON public.site_settings;

-- 4. СОЗДАНИЕ НОВЫХ ПОЛИТИК (ПРОСТЫЕ - РАЗРЕШАЕМ ВСЕМ)

-- Отели
CREATE POLICY "Allow all hotels" ON public.hotels FOR ALL USING (true) WITH CHECK (true);

-- Ведущие
CREATE POLICY "Allow all hosts" ON public.hosts FOR ALL USING (true) WITH CHECK (true);

-- Категории
CREATE POLICY "Allow all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Передачи
CREATE POLICY "Allow all shows" ON public.shows FOR ALL USING (true) WITH CHECK (true);

-- Подкасты
CREATE POLICY "Allow all podcasts" ON public.podcasts FOR ALL USING (true) WITH CHECK (true);

-- Навигация
CREATE POLICY "Allow all navigation" ON public.navigation_links FOR ALL USING (true) WITH CHECK (true);

-- Настройки
CREATE POLICY "Allow all settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. STORAGE BUCKET
-- Проверяем существование bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
  END IF;
END $$;

-- Удаляем старые политики storage
DROP POLICY IF EXISTS "Allow all media" ON storage.objects;

-- Создаем простую политику для storage
CREATE POLICY "Allow all media" ON storage.objects FOR ALL USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- 6. НАЧАЛЬНЫЕ ДАННЫЕ
INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'Cosmos FM'),
('hero_title', 'Голос вашего отеля'),
('hero_subtitle', 'Звуки вашего космоса'),
('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
('stream_url', ''),
('primary_color', '#6366f1')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, count, color) VALUES
('Музыка', 156, 'from-[#8b5cf6] to-[#6366f1]'),
('Новости', 48, 'from-[#3b82f6] to-[#06b6d4]'),
('Развлечения', 72, 'from-[#ef4444] to-[#f97316]'),
('Обучение', 34, 'from-[#ec4899] to-[#8b5cf6]')
ON CONFLICT DO NOTHING;

INSERT INTO public.hosts (name, role, hotel, bio, initials, color) VALUES
('Анна Петрова', 'Ведущая утреннего шоу', 'Cosmos Moscow', '5 лет в индустрии гостеприимства', 'АП', 'from-[#f59e0b] to-[#f97316]'),
('Михаил Соколов', 'Музыкальный редактор', 'Cosmos St. Petersburg', 'DJ с 10-летним стажем', 'МС', 'from-[#8b5cf6] to-[#6366f1]'),
('Елена Волкова', 'Ведущая разговорных шоу', 'Cosmos Sochi', 'Журналист и сторителлер', 'ЕВ', 'from-[#22c55e] to-[#14b8a6]')
ON CONFLICT DO NOTHING;

INSERT INTO public.shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
('Утренний кофе', 'Начните день с бодрости!', 'Анна Петрова', '07:00', '3ч', 'Утреннее шоу', 'Пн', true),
('Новости отелей', 'Главные новости индустрии', 'Дмитрий Иванов', '10:00', '1ч', 'Новости', 'Пн', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.podcasts (title, description, host_name, episodes, duration, category, likes, color) VALUES
('Истории отелей', 'Удивительные истории из жизни отелей', 'Наталья Лебедева', 24, '45 мин', 'Истории', 128, 'from-[#f59e0b] to-[#f97316]')
ON CONFLICT DO NOTHING;

INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;