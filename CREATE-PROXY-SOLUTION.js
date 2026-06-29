import fs from 'fs';

console.log('🔧 === СОЗДАНИЕ PROXY ДЛЯ ОБОХДА БЛОКИРОВКИ SUPABASE ===\n');

// 1. Создаём директорию api
console.log('1/5 Создание Vercel Serverless Functions...');

if (!fs.existsSync('api')) {
  fs.mkdirSync('api', { recursive: true });
}

// 2. Создаём прокси для Supabase
console.log('2/5 Создание api/supabase-proxy.js...');

const proxyCode = `// Vercel Serverless Function - прокси к Supabase
// Обходит блокировку Supabase в России

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, prefer');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  try {
    // Получаем путь запроса (убираем /api/supabase)
    let path = req.url.replace('/api/supabase', '');
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    const targetUrl = \`\${SUPABASE_URL}\${path}\`;
    
    // Логируем для отладки
    console.log('Proxying to:', targetUrl);
    console.log('Method:', req.method);
    
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': \`Bearer \${SUPABASE_KEY}\`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    // Логируем ошибки
    if (!response.ok) {
      console.error('Proxy error:', response.status, data);
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy exception:', error);
    res.status(500).json({ error: error.message });
  }
}
`;

fs.writeFileSync('api/supabase-proxy.js', proxyCode);
console.log('✅ api/supabase-proxy.js создан');

// 3. Создаём supabase-proxy.ts для TypeScript
console.log('3/5 Создание src/lib/supabase-proxy.ts...');

const proxyClient = `// Прокси клиент для обхода блокировки Supabase в России

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Определяем использовать ли прокси
// Если мы в production на Vercel - используем прокси
const USE_PROXY = typeof window !== 'undefined' && 
  window.location.hostname.includes('vercel.app');

// Базовый URL для запросов
const BASE_URL = USE_PROXY ? '' : supabaseUrl;
const PROXY_PATH = USE_PROXY ? '/api/supabase' : '';

// Custom fetch с прокси и таймаутом 30 секунд
export const proxyFetch = async (url: string, options: any = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    // Если это запрос к Supabase
    if (url && url.includes('supabase.co')) {
      // Извлекаем путь после URL Supabase
      const path = url.replace(supabaseUrl, '');
      const proxyUrl = \`\${PROXY_PATH}\${path}\`;
      
      console.log('Using proxy:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': \`Bearer \${supabaseKey}\`,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    }
    
    // Обычный fetch для других запросов
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch error:', error);
    throw error;
  }
};

// Экспортируем для совместимости
export { supabaseUrl, supabaseKey, USE_PROXY };
`;

if (!fs.existsSync('src/lib')) {
  fs.mkdirSync('src/lib', { recursive: true });
}

fs.writeFileSync('src/lib/supabase-proxy.ts', proxyClient);
console.log('✅ src/lib/supabase-proxy.ts создан');

// 4. Обновляем supabase.ts с поддержкой прокси
console.log('4/5 Обновление src/lib/supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';
import { proxyFetch, supabaseUrl, supabaseKey } from './supabase-proxy';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing. Check .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: \`Bearer \${supabaseKey}\`,
    },
    fetch: proxyFetch,
  },
});

export async function signInAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    console.error('SignIn error:', err);
    return { data: null, error: err };
  }
}

export async function signUpAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  } catch (err) {
    console.error('SignUp error:', err);
    return { data: null, error: err };
  }
}

export async function signOutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('SignOut error:', err);
    return { error: err };
  }
}

export async function getShows() {
  try {
    const { data, error } = await supabase.from('shows').select('*').order('time');
    return { data: data || [], error };
  } catch (err) {
    console.error('getShows error:', err);
    return { data: [], error: err };
  }
}

export async function getHosts() {
  try {
    const { data, error } = await supabase.from('hosts').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getHosts error:', err);
    return { data: [], error: err };
  }
}

export async function getPodcasts() {
  try {
    const { data, error } = await supabase.from('podcasts').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getPodcasts error:', err);
    return { data: [], error: err };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getCategories error:', err);
    return { data: [], error: err };
  }
}

export async function getHotels() {
  try {
    const { data, error } = await supabase.from('hotels').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getHotels error:', err);
    return { data: [], error: err };
  }
}

export async function getNavigation() {
  try {
    const { data, error } = await supabase.from('navigation_links').select('*').order('order_index', { ascending: true });
    return { data: data || [], error };
  } catch (err) {
    console.error('getNavigation error:', err);
    return { data: [], error: err };
  }
}

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getSettings error:', err);
    return { data: [], error: err };
  }
}

export async function updateSetting(key: string, value: any) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    return { data, error };
  } catch (err) {
    console.error('updateSetting error:', err);
    return { data: null, error: err };
  }
}

export async function updateSettings(settings: Record<string, any>) {
  try {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    );
    const results = await Promise.all(updates);
    return results;
  } catch (err) {
    console.error('updateSettings error:', err);
    return [null];
  }
}
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ src/lib/supabase.ts обновлён');

// 5. Обновляем vercel.json
console.log('5/5 Обновление vercel.json...');

const vercelConfig = {
  version: 2,
  buildCommand: "npm run build",
  outputDirectory: "dist",
  framework: "vite",
  installCommand: "npm install",
  headers: [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Pragma", value: "no-cache" },
        { key: "Expires", value: "0" }
      ]
    },
    {
      source: "/index.html",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Pragma", value: "no-cache" }
      ]
    },
    {
      source: "/assets/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
      ]
    }
  ],
  rewrites: [
    { source: "/api/supabase/(.*)", destination: "/api/supabase-proxy" },
    { source: "/(.*)", destination: "/index.html" }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ vercel.json обновлён');

// Создаём инструкцию
const instructions = `
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

\`\`\`bash
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
\`\`\`

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
`;

fs.writeFileSync('PROXY-DEPLOY-INSTRUCTIONS.md', instructions);
console.log('✅ PROXY-DEPLOY-INSTRUCTIONS.md создан');

console.log('\n' + '='.repeat(70));
console.log('✅ PROXY ГОТОВ!');
console.log('='.repeat(70));
console.log('\n📋 Что создано:');
console.log('1. ✅ api/supabase-proxy.js - Vercel Function прокси');
console.log('2. ✅ src/lib/supabase-proxy.ts - прокси клиент');
console.log('3. ✅ src/lib/supabase.ts - обновлён с поддержкой прокси');
console.log('4. ✅ vercel.json - настроена маршрутизация');
console.log('5. ✅ PROXY-DEPLOY-INSTRUCTIONS.md - инструкция');
console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. npm run dev (проверить локально)');
console.log('  2. npm run build');
console.log('  3. git add . && git commit -m "proxy" && git push');
console.log('  4. На Vercel: проверить Environment Variables');
console.log('  5. Redeploy на Vercel');
console.log('  6. Открыть cosmos-fm.vercel.app БЕЗ VPN');
console.log('  7. Должно работать!');
console.log('\n💡 КАК РАБОТАЕТ:');
console.log('  - Локально: прямые запросы к Supabase');
console.log('  - Production: через Vercel proxy (не заблокирован)');
console.log('  - Пользователи в России смогут заходить БЕЗ VPN!');
console.log('='.repeat(70));
