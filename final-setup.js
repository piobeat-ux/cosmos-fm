import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(' === ФИНАЛЬНАЯ НАСТРОЙКА ПРОЕКТА ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
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
  },
});
`);

// ==========================================
// 2. ОБНОВЛЕНИЕ APP.TSX
// ==========================================
console.log('🔄 2/5 Обновление App.tsx...');

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
import { HotelsPage } from '@/admin/pages/HotelsPage';
import { NavigationPage } from '@/admin/pages/NavigationPage';

function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash);
  
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return hash;
}

// ==================== FRONTEND ====================
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#/' : \`#/\${tab}\`;
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

// ==================== ADMIN ====================
function AdminRoutes() {
  const hash = useHashRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');

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
    else if (h.includes('/hotels')) setAdminPage('hotels');
    else if (h.includes('/navigation')) setAdminPage('navigation');
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

  const navigateTo = (page: string) => {
    setAdminPage(page);
    window.location.hash = \`#/admin\${page === 'dashboard' ? '' : \`/\${page}\`}\`;
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
      case 'hotels': return <HotelsPage />;
      case 'navigation': return <NavigationPage />;
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

// ==================== APP ====================
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
// 3. ПРОВЕРКА НАЛИЧИЯ ФАЙЛОВ
// ==========================================
console.log('📁 3/5 Проверка файлов...');

const requiredFiles = [
  'src/admin/pages/HotelsPage.tsx',
  'src/admin/pages/NavigationPage.tsx',
  'src/admin/components/ImageUpload.tsx',
  'src/lib/supabase.ts',
  'src/context/DataContext.tsx',
  'src/context/AudioContext.tsx',
];

const missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('⚠️  Отсутствуют файлы:');
  missingFiles.forEach(f => console.log(`   - ${f}`));
  console.log('\n️  Нужно создать недостающие файлы из предыдущих скриптов!');
} else {
  console.log('✅ Все файлы на месте');
}

// ==========================================
// 4. СОЗДАНИЕ .ENV (если нет)
// ==========================================
console.log('🔐 4/5 Проверка .env...');

if (!fs.existsSync(path.join(__dirname, '.env'))) {
  writeFile('.env', `# Supabase Configuration
VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=ВСТАВЬТЕ_СЮДА_ВАШ_ANON_KEY

# Получите ключ из: Supabase Dashboard -> Settings -> API -> anon public
`);
  console.log('⚠️  Создан .env файл - НЕ ЗАБУДЬТЕ вставить SUPABASE_ANON_KEY!');
} else {
  console.log('✅ .env файл существует');
}

// ==========================================
// 5. ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ФИНАЛЬНАЯ НАСТРОЙКА ЗАВЕРШЕНА!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  ✅ Исправлен vite.config.ts (убран inspectAttr)');
console.log('  ✅ Обновлен App.tsx (добавлены Hotels и Navigation)');
console.log('  ✅ Проверено наличие всех файлов');
console.log('  ✅ Создан .env (если не было)');

console.log('\n СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Откройте .env и вставьте SUPABASE_ANON_KEY');
console.log('  2. Запустите: npm run dev');
console.log('  3. Откройте: http://localhost:5173');
console.log('  4. Админка: http://localhost:5173/#/admin');

console.log('\n🎯 ПРОВЕРЬТЕ:');
console.log('  • Навигация работает (5 вкладок)');
console.log('  • Ведущие на главной');
console.log('  • Лайки на подкастах');
console.log('  • Админка: 8 разделов');
console.log('  • Загрузка файлов в Supabase');

console.log('\n🚀 ГОТОВО!');