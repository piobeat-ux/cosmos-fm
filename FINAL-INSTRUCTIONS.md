
🚀 === ИНСТРУКЦИЯ ПО ЗАПУСКУ ===

1. Проверьте таблицы в Supabase:
   - Зайдите в Supabase Dashboard → Table Editor
   - Убедитесь что существуют таблицы:
     * shows
     * hosts
     * podcasts
     * categories
     * hotels
     * navigation (если нет - создайте пустую)
     * settings (если нет - создайте пустую)

2. Проверьте .env.local:
   VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
   VITE_SUPABASE_ANON_KEY=ваш_ключ

3. Запустите локально:
   npm run build
   npm run preview

4. Запушите на Vercel:
   git add .
   git commit -m "fix: supabase 404 errors and TZ implementation"
   git push origin main

5. На Vercel:
   - Зайдите в Dashboard → Project
   - Settings → Environment Variables
   - Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
   - Нажмите "Redeploy"

6. После деплоя:
   - Откройте сайт в режиме инкогнито
   - Ошибок 404 быть не должно (данные загрузятся или будут пустыми)
   - ReferenceError должен исчезнуть
