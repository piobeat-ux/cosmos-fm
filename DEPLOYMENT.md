# Cosmos FM - Deployment Instructions

## 🔧 Настройка окружения

1. Создайте файл `.env.local` в корне проекта:

```env
VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_anon_key_из_supabase
```

2. Как получить ключи:
   - Откройте https://app.supabase.com
   - Выберите ваш проект
   - Settings → API
   - Скопируйте:
     - Project URL → VITE_SUPABASE_URL
     - anon/public key → VITE_SUPABASE_ANON_KEY

## 🚀 Локальная разработка

```bash
npm install
npm run dev
```

## 📦 Production build

```bash
npm run build
npm run preview
```

## 🌐 Deploy на Vercel

1. Убедитесь что .env.local настроен локально
2. Добавьте переменные окружения в Vercel:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
   
3. Запушьте изменения:
```bash
git add .
git commit -m "fix: final fixes"
git push origin main
```

4. Vercel автоматически пересоберёт проект

## ✅ Чеклист после деплоя

- [ ] Откройте сайт в режиме инкогнито
- [ ] Откройте DevTools → Console
- [ ] Не должно быть ошибок 404
- [ ] Данные из Supabase загружаются
- [ ] Плеер работает
- [ ] Персонаж отображается
