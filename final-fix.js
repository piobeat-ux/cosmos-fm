import fs from 'fs';

console.log('=== FINAL FIX ===\n');

// 1. Fix DataContext - add CRUD functions
console.log('1/7 Fixing DataContext.tsx...');

const dataContextContent = `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  shows: any[];
  hosts: any[];
  podcasts: any[];
  categories: any[];
  hotels: any[];
  navigation: any[];
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

const FALLBACK_DATA = {
  shows: [
    { id: '1', title: 'Morning Show', description: 'Good morning', host_name: 'Host', time: '08:00', day_of_week: 'Mon', is_live: true, duration: '2h' }
  ],
  hosts: [
    { id: '1', name: 'Host Name', role: 'Host', bio: 'Bio' }
  ],
  podcasts: [
    { id: '1', title: 'Podcast', description: 'Description', host_name: 'Host', episodes: 10, duration: '45 min' }
  ],
  categories: [
    { id: '1', name: 'Music', description: 'Music' }
  ],
  hotels: [
    { id: '1', name: 'Hotel', city: 'Moscow' }
  ],
  navigation: [
    { id: '1', label: 'Home', url: '#/home', order_index: 1, is_active: true },
    { id: '2', label: 'Schedule', url: '#/schedule', order_index: 2, is_active: true },
    { id: '3', label: 'Hosts', url: '#/hosts', order_index: 3, is_active: true },
    { id: '4', label: 'Podcasts', url: '#/podcasts', order_index: 4, is_active: true },
    { id: '5', label: 'About', url: '#/about', order_index: 5, is_active: true }
  ],
  settings: {
    site_name: 'Cosmos FM',
    hero_title: 'Radio',
    hero_subtitle: 'Subtitle',
    stream_url: 'https://stream.example.com/live'
  }
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState(FALLBACK_DATA.shows);
  const [hosts, setHosts] = useState(FALLBACK_DATA.hosts);
  const [podcasts, setPodcasts] = useState(FALLBACK_DATA.podcasts);
  const [categories, setCategories] = useState(FALLBACK_DATA.categories);
  const [hotels, setHotels] = useState(FALLBACK_DATA.hotels);
  const [navigation, setNavigation] = useState(FALLBACK_DATA.navigation);
  const [settings, setSettings] = useState(FALLBACK_DATA.settings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const loadData = async () => {
    try {
      console.log('Loading data from Supabase...');
      
      const timeoutId = setTimeout(() => {
        console.warn('Timeout (15s), using fallback');
        setLoading(false);
      }, 15000);

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
        supabase.from('navigation_links').select('*').order('order_index', { ascending: true }),
        supabase.from('site_settings').select('*')
      ]);

      const getData = (result: any, fallback: any[]) => {
        if (result.status === 'fulfilled' && result.value.data) {
          console.log('Loaded:', result.value.data.length, 'items');
          return result.value.data;
        }
        console.warn('Using fallback');
        return fallback;
      };

      setShows(getData(showsRes, FALLBACK_DATA.shows));
      setHosts(getData(hostsRes, FALLBACK_DATA.hosts));
      setPodcasts(getData(podcastsRes, FALLBACK_DATA.podcasts));
      setCategories(getData(categoriesRes, FALLBACK_DATA.categories));
      setHotels(getData(hotelsRes, FALLBACK_DATA.hotels));
      setNavigation(getData(navigationRes, FALLBACK_DATA.navigation));
      
      const settingsData = getData(settingsRes, []);
      if (Array.isArray(settingsData) && settingsData.length > 0) {
        const settingsObj: any = {};
        settingsData.forEach((item: any) => {
          if (item && item.key) {
            settingsObj[item.key] = item.value;
          }
        });
        setSettings({ ...FALLBACK_DATA.settings, ...settingsObj });
      }

      clearTimeout(timeoutId);
      setLoading(false);
      setVersion(v => v + 1);
      console.log('Data loaded!');
      
    } catch (err: any) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD functions
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
console.log('DataContext.tsx fixed - CRUD functions added');

// 2. Fix Header
console.log('2/7 Fixing Header.tsx...');

const headerContent = `import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export function Header({ onTabChange, activeTab }) {
  const { navigation } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = navigation && navigation.length > 0
    ? navigation.map(link => ({
        id: link.url ? link.url.replace('#/', '').replace('#', '') || 'home' : 'home',
        label: link.label || 'Item',
      }))
    : [
        { id: 'home', label: 'Home' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'hosts', label: 'Hosts' },
        { id: 'podcasts', label: 'Podcasts' },
        { id: 'about', label: 'About' },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg bg-white">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#28B9D0] to-[#685096] flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A2B3C]">Cosmos FM</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 rounded-xl p-1 bg-[#B6E0EE60]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' 
                  : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-[#4A6578]">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#4A6578] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#AFCB31]" />
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-[#1A2B3C]" /> : <Menu className="text-[#1A2B3C]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
              className={\`w-full text-left px-4 py-3 rounded-lg mb-1 font-bold \${
                activeTab === item.id ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
`;

fs.writeFileSync('src/components/Header.tsx', headerContent);
console.log('Header.tsx fixed');

// 3. Fix App.tsx
console.log('3/7 Fixing App.tsx...');

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

  const handleLogin = () => { localStorage.setItem('cosmos_fm_admin', 'true'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('cosmos_fm_admin'); setIsLoggedIn(false); window.location.hash = ''; };
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
console.log('App.tsx fixed');

// 4. Fix supabase.ts
console.log('4/7 Fixing supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
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
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          apikey: supabaseKey,
          Authorization: \`Bearer \${supabaseKey}\`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

export async function signInAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signUpAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signOutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
}

export async function getShows() {
  try {
    const { data, error } = await supabase.from('shows').select('*').order('time');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getHosts() {
  try {
    const { data, error } = await supabase.from('hosts').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getPodcasts() {
  try {
    const { data, error } = await supabase.from('podcasts').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getHotels() {
  try {
    const { data, error } = await supabase.from('hotels').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getNavigation() {
  try {
    const { data, error } = await supabase.from('navigation_links').select('*').order('order_index', { ascending: true });
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function updateSetting(key, value) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function updateSettings(settings) {
  try {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    );
    const results = await Promise.all(updates);
    return results;
  } catch (err) {
    return [null];
  }
}
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('supabase.ts fixed');

// 5. Fix NavigationPage - light modals
console.log('5/7 Fixing NavigationPage...');

if (fs.existsSync('src/admin/pages/NavigationPage.tsx')) {
  let content = fs.readFileSync('src/admin/pages/NavigationPage.tsx', 'utf-8');
  
  // Replace dark styles with light
  content = content.replace(/bg-\[#13131f\]/g, 'bg-[#F5FBFD]');
  content = content.replace(/bg-\[#0a0a0f\]/g, 'bg-white');
  content = content.replace(/border-\[#27273a\]/g, 'border-[#28B9D040]');
  content = content.replace(/text-\[#71717a\]/g, 'text-[#4A6578]');
  content = content.replace(/hover:bg-\[#27273a\]/g, 'hover:bg-[#B6E0EE]');
  content = content.replace(/hover:bg-\[#3f3f5a\]/g, 'hover:bg-[#B6E0EE]');
  
  // Fix navigationLinks to navigation
  content = content.replace(
    'const { navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();',
    'const { navigation, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();'
  );
  
  content = content.replace(/navigationLinks\.length/g, '(navigation || []).length');
  content = content.replace(/navigationLinks\.sort/g, '(navigation || []).sort');
  content = content.replace(/navigationLinks\.map/g, '(navigation || []).map');
  
  fs.writeFileSync('src/admin/pages/NavigationPage.tsx', content);
  console.log('NavigationPage.tsx fixed - light styles');
}

// 6. Fix Cancel buttons in all admin pages
console.log('6/7 Fixing Cancel buttons...');

const adminPages = [
  'src/admin/pages/ShowsPage.tsx',
  'src/admin/pages/HostsPage.tsx',
  'src/admin/pages/PodcastsPage.tsx',
  'src/admin/pages/CategoriesPage.tsx',
  'src/admin/pages/HotelsPage.tsx',
  'src/admin/pages/NavigationPage.tsx',
];

adminPages.forEach(page => {
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf-8');
    
    // Fix black Cancel button
    content = content.replace(
      /bg-\[#27273a\] hover:bg-\[#3f3f5a\]/g,
      'bg-[#B6E0EE] hover:bg-[#A0D4E8] text-[#1A2B3C]'
    );
    
    fs.writeFileSync(page, content);
    console.log('Fixed:', page);
  }
});

// 7. Fix SettingsPage - add updateSettings
console.log('7/7 Fixing SettingsPage...');

if (fs.existsSync('src/admin/pages/SettingsPage.tsx')) {
  let content = fs.readFileSync('src/admin/pages/SettingsPage.tsx', 'utf-8');
  
  // Add updateSettings to useData
  if (!content.includes('updateSettings')) {
    content = content.replace(
      'const {',
      'const { updateSettings,'
    );
  }
  
  fs.writeFileSync('src/admin/pages/SettingsPage.tsx', content);
  console.log('SettingsPage.tsx fixed');
}

console.log('\n========================================');
console.log('ALL FIXES COMPLETE!');
console.log('========================================\n');
console.log('RUN: npm run dev\n');
