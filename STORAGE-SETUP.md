# Настройка Supabase Storage (Решение проблемы RLS)

## Проблема
Ошибка: "new row violates row-level security policy"

## Решение через интерфейс Supabase (БЕЗ SQL!)

### Шаг 1: Создайте бакеты

1. Откройте https://app.supabase.com
2. Ваш проект → **Storage** (в левом меню)
3. Нажмите **"New bucket"**

**Бакет 1:**
- Name: `media`
- ✅ **Public bucket** (ВАЖНО! Включите эту опцию!)
- Create bucket

**Бакет 2:**
- Name: `audio`
- ✅ **Public bucket** (ВАЖНО! Включите эту опцию!)
- Create bucket

### Шаг 2: Настройте политики через интерфейс

Для каждого бакета (media и audio):

1. Нажмите на бакет
2. Нажмите **"Policies"** (вкладка сверху)
3. Нажмите **"New policy"**
4. Выберите **"For full customization"**
5. Заполните:
   - Policy name: `Public Access`
   - Allowed operation: **ALL** (выберите все: INSERT, SELECT, UPDATE, DELETE)
   - Target roles: **public**
   - USING expression: `true`
   - WITH CHECK expression: `true`
6. Нажмите **"Review"** → **"Save policy"**

### Шаг 3: Проверьте работу

1. Обновите страницу приложения
2. Попробуйте загрузить файл
3. Должно работать!

## Альтернатива: Используйте URL

Пока не настроили Storage, используйте кнопку **"Использовать URL"** и вставляйте прямые ссылки на файлы.

## Если всё ещё не работает

1. Убедитесь что бакеты созданы и **Public**
2. Убедитесь что политики созданы для **public** роли
3. Попробуйте выйти и войти снова в админку
