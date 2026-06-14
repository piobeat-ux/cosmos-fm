import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ИСПРАВЛЕНИЕ НАВИГАЦИИ И ВЕРСТКИ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. VITE.CONFIG.TS - УБИРАЕМ inspectAttr
// ==========================================
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
// 2. APP.TSX - ИСПРАВЛЯЕМ НАВИГАЦИЮ
// ==========================================
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

// ==================== FRONTEND ====================
function FrontLayout() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#/schedule' || hash === '#schedule') setActiveTab('schedule');
    else if (hash === '#/hosts' || hash === '#hosts') setActiveTab('hosts');
    else if (hash === '#/podcasts' || hash === '#podcasts') setActiveTab('podcasts');
    else if (hash === '#/about' || hash === '#about') setActiveTab('about');
    else setActiveTab('home');
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#' : \`#/\${tab}\`;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');
  const hash = useHashRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('cosmos_fm_admin') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (hash.includes('/shows')) setAdminPage('shows');
    else if (hash.includes('/hosts')) setAdminPage('hosts');
    else if (hash.includes('/podcasts')) setAdminPage('podcasts');
    else if (hash.includes('/categories')) setAdminPage('categories');
    else if (hash.includes('/settings')) setAdminPage('settings');
    else setAdminPage('dashboard');
  }, [hash]);

  const handleLogin = () => setIsLoggedIn(true);
  
  const handleLogout = () => {
    localStorage.removeItem('cosmos_fm_admin');
    setIsLoggedIn(false);
    window.location.hash = '';
  };

  const navigateTo = (page: string) => {
    setAdminPage(page);
    window.location.hash = \`/admin\${page === 'dashboard' ? '' : \`/\${page}\`}\`;
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
// 3. HEADER - ИСПРАВЛЯЕМ КЛИКИ
// ==========================================
writeFile('src/components/Header.tsx', `import { useState } from 'react';
import { Radio, Menu, X, Bell, Search } from 'lucide-react';

interface HeaderProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const navItems = [
  { id: 'home', label: 'Эфир' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'hosts', label: 'Ведущие' },
  { id: 'podcasts', label: 'Подкасты' },
  { id: 'about', label: 'О нас' },
];

export function Header({ onTabChange, activeTab }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-player">
      <div className="section-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onTabChange('home')}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Cosmos FM</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={\`px-4 py-2 rounded-xl text-sm font-medium transition-all \${
                  activeTab === item.id
                    ? 'bg-[#6366f1]/20 text-[#6366f1]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#13131f]'
                }\`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-[#13131f] transition-colors">
              <Search className="w-5 h-5 text-[#71717a]" />
            </button>
            <button className="p-2 rounded-xl hover:bg-[#13131f] transition-colors relative">
              <Bell className="w-5 h-5 text-[#71717a]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
            </button>
            
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[#13131f] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-[#71717a]" />
              ) : (
                <Menu className="w-5 h-5 text-[#71717a]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-player border-t border-[#27273a]/50">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMenuOpen(false);
                }}
                className={\`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all \${
                  activeTab === item.id
                    ? 'bg-[#6366f1]/20 text-[#6366f1]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#13131f]'
                }\`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
`);

console.log('\n' + '='.repeat(60));
console.log('✅ ИСПРАВЛЕНО!');
console.log('='.repeat(60));
console.log('\n ЗАПУСТИТЕ:');
console.log('  node fix-navigation-final.js');
console.log('  npm run dev');

console.log('\n🎯 ПРОВЕРЬТЕ:');
console.log('  1. Нажмите "Расписание" - должна открыться страница с передачами');
console.log('  2. Нажмите "Ведущие" - должны отобразиться все ведущие');
console.log('  3. Нажмите "Подкасты" - должны быть подкасты');
console.log('  4. Нажмите "О нас" - информация о проекте');
console.log('  5. Админка: http://localhost:5173/#/admin');