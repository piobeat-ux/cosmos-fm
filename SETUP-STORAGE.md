# Настройка Supabase Storage

## Проблема
При загрузке файлов возникают ошибки:
- "Bucket not found" - бакеты не созданы
- "row violates row-level security policy" - не настроены RLS политики

## Решение

### Шаг 1: Создайте бакеты в Supabase

1. Откройте https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в раздел **Storage**
4. Нажмите **New bucket**

**Бакет 1:**
- Name: `media`
- Public: ✅ **Да** (ОБЯЗАТЕЛЬНО!)
- File size limit: 10485760 (10MB)

**Бакет 2:**
- Name: `audio`
- Public: ✅ **Да** (ОБЯЗАТЕЛЬНО!)
- File size limit: 52428800 (50MB)

### Шаг 2: Настройте политики доступа (RLS)

1. Перейдите в **SQL Editor** (в левом меню)
2. Нажмите **New query**
3. Выполните следующий SQL:

```sql
-- Отключаем RLS для бакета media
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Разрешить все операции с media
CREATE POLICY "Public Access Media"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Разрешить все операции с audio
CREATE POLICY "Public Access Audio"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'audio')
WITH CHECK (bucket_id = 'audio');
```

4. Нажмите **Run** (или Ctrl+Enter)

### Шаг 3: Проверьте работу

1. Обновите страницу приложения
2. Попробуйте загрузить файл
3. Файлы должны загружаться без ошибок!

## Альтернативный вариант

Если не хотите использовать Supabase Storage:
- Загружайте файлы на любой хостинг (Imgur, Cloudinary и т.д.)
- Вставляйте прямые ссылки через кнопку "URL"
