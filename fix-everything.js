import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ПОЛНОЕ ИСПРАВЛЕНИЕ ПРОЕКТА ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. ИСПРАВЛЕНИЕ VITE.CONFIG.TS
// ==========================================
console.log('🔧 Исправление vite.config.ts...');

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
// 2. ИСПРАВЛЕНИЕ HEADER
// ==========================================
console.log('🔝 Исправление Header...');

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
            
            {/* Mobile Menu Button */}
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

// ==========================================
// 3. ИСПРАВЛЕНИЕ APP.TSX
// ==========================================
console.log('🔄 Исправление App.tsx...');

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

// Simple hash-based router
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
// 4. ИСПРАВЛЕНИЕ HOMESECTION
// ==========================================
console.log('🏠 Исправление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const liveShow = shows.find(show => show.is_live);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayLive = () => {
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id,
        title: liveShow.title,
        artist: liveShow.host_name,
        audio_url: liveShow.audio_url,
        cover_url: liveShow.cover_url,
        isLive: true,
        type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, liveShow?.title || 'Прямой эфир');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 floating"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 floating"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24">
        <div className="text-center">
          {/* Badge */}
          <div className={\`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          {/* Logo */}
          <div className={\`flex justify-center mb-8 transition-all duration-700 delay-100 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 blur-xl" />
            </div>
          </div>

          {/* Title */}
          <h1 className={\`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          {/* Subtitle */}
          <p className={\`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 transition-all duration-700 delay-300 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          {/* Description */}
          <p className={\`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 transition-all duration-700 delay-400 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {/* LIVE Show */}
          {liveShow && (
            <div className={\`max-w-2xl mx-auto mb-8 transition-all duration-700 delay-500 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}>
              <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50 now-playing-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {liveShow.cover_url ? (
                      <img src={liveShow.cover_url} alt={liveShow.title} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold text-white">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <span className="text-xs text-[#22c55e] font-semibold uppercase tracking-wider">Сейчас в эфире</span>
                    <h3 className="text-xl font-bold mb-1">{liveShow.title}</h3>
                    <p className="text-sm text-[#71717a]">{liveShow.host_name || 'Cosmos FM'}</p>
                  </div>
                </div>

                <button onClick={handlePlayLive} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  {isPlaying && currentTrack?.id === liveShow.id ? 'Слушаем' : 'Слушать эфир'}
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className={\`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-500 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            <button onClick={() => scrollToSection('#schedule')} className="btn-primary text-lg">
              Расписание
            </button>
            <button onClick={() => scrollToSection('#about')} className="btn-secondary text-lg">
              О нас
            </button>
          </div>

          {/* Stats */}
          <div className={\`grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-700 delay-600 \${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }\`}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div>
              <div className="text-sm text-[#71717a] mt-1">сотрудников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div>
              <div className="text-sm text-[#71717a] mt-1">гостей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-[#71717a] mt-1">вещание</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button onClick={() => scrollToSection('#schedule')} className="flex flex-col items-center gap-2 text-[#71717a] hover:text-white transition-colors">
          <span className="text-sm">Листайте вниз</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
`);

// ==========================================
// ИТОГОВЫЙ ОТЧЁТ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ПРОЕКТ ИСПРАВЛЕН!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ vite.config.ts - убран inspectAttr');
console.log('  ✅ Header - восстановлена навигация');
console.log('  ✅ App.tsx - исправлена маршрутизация');
console.log('  ✅ HomeSection - восстановлена верстка');

console.log('\n🔧 ЗАПУСТИТЕ:');
console.log('  npm run dev');

console.log('\n🎯 ПРОВЕРЬТЕ:');
console.log('  1. Главная страница - http://localhost:5173');
console.log('  2. Навигация в шапке (5 вкладок)');
console.log('  3. Переключение между страницами');
console.log('  4. Админка - http://localhost:5173/#/admin');

console.log('\n🚀 ГОТОВО!');