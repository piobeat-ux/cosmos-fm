-- ==========================================
-- COSMOS FM - ТАБЛИЦА НАВИГАЦИОННЫХ ССЫЛОК
-- ==========================================

-- 1. СОЗДАНИЕ ТАБЛИЦЫ
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'anchor', -- 'internal', 'external', 'anchor'
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  target TEXT DEFAULT '_self', -- '_self', '_blank'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS ПОЛИТИКИ
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read navigation" ON public.navigation_links 
  FOR SELECT USING (true);

CREATE POLICY "Admin write navigation" ON public.navigation_links 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. НАЧАЛЬНЫЕ ДАННЫЕ
INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true);