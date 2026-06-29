
🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ С PROXY

## Что сделано:

1. ✅ Создан Vercel Serverless Function прокси (api/supabase-proxy.js)
2. ✅ Создан прокси клиент (src/lib/supabase-proxy.ts)
3. ✅ Обновлён supabase.ts с поддержкой прокси
4. ✅ Настроен vercel.json для маршрутизации

## Как это работает:

- **На локальной разработке**: прямые запросы к Supabase (быстро)
- **На Vercel (production)**: запросы идут через /api/supabase → прокси → Supabase
- **Преимущество**: Vercel серверы не заблокированы в России!

## 🚀 ДЕПЛОЙ:

```bash
# 1. Локальная проверка
npm run dev

# 2. Сборка
npm run build

# 3. Проверка сборки
npm run preview

# 4. Запушить на GitHub
git add .
git commit -m "feat: add Supabase proxy to bypass Russia blocking"
git push origin main

# 5. На Vercel Dashboard:
#    - Project → Settings → Environment Variables
#    - Убедитесь что есть:
#      * VITE_SUPABASE_URL
#      * VITE_SUPABASE_ANON_KEY
#    - Нажмите "Redeploy"
```

## ✅ ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ:

1. Откройте cosmos-fm.vercel.app **БЕЗ VPN**
2. Сайт должен загрузиться!
3. Откройте DevTools (F12) → Network
4. Проверьте что запросы идут на /api/supabase/...
5. Все данные должны загружаться

## 🔍 ОТЛАДКА:

Если не работает:
1. Проверьте Vercel Function Logs
2. Убедитесь что переменные окружения настроены
3. Проверьте что api/supabase-proxy.js задеплоился

## 📊 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ:

- ✅ Сайт работает БЕЗ VPN на всех устройствах
- ✅ Загрузка быстрая (Vercel CDN)
- ✅ Данные из Supabase загружаются
- ✅ Админка работает
- ✅ Изображения загружаются

## ⚠️ ВАЖНО:

- Vercel Serverless Functions имеют лимит 10 секунд
- Бесплатный тариф: 100GB bandwidth/мес (хватит надолго)
- Прозрачно для пользователя - работает автоматически
