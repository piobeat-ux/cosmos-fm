import { useState, useEffect } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AudioProvider, useAudio } from '@/context/AudioContext';
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
  const { settings, loading } = useData();
  const { playLiveStream, currentTrack } = useAudio();

  useEffect(() => {
    const h = window.location.hash;
    if (h === '#/schedule' || h === '#schedule') setActiveTab('schedule');
    else if (h === '#/hosts' || h === '#hosts') setActiveTab('hosts');
    else if (h === '#/podcasts' || h === '#podcasts') setActiveTab('podcasts');
    else if (h === '#/about' || h === '#about') setActiveTab('about');
    else setActiveTab('home');
  }, [hash]);

  // Авто-загрузка стрима
 // Не автовоспроизводить, а просто подготовить плеер
useEffect(() => {
  if (!loading && settings.stream_url) {
    console.log('Stream URL loaded, waiting for user interaction');
    // НЕ вызывать playLiveStream автоматически
  }
}, [settings.stream_url, loading]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">📻</span>
          </div>
          <p className="text-[#71717a]">Загрузка...</p>
        </div>
      </div>
    );
  }

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

  const handleLogin = () => { localStorage.setItem('cosmos_fm_admin', 'true'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('cosmos_fm_admin'); setIsLoggedIn(false); window.location.hash = ''; };
  const navigateTo = (page) => { setAdminPage(page); window.location.hash = '#/admin' + (page === 'dashboard' ? '' : '/' + page); };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

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
