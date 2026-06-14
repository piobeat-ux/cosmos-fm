import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ТЕСТИРОВАНИЕ И ИСПРАВЛЕНИЕ БАГОВ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. ИСПРАВЛЕНИЕ VITE.CONFIG.TS
// ==========================================
console.log('🔧 1/5 Исправление vite.config.ts...');

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
    host: true,
  },
  build: {
    sourcemap: true,
  },
});
`);

// ==========================================
// 2. ИСПРАВЛЕНИЕ APP.TSX
// ==========================================
console.log('🔄 2/5 Исправление App.tsx...');

writeFile('src/App.tsx', `import { useState, useEffect } from 'react';
import { DataProvider } from '@/context/DataContext';
import { AudioProvider } from '@/context/AudioContext';
import { Header } from '@/components/Header';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { HomeSection } from '@/sections/HomeSection';
import { ScheduleSection } from '@/sections/ScheduleSection';
import { HostsSection } from '@/sections/HostsSection';
import { PodcastsSection } from '@/sections/PodcastsSection';
import { AboutSection } from '@/sections/AboutSection';
import { LoginPage } from '@/admin/pages/LoginPage';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { ShowsPage } from '@/admin/pages/ShowsPage';
import { HostsPage } from '@/admin/pages/HostsPage';
import { PodcastsPage } from '@/admin/pages/PodcastsPage';
import { CategoriesPage } from '@/admin/pages/CategoriesPage';
import { SettingsPage } from '@/admin/pages/SettingsPage';

function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash);
  
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return hash;
}

function FrontLayout() {
  const hash = useHashRouter();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const h = window.location.hash;
    if (h === '#/schedule' || h === '#schedule') setActiveTab('schedule');
    else if (h === '#/hosts' || h === '#hosts') setActiveTab('hosts');
    else if (h === '#/podcasts' || h === '#podcasts') setActiveTab('podcasts');
    else if (h === '#/about' || h === '#about') setActiveTab('about');
    else setActiveTab('home');
  }, [hash]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#/' : '#/' + tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeSection />;
      case 'schedule': return <ScheduleSection />;
      case 'hosts': return <HostsSection />;
      case 'podcasts': return <PodcastsSection />;
      case 'about': return <AboutSection />;
      default: return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      <main className="pt-20 pb-32 section-padding max-w-6xl mx-auto">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <MiniPlayer />
    </div>
  );
}

function AdminRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');
  const hash = useHashRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('cosmos_fm_admin') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    const h = window.location.hash;
    if (h.includes('/shows')) setAdminPage('shows');
    else if (h.includes('/hosts')) setAdminPage('hosts');
    else if (h.includes('/podcasts')) setAdminPage('podcasts');
    else if (h.includes('/categories')) setAdminPage('categories');
    else if (h.includes('/settings')) setAdminPage('settings');
    else setAdminPage('dashboard');
  }, [hash]);

  const handleLogin = () => {
    localStorage.setItem('cosmos_fm_admin', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('cosmos_fm_admin');
    setIsLoggedIn(false);
    window.location.hash = '';
  };

  const navigateTo = (page) => {
    setAdminPage(page);
    window.location.hash = '#/admin' + (page === 'dashboard' ? '' : '/' + page);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard': return <DashboardPage />;
      case 'shows': return <ShowsPage />;
      case 'hosts': return <HostsPage />;
      case 'podcasts': return <PodcastsPage />;
      case 'categories': return <CategoriesPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AdminLayout onLogout={handleLogout} currentPage={adminPage} onNavigate={navigateTo}>
      {renderAdminPage()}
    </AdminLayout>
  );
}

function App() {
  const hash = useHashRouter();
  const isAdmin = hash.startsWith('#/admin');

  return (
    <AudioProvider>
      <DataProvider>
        {isAdmin ? <AdminRoutes /> : <FrontLayout />}
      </DataProvider>
    </AudioProvider>
  );
}

export default App;
`);

// ==========================================
// 3. ПРОСТАЯ ИНСТРУКЦИЯ
// ==========================================
console.log('📝 3/5 Создание инструкции...');

const testingInstructions = `# Инструкция по тестированию Cosmos FM

## 1. Проверка подключения
npm install dotenv
node test-crud.js

## 2. Запуск проекта
npm run dev

## 3. Проверка
- Главная: http://localhost:5173
- Админка: http://localhost:5173/#/admin

## Чек-лист
- [ ] Навигация работает
- [ ] Загрузка файлов работает
- [ ] Плеер работает
- [ ] CRUD операции работают
`;

writeFile('TESTING.md', testingInstructions);

// ==========================================
// 4. СОЗДАНИЕ .ENV
// ==========================================
console.log('🔐 4/5 Создание .env...');

if (!fs.existsSync(path.join(__dirname, '.env'))) {
  writeFile('.env', `# Supabase Configuration
VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=ВСТАВЬТЕ_СЮДА_ВАШ_ANON_KEY
`);
  console.log('⚠️  Создан .env - вставьте SUPABASE_ANON_KEY!');
} else {
  console.log('✅ .env существует');
}

// ==========================================
// 5. ПРОВЕРКА ФАЙЛОВ
// ==========================================
console.log('📁 5/5 Проверка файлов...');

const files = [
  'src/lib/supabase.ts',
  'src/context/DataContext.tsx',
  'src/context/AudioContext.tsx',
  'src/admin/components/ImageUpload.tsx',
  'src/admin/pages/HostsPage.tsx',
];

files.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Отсутствует: ${file}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ ГОТОВО!');
console.log('='.repeat(60));
console.log('\nСледующие шаги:');
console.log('1. Откройте .env и вставьте SUPABASE_ANON_KEY');
console.log('2. npm install dotenv');
console.log('3. npm run dev');
console.log('\n🚀');