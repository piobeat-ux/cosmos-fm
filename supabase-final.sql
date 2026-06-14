-- ==========================================
-- COSMOS FM - ДОПОЛНИТЕЛЬНЫЕ ТАБЛИЦЫ
-- ==========================================

-- 1. ТАБЛИЦА ОТЕЛЕЙ
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admin write hotels" ON public.hotels;

CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin write hotels" ON public.hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. ТАБЛИЦА НАВИГАЦИИ
CREATE TABLE IF NOT EXISTS public.navigation_links (
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

ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read nav" ON public.navigation_links;
DROP POLICY IF EXISTS "Admin write nav" ON public.navigation_links;

CREATE POLICY "Public read nav" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Admin write nav" ON public.navigation_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. НАЧАЛЬНЫЕ ДАННЫЕ
INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;