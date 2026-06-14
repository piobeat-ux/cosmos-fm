-- ==========================================
-- ИСПРАВЛЕНИЕ STORAGE И CORS
-- ==========================================

-- 1. Проверка bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
  END IF;
END $$;

-- 2. Удаление старых политик
DROP POLICY IF EXISTS "Allow all media" ON storage.objects;
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

-- 3. Создание простых политик (разрешаем всё)
CREATE POLICY "Allow all media operations" ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'media') 
  WITH CHECK (bucket_id = 'media');

-- 4. Проверка таблиц
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;