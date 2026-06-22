import fs from 'fs';

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ===\n');

// 1. Fix App.tsx - move LoadingFallback to top level
console.log('1/2 Исправление App.tsx...');

const appContent = `import { useState, useEffect, lazy, Suspense } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AudioProvider } from '@/context/AudioContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { HomeSection } from '@/sections/HomeSection';
import { ScheduleSection } from '@/sections/ScheduleSection';
import { HostsSection } from '@/sections/HostsSection';
import { PodcastsSection } from '@/sections/PodcastsSection';
import { AboutSection } from '@/sections/AboutSection';
import { FAQSection } from '@/sections/FAQSection';
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

function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return hash;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#B6E0EE' }}>
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
        <span className="text-4xl"></span>
      </div>
      <p style={{ color: '#4A6578' }}>Загрузка...</p>
    </div>
  </div>
);

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
            <span className="text-4xl"></span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#1A2B3C' }}>Cosmos FM</p>
          <p className="text-sm mt-2" style={{ color: '#4A6578' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#B6E0EE' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#EF4444' }}>
            <span className="text-4xl">️</span>
          </div>
          <p className="text-lg font-bold mb-2" style={{ color: '#1A2B3C' }}>Ошибка загрузки</p>
          <p className="text-sm mb-4" style={{ color: '#4A6578' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}
          >
            Попробовать снова
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

  const navigateTo = (page) => {
    setAdminPage(page);
    window.location.hash = '#/admin' + (page === 'dashboard' ? '' : '/' + page);
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

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
`;

fs.writeFileSync('src/App.tsx', appContent);
console.log('✅ App.tsx исправлен - LoadingFallback перемещен на верхний уровень');

// 2. Fix DataContext - add all CRUD functions
console.log('2/2 Исправление DataContext с CRUD функциями...');

const dataContextContent = `import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  shows: any[];
  hosts: any[];
  podcasts: any[];
  categories: any[];
  hotels: any[];
  navigation: any[];
  navigationLinks: any[];
  settings: any;
  loading: boolean;
  error: string | null;
  version: number;
  addShow: (data: any) => Promise<void>;
  editShow: (id: string, data: any) => Promise<void>;
  removeShow: (id: string) => Promise<void>;
  addHost: (data: any) => Promise<void>;
  editHost: (id: string, data: any) => Promise<void>;
  removeHost: (id: string) => Promise<void>;
  addPodcast: (data: any) => Promise<void>;
  editPodcast: (id: string, data: any) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  addCategory: (data: any) => Promise<void>;
  editCategory: (id: string, data: any) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addHotel: (data: any) => Promise<void>;
  editHotel: (id: string, data: any) => Promise<void>;
  removeHotel: (id: string) => Promise<void>;
  addNavigationLink: (data: any) => Promise<void>;
  editNavigationLink: (id: string, data: any) => Promise<void>;
  removeNavigationLink: (id: string) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const navigationLinks = navigation;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        showsRes,
        hostsRes,
        podcastsRes,
        categoriesRes,
        hotelsRes,
        navigationRes,
        settingsRes
      ] = await Promise.allSettled([
        supabase.from('shows').select('*').order('time'),
        supabase.from('hosts').select('*'),
        supabase.from('podcasts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('hotels').select('*'),
        supabase.from('navigation_links').select('*'),
        supabase.from('site_settings').select('*')
      ]);

      const getData = (result: any) => {
        if (result.status === 'fulfilled' && result.value.data) {
          return result.value.data;
        }
        return [];
      };

      setShows(getData(showsRes));
      setHosts(getData(hostsRes));
      setPodcasts(getData(podcastsRes));
      setCategories(getData(categoriesRes));
      setHotels(getData(hotelsRes));
      setNavigation(getData(navigationRes));
      
      const settingsData = getData(settingsRes);
      const settingsObj: any = {};
      settingsData.forEach((item: any) => {
        if (item && item.key) {
          settingsObj[item.key] = item.value;
        }
      });
      setSettings(settingsObj);

      setLoading(false);
      setVersion(v => v + 1);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setLoading(false);
      setError(err.message || 'Ошибка загрузки');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Shows CRUD
  const addShow = async (data: any) => {
    const { error } = await supabase.from('shows').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editShow = async (id: string, data: any) => {
    const { error } = await supabase.from('shows').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeShow = async (id: string) => {
    const { error } = await supabase.from('shows').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Hosts CRUD
  const addHost = async (data: any) => {
    const { error } = await supabase.from('hosts').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editHost = async (id: string, data: any) => {
    const { error } = await supabase.from('hosts').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeHost = async (id: string) => {
    const { error } = await supabase.from('hosts').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Podcasts CRUD
  const addPodcast = async (data: any) => {
    const { error } = await supabase.from('podcasts').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editPodcast = async (id: string, data: any) => {
    const { error } = await supabase.from('podcasts').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removePodcast = async (id: string) => {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Categories CRUD
  const addCategory = async (data: any) => {
    const { error } = await supabase.from('categories').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editCategory = async (id: string, data: any) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Hotels CRUD
  const addHotel = async (data: any) => {
    const { error } = await supabase.from('hotels').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editHotel = async (id: string, data: any) => {
    const { error } = await supabase.from('hotels').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeHotel = async (id: string) => {
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Navigation CRUD
  const addNavigationLink = async (data: any) => {
    const { error } = await supabase.from('navigation_links').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editNavigationLink = async (id: string, data: any) => {
    const { error } = await supabase.from('navigation_links').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeNavigationLink = async (id: string) => {
    const { error } = await supabase.from('navigation_links').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Settings
  const updateSettings = async (newSettings: any) => {
    const updates = Object.entries(newSettings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    );
    await Promise.all(updates);
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      shows,
      hosts,
      podcasts,
      categories,
      hotels,
      navigation,
      navigationLinks,
      settings,
      loading,
      error,
      version,
      addShow,
      editShow,
      removeShow,
      addHost,
      editHost,
      removeHost,
      addPodcast,
      editPodcast,
      removePodcast,
      addCategory,
      editCategory,
      removeCategory,
      addHotel,
      editHotel,
      removeHotel,
      addNavigationLink,
      editNavigationLink,
      removeNavigationLink,
      updateSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
`;

fs.writeFileSync('src/context/DataContext.tsx', dataContextContent);
console.log('✅ DataContext.tsx добавлены все CRUD функции');

console.log('\n' + '='.repeat(70));
console.log('✅ ВСЁ ИСПРАВЛЕНО!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ LoadingFallback перемещен на верхний уровень App.tsx');
console.log('2. ✅ Добавлены все CRUD функции в DataContext');
console.log('3. ✅ navigationLinks алиас для navigation');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\nТеперь должно работать:');
console.log('  - Все страницы (Ведущие, Подкасты, Расписание)');
console.log('  - Админка (добавление/редактирование/удаление)');
console.log('='.repeat(70));
