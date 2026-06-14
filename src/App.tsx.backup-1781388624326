import { useState, useEffect } from 'react';
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
      <Header onTabChange={setActiveTab} activeTab={activeTab} />
      <main className="pt-20 pb-32 section-padding max-w-6xl mx-auto">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <MiniPlayer />
    </div>
  );
}

// ==================== ADMIN ====================
function AdminRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');

  useEffect(() => {
    const loggedIn = localStorage.getItem('cosmos_fm_admin') === 'true';
    setIsLoggedIn(loggedIn);
    // Parse page from hash
    const hash = window.location.hash;
    if (hash.includes('/shows')) setAdminPage('shows');
    else if (hash.includes('/hosts')) setAdminPage('hosts');
    else if (hash.includes('/podcasts')) setAdminPage('podcasts');
    else if (hash.includes('/categories')) setAdminPage('categories');
    else if (hash.includes('/settings')) setAdminPage('settings');
    else setAdminPage('dashboard');
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('cosmos_fm_admin');
    setIsLoggedIn(false);
    window.location.hash = '';
  };

  const navigateTo = (page: string) => {
    setAdminPage(page);
    window.location.hash = `/admin${page === 'dashboard' ? '' : `/${page}`}`;
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
