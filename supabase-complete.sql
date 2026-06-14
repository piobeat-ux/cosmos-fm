-- ==========================================
-- COSMOS FM - ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- ==========================================

-- 1. ОЧИСТКА СТАРЫХ ТАБЛИЦ
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.shows CASCADE;
DROP TABLE IF EXISTS public.hosts CASCADE;
DROP TABLE IF EXISTS public.podcasts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.navigation_links CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. ТАБЛИЦА ПРОФИЛЕЙ (ПОЛЬЗОВАТЕЛИ)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ТАБЛИЦА ОТЕЛЕЙ
CREATE TABLE public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ТАБЛИЦА ВЕДУЩИХ
CREATE TABLE public.hosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  hotel TEXT,
  bio TEXT,
  photo_url TEXT,
  shows TEXT[],
  schedule TEXT,
  color TEXT,
  initials TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ТАБЛИЦА КАТЕГОРИЙ
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ТАБЛИЦА ПЕРЕДАЧ
CREATE TABLE public.shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL,
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

-- 7. ТАБЛИЦА ПОДКАСТОВ
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

-- 8. ТАБЛИЦА ЛАЙКОВ (отдельная для отслеживания кто лайкнул)
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, user_id)
);

-- 9. ТАБЛИЦА НАВИГАЦИИ
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

-- 10. ТАБЛИЦА НАСТРОЕК САЙТА
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- RLS ПОЛИТИКИ (БЕЗОПАСНОСТЬ)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Профили
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Отели
CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin write hotels" ON public.hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ведущие
CREATE POLICY "Public read hosts" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Admin write hosts" ON public.hosts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Категории
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Передачи
CREATE POLICY "Public read shows" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Admin write shows" ON public.shows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Подкасты
CREATE POLICY "Public read podcasts" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Admin write podcasts" ON public.podcasts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Лайки
CREATE POLICY "Public read likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Навигация
CREATE POLICY "Public read navigation" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Admin write navigation" ON public.navigation_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Настройки
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- STORAGE BUCKET ДЛЯ МЕДИА
-- ==========================================

-- Удаляем старый bucket если есть
DELETE FROM storage.objects WHERE bucket_id = 'media';
DELETE FROM storage.buckets WHERE id = 'media';

-- Создаем новый bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Admin can delete media" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- ТРИГГЕР АВТО-АДМИНА
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  IF user_count = 0 THEN
    INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'admin');
  ELSE
    INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
// НАЧАЛЬНЫЕ ДАННЫЕ
// ==========================================

-- Настройки сайта
INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'Cosmos FM'),
('hero_title', 'Голос вашего отеля'),
('hero_subtitle', 'Звуки вашего космоса'),
('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
('stream_url', ''),
('primary_color', '#6366f1'),
('contact_email', 'radio@cosmosfm.ru'),
('contact_phone', '+7 (999) 000-00-00')
ON CONFLICT (key) DO NOTHING;

-- Отели
INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

-- Категории
INSERT INTO public.categories (name, count, color) VALUES
('Музыка', 156, 'from-[#8b5cf6] to-[#6366f1]'),
('Новости', 48, 'from-[#3b82f6] to-[#06b6d4]'),
('Развлечения', 72, 'from-[#ef4444] to-[#f97316]'),
('Обучение', 34, 'from-[#ec4899] to-[#8b5cf6]')
ON CONFLICT DO NOTHING;

-- Ведущие
INSERT INTO public.hosts (name, role, hotel, bio, initials, color) VALUES
('Анна Петрова', 'Ведущая утреннего шоу', 'Cosmos Moscow', '5 лет в индустрии гостеприимства. Любит кофе и добрые утренние разговоры.', 'АП', 'from-[#f59e0b] to-[#f97316]'),
('Михаил Соколов', 'Музыкальный редактор', 'Cosmos St. Petersburg', 'DJ с 10-летним стажем. Подбирает идеальный саундтрек.', 'МС', 'from-[#8b5cf6] to-[#6366f1]'),
('Елена Волкова', 'Ведущая разговорных шоу', 'Cosmos Sochi', 'Журналист и сторителлер. Умеет найти интересную историю.', 'ЕВ', 'from-[#22c55e] to-[#14b8a6]')
ON CONFLICT DO NOTHING;

-- Передачи
INSERT INTO public.shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
('Утренний кофе', 'Начните день с бодрости!', 'Анна Петрова', '07:00', '3ч', 'Утреннее шоу', 'Пн', true),
('Новости отелей', 'Главные новости индустрии', 'Дмитрий Иванов', '10:00', '1ч', 'Новости', 'Пн', false),
('Обеденный микс', 'Лучшая музыка для обеда', 'Мария Козлова', '12:00', '2ч', 'Музыка', 'Пн', false),
('Кофе-брейк', 'Разговоры за чашкой кофе', 'Елена Волкова', '15:00', '1ч', 'Разговорное', 'Пн', false),
('Вечерний чилл', 'Расслабляющая музыка', 'Алексей Смирнов', '18:00', '3ч', 'Музыка', 'Пн', false)
ON CONFLICT DO NOTHING;

-- Подкасты
INSERT INTO public.podcasts (title, description, host_name, episodes, duration, category, likes, color) VALUES
('Истории отелей', 'Удивительные истории из жизни отелей', 'Наталья Лебедева', 24, '45 мин', 'Истории', 128, 'from-[#f59e0b] to-[#f97316]'),
('Секреты консьержа', 'Профессиональные советы', 'Виктор Соколов', 18, '30 мин', 'Обучение', 96, 'from-[#22c55e] to-[#14b8a6]'),
('Кухня шеф-повара', 'Кулинарные секреты', 'Павел Кузнецов', 32, '60 мин', 'Обучение', 215, 'from-[#ef4444] to-[#f97316]')
ON CONFLICT DO NOTHING;

-- Навигация
INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;