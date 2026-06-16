import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📱 === НАСТРОЙКА PWA ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. ИСПРАВЛЕНИЕ INDEX.HTML (КРИТИЧНО!)
// ==========================================
console.log(' 1/8 Исправление index.html...');

writeFile('index.html', `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0a0a0f" />
    <meta name="description" content="Cosmos FM - Первый в России корпоративный медиа-канал в индустрии гостеприимства" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Cosmos FM" />
    <link rel="manifest" href="/manifest.json" />
    <title>Cosmos FM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.error('SW registration failed:', err));
        });
      }
    </script>
  </body>
</html>`);

// ==========================================
// 2. MANIFEST.JSON
// ==========================================
console.log('📋 2/8 Создание manifest.json...');

writeFile('public/manifest.json', `{
  "name": "Cosmos FM - Голос вашего отеля",
  "short_name": "Cosmos FM",
  "description": "Первый в России корпоративный медиа-канал в индустрии гостеприимства",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0f",
  "theme_color": "#6366f1",
  "lang": "ru",
  "categories": ["music", "entertainment", "lifestyle"],
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}`);

// ==========================================
// 3. SERVICE WORKER
// ==========================================
console.log('⚙️ 3/8 Создание Service Worker...');

writeFile('public/sw.js', `// Cosmos FM Service Worker
const CACHE_NAME = 'cosmos-fm-v1';
const RUNTIME_CACHE = 'cosmos-fm-runtime-v1';

// Ресурсы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Установка SW - кэшируем основные ресурсы
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация SW - удаляем старые кэши
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия: Network First для API, Cache First для статики
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Supabase API - Network First
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Статические ресурсы - Cache First
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' ||
      event.request.destination === 'image' ||
      event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
  
  // HTML страницы - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // Остальное - Network First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Обработка сообщений от приложения
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
  }
});
`);

// ==========================================
// 4. SVG ИКОНКА
// ==========================================
console.log('🎨 4/8 Создание иконок...');

writeFile('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="80" fill="none" stroke="white" stroke-width="12"/>
  <circle cx="256" cy="256" r="50" fill="none" stroke="white" stroke-width="10"/>
  <circle cx="256" cy="256" r="20" fill="white"/>
  <path d="M 180 256 Q 180 180 256 180" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
  <path d="M 332 256 Q 332 180 256 180" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
  <path d="M 140 256 Q 140 140 256 140" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
  <path d="M 372 256 Q 372 140 256 140" fill="none" stroke="white" stroke-width="10" stroke-linecap="round"/>
</svg>`);

// ==========================================
// 5. ГЕНЕРАЦИЯ PNG ИКОНОК (через canvas в браузере)
// ==========================================
console.log('🖼️ 5/8 Создание скрипта генерации PNG иконок...');

writeFile('generate-icons.js', `// Этот скрипт генерирует PNG иконки из SVG
// Запускается в браузере или через puppeteer
// Для простоты создадим заглушки

import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Создаем простые PNG заглушки (1x1 пиксель фиолетовый)
// В реальном проекте используйте sharp или canvas
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
  0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
  0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
  0x44, 0xAE, 0x42, 0x60, 0x82
]);

sizes.forEach(size => {
  const filePath = path.join(iconsDir, \`icon-\${size}.png\`);
  // В реальном проекте здесь должна быть генерация PNG нужного размера
  // Пока создаем заглушку
  fs.writeFileSync(filePath, pngHeader);
  console.log(\`✅ Создан icon-\${size}.png (заглушка)\`);
});

console.log('\\n⚠️  ВАЖНО: Замените PNG иконки на реальные!');
console.log('Используйте https://realfavicongenerator.net/');
console.log('Или создайте через Figma/Photoshop');
`);

// ==========================================
// 6. КОМПОНЕНТ PWA INSTALL PROMPT
// ==========================================
console.log('📲 6/8 Создание компонента установки PWA...');

writeFile('src/components/PwaInstallPrompt.tsx', `import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Показываем промпт через 5 секунд после загрузки
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-28 z-40 max-w-sm">
      <div className="glass-card rounded-2xl p-4 border border-[#6366f1]/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">Установить Cosmos FM</h3>
            <p className="text-xs text-[#a1a1aa] mb-3">
              Добавьте приложение на главный экран для быстрого доступа
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#8b5cf6] transition"
              >
                Установить
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 rounded-lg bg-[#27273a] text-[#a1a1aa] text-sm hover:bg-[#3f3f5a] transition"
              >
                Позже
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 text-[#71717a] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 7. ОБНОВЛЕНИЕ APP.TSX
// ==========================================
console.log('🔄 7/8 Обновление App.tsx...');

const appPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf-8');
  
  // Добавляем импорт PwaInstallPrompt
  if (!content.includes('PwaInstallPrompt')) {
    content = content.replace(
      "import { AboutSection } from '@/sections/AboutSection';",
      "import { AboutSection } from '@/sections/AboutSection';\nimport { PwaInstallPrompt } from '@/components/PwaInstallPrompt';"
    );
    
    // Добавляем компонент в FrontLayout перед MiniPlayer
    content = content.replace(
      '<MiniPlayer />',
      '<PwaInstallPrompt />\n      <MiniPlayer />'
    );
    
    fs.writeFileSync(appPath, content);
    console.log('✅ App.tsx обновлён');
  }
}

// ==========================================
// 8. ОБНОВЛЕНИЕ VITE.CONFIG.TS
// ==========================================
console.log('⚙️ 8/8 Обновление vite.config.ts...');

writeFile('vite.config.ts', `import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
});
`);

// ==========================================
// ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ PWA НАСТРОЕНА!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО СОЗДАНО:');
console.log('  ✅ index.html - с PWA мета-тегами');
console.log('  ✅ public/manifest.json - метаданные приложения');
console.log('  ✅ public/sw.js - Service Worker');
console.log('  ✅ public/icon.svg - векторная иконка');
console.log('  ✅ generate-icons.js - генератор PNG иконок');
console.log('  ✅ PwaInstallPrompt.tsx - компонент установки');
console.log('  ✅ App.tsx - с компонентом установки');
console.log('  ✅ vite.config.ts - оптимизация сборки');

console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Запустите: node setup-pwa.js');
console.log('  2. Сгенерируйте PNG иконки:');
console.log('     node generate-icons.js');
console.log('  3. Замените PNG иконки на реальные:');
console.log('     public/icons/icon-*.png');
console.log('  4. Проверьте локально: npm run dev');
console.log('  5. Откройте Chrome DevTools → Application');
console.log('     → Manifest (должен загрузиться)');
console.log('     → Service Workers (должен быть активен)');
console.log('  6. Запушьте:');
console.log('     git add .');
console.log('     git commit -m "feat: добавлена PWA"');
console.log('     git push');

console.log('\n📱 КАК УСТАНОВИТЬ:');
console.log('  • Chrome: Меню → "Установить приложение"');
console.log('  • Safari iOS: Поделиться → "На экран Домой"');
console.log('  • Android Chrome: Меню → "Добавить на главный экран"');

console.log('\n🎯 ГОТОВО!');