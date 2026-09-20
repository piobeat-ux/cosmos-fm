import { useState, useEffect, lazy, Suspense } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AudioProvider } from '@/context/AudioContext';
import { StationBridge } from '@/context/StationBridge';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { HomeSection } from '@/sections/HomeSection';
import { AboutSection } from '@/sections/AboutSection';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { LoginPage } from '@/admin/pages/LoginPage';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { ShowsPage } from '@/admin/pages/ShowsPage';
import { HostsPage } from '@/admin/pages/HostsPage';
import { PodcastsPage } from '@/admin/pages/PodcastsPage';
import { CategoriesPage } from '@/admin/pages/CategoriesPage';
import { HotelsPage } from '@/admin/pages/HotelsPage';
import { NavigationPage } from '@/admin/pages/NavigationPage';
import { SettingsPage } from '@/admin/pages/SettingsPage';

const LazyPodcastsSection = lazy(() => import('@/sections/PodcastsSection').then(m => ({ default: m.PodcastsSection })));
const LazyHostsSection = lazy(() => import('@/sections/HostsSection').then(m => ({ default: m.HostsSection })));
const LazyScheduleSection = lazy(() => import('@/sections/ScheduleSection').then(m => ({ default: m.ScheduleSection })));
const LazyFAQSection = lazy(() => import('@/sections/FAQSection').then(m => ({ default: m.FAQSection })));
const CalendarPage = lazy(() => import('@/admin/pages/CalendarPage').then(m => ({ default: m.CalendarPage })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#B6E0EE' }}>
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
        <span className="text-4xl">📻</span>
      </div>
      <p style={{ color: '#4A6578' }}>Loading...</p>
    </div>
  </div>
);

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
  const { loading, error } = useData();

  useEffect(() => {
    const h = window.location.hash;
    if (h === '#/schedule' || h === '#schedule') setActiveTab('schedule');
    else if (h === '#/hosts' || h === '#hosts') setActiveTab('hosts');
    else if (h === '#/podcasts' || h === '#podcasts') setActiveTab('podcasts');
    else if (h === '#/about' || h === '#about') setActiveTab('about');
    else if (h === '#/faq' || h === '#faq') setActiveTab('faq');
    else setActiveTab('home');
  }, [hash]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#/' : '#/' + tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeSection onTabChange={handleTabChange} />;
      case 'schedule': return <Suspense fallback={<LoadingFallback />}><LazyScheduleSection /></Suspense>;
      case 'hosts': return <Suspense fallback={<LoadingFallback />}><LazyHostsSection /></Suspense>;
      case 'podcasts': return <Suspense fallback={<LoadingFallback />}><LazyPodcastsSection /></Suspense>;
      case 'about': return <AboutSection />;
      case 'faq': return <Suspense fallback={<LoadingFallback />}><LazyFAQSection /></Suspense>;
      default: return <HomeSection onTabChange={handleTabChange} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#B6E0EE' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
            <span className="text-4xl">📻</span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#1A2B3C' }}>Cosmos FM</p>
          <p className="text-sm mt-2" style={{ color: '#4A6578' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#B6E0EE' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#EF4444' }}>
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-lg font-bold mb-2" style={{ color: '#1A2B3C' }}>Error</p>
          <p className="text-sm mb-4" style={{ color: '#4A6578' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#B6E0EE' }}>
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      <main>
        {renderContent()}
      </main>
      <Footer />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <PwaInstallPrompt />
      <MiniPlayer />
    </div>
  );
}

function AdminRoutes() {
  const { isAdmin, loading, signOut } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [adminPage, setAdminPage] = useState('dashboard');
  const hash = useHashRouter();

  useEffect(() => {
    const h = window.location.hash;
    if (h.includes('/calendar')) setAdminPage('calendar');
    else if (h.includes('/shows')) setAdminPage('shows');
    else if (h.includes('/hosts')) setAdminPage('hosts');
    else if (h.includes('/podcasts')) setAdminPage('podcasts');
    else if (h.includes('/categories')) setAdminPage('categories');
    else if (h.includes('/hotels')) setAdminPage('hotels');
    else if (h.includes('/navigation')) setAdminPage('navigation');
    else if (h.includes('/settings')) setAdminPage('settings');
    else setAdminPage('dashboard');
  }, [hash]);

  const handleLogout = async () => {
    try { await signOut(); window.location.hash = ''; }
    catch (cause) { setLogoutError(cause instanceof Error ? cause.message : 'Не удалось выйти.'); }
  };
  const navigateTo = (page) => {
    setAdminPage(page);
    window.location.hash = '#/admin' + (page === 'dashboard' ? '' : '/' + page);
  };

  if (loading) return <LoadingFallback />;
  if (!isAdmin) return <LoginPage />;

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard': return <DashboardPage />;
      case 'calendar': return <Suspense fallback={<LoadingFallback />}><CalendarPage /></Suspense>;
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
      {logoutError && <p role="alert" className="mb-4 text-red-700">{logoutError}</p>}
      {renderAdminPage()}
    </AdminLayout>
  );
}

function App() {
  const hash = useHashRouter();
  const isAdmin = hash.startsWith('#/admin');

  return (
    <AuthProvider><AudioProvider>
      <DataProvider>
        <StationBridge />
        {isAdmin ? <AdminRoutes /> : <FrontLayout />}
      </DataProvider>
    </AudioProvider></AuthProvider>
  );
}

export default App;
