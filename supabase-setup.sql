-- ==========================================
-- COSMOS FM - ПОЛНАЯ НАСТРОЙКА SUPABASE
-- ==========================================

-- 1. УДАЛЕНИЕ СТАРЫХ ТАБЛИЦ
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.shows CASCADE;
DROP TABLE IF EXISTS public.hosts CASCADE;
DROP TABLE IF EXISTS public.podcasts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. СОЗДАНИЕ ТАБЛИЦ

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS ПОЛИТИКИ

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public read" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.hotels FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.shows FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.hosts FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.podcasts FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. STORAGE BUCKET

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Admin write media" ON storage.objects;

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin write media" ON storage.objects FOR ALL USING (
  bucket_id = 'media' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. ТРИГГЕР АВТО-АДМИНА

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count = 0 THEN
    INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. НАЧАЛЬНЫЕ ДАННЫЕ

INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'Cosmos FM'),
('hero_title', 'Голос вашего отеля'),
('hero_subtitle', 'Звуки вашего космоса'),
('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
('stream_url', ''),
('primary_color', '#6366f1'),
('contact_email', 'radio@cosmosfm.ru'),
('contact_phone', '+7 (999) 000-00-00');

INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи');

INSERT INTO public.categories (name, count, color) VALUES
('Музыка', 156, 'from-[#8b5cf6] to-[#6366f1]'),
('Новости', 48, 'from-[#3b82f6] to-[#06b6d4]'),
('Развлечения', 72, 'from-[#ef4444] to-[#f97316]'),
('Обучение', 34, 'from-[#ec4899] to-[#8b5cf6]');

INSERT INTO public.hosts (name, role, hotel, bio, initials, color) VALUES
('Анна Петрова', 'Ведущая утреннего шоу', 'Cosmos Moscow', '5 лет в индустрии гостеприимства', 'АП', 'from-[#f59e0b] to-[#f97316]'),
('Михаил Соколов', 'Музыкальный редактор', 'Cosmos St. Petersburg', 'DJ с 10-летним стажем', 'МС', 'from-[#8b5cf6] to-[#6366f1]'),
('Елена Волкова', 'Ведущая разговорных шоу', 'Cosmos Sochi', 'Журналист и сторителлер', 'ЕВ', 'from-[#22c55e] to-[#14b8a6]');

INSERT INTO public.shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
('Утренний кофе', 'Начните день с бодрости!', 'Анна Петрова', '07:00', '3ч', 'Утреннее шоу', 'Пн', true),
('Новости отелей', 'Главные новости индустрии', 'Дмитрий Иванов', '10:00', '1ч', 'Новости', 'Пн', false),
('Обеденный микс', 'Лучшая музыка для обеда', 'Мария Козлова', '12:00', '2ч', 'Музыка', 'Пн', false);

INSERT INTO public.podcasts (title, description, host_name, episodes, duration, category, likes, color) VALUES
('Истории отелей', 'Удивительные истории из жизни отелей', 'Наталья Лебедева', 24, '45 мин', 'Истории', 128, 'from-[#f59e0b] to-[#f97316]'),
('Секреты консьержа', 'Профессиональные советы', 'Виктор Соколов', 18, '30 мин', 'Обучение', 96, 'from-[#22c55e] to-[#14b8a6]'),
('Кухня шеф-повара', 'Кулинарные секреты', 'Павел Кузнецов', 32, '60 мин', 'Обучение', 215, 'from-[#ef4444] to-[#f97316]');