import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ COSMOS FM ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. APP.TSX - ИСПРАВЛЕННАЯ НАВИГАЦИЯ
// ==========================================
console.log('\n🔄 1/12 Исправление App.tsx...');

writeFile('src/App.tsx', `
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

  // Синхронизация с URL
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
// 2. LIB/SUPABASE.TS - ДОБАВЛЯЕМ HOTELS + NAVIGATION
// ==========================================
console.log('🔧 2/12 Обновление lib/supabase.ts...');

const supabasePath = path.join(__dirname, 'src/lib/supabase.ts');
let supabaseContent = fs.existsSync(supabasePath) ? fs.readFileSync(supabasePath, 'utf-8') : '';

// Проверяем, есть ли уже функции для hotels
if (!supabaseContent.includes('getHotels')) {
  const hotelsAndNavCode = `

// ========== HOTELS ==========
export interface Hotel {
  id: string;
  name: string;
  city: string;
  address?: string;
  logo_url?: string;
  created_at?: string;
}

export async function getHotels(): Promise<Hotel[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('hotels').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createHotel(hotel: Omit<Hotel, 'id' | 'created_at'>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').insert([hotel]);
  if (error) throw error;
}

export async function updateHotel(id: string, hotel: Partial<Hotel>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

// ========== NAVIGATION LINKS ==========
export interface NavigationLink {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'anchor';
  icon?: string;
  order_index: number;
  is_active: boolean;
  target: '_self' | '_blank';
  created_at?: string;
}

export async function getNavigationLinks(): Promise<NavigationLink[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createNavigationLink(link: Omit<NavigationLink, 'id' | 'created_at'>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
}

export async function updateNavigationLink(id: string, link: Partial<NavigationLink>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}
`;
  fs.writeFileSync(supabasePath, supabaseContent + hotelsAndNavCode);
  console.log('  ✅ Добавлены функции для hotels и navigation_links');
} else {
  console.log('  ⏭️  Функции уже существуют');
}

// ==========================================
// 3. DATACONTEXT - ДОБАВЛЯЕМ HOTELS + NAVIGATION
// ==========================================
console.log('💾 3/12 Обновление DataContext...');

writeFile('src/context/DataContext.tsx', `
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Show, Host, Podcast, Category, SiteSettings } from '@/types/database';
import { DEFAULT_SETTINGS } from '@/types/database';
import type { Hotel, NavigationLink } from '@/lib/supabase';
import {
  getShows, getHosts, getPodcasts, getCategories, getSettings,
  getHotels, getNavigationLinks,
  createShow, updateShow, deleteShow,
  createHost, updateHost, deleteHost,
  createPodcast, updatePodcast, deletePodcast,
  createCategory, updateCategory, deleteCategory,
  createHotel, updateHotel, deleteHotel,
  createNavigationLink, updateNavigationLink, deleteNavigationLink,
  subscribeToShows, subscribeToHosts, subscribeToPodcasts,
  updateSetting, supabase,
} from '@/lib/supabase';

interface DataContextType {
  shows: Show[];
  hosts: Host[];
  podcasts: Podcast[];
  categories: Category[];
  hotels: Hotel[];
  navigationLinks: NavigationLink[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  // Shows
  addShow: (show: Omit<Show, 'id' | 'created_at'>) => Promise<void>;
  editShow: (id: string, show: Partial<Show>) => Promise<void>;
  removeShow: (id: string) => Promise<void>;
  // Hosts
  addHost: (host: Omit<Host, 'id' | 'created_at'>) => Promise<void>;
  editHost: (id: string, host: Partial<Host>) => Promise<void>;
  removeHost: (id: string) => Promise<void>;
  // Podcasts
  addPodcast: (podcast: Omit<Podcast, 'id' | 'created_at'>) => Promise<void>;
  editPodcast: (id: string, podcast: Partial<Podcast>) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  editCategory: (id: string, category: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  // Hotels
  addHotel: (hotel: Omit<Hotel, 'id' | 'created_at'>) => Promise<void>;
  editHotel: (id: string, hotel: Partial<Hotel>) => Promise<void>;
  removeHotel: (id: string) => Promise<void>;
  // Navigation
  addNavigationLink: (link: Omit<NavigationLink, 'id' | 'created_at'>) => Promise<void>;
  editNavigationLink: (id: string, link: Partial<NavigationLink>) => Promise<void>;
  removeNavigationLink: (id: string) => Promise<void>;
  // Settings
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_NAV = [
  { id: '1', label: 'Эфир', url: '#/', type: 'anchor' as const, order_index: 1, is_active: true, target: '_self' as const },
  { id: '2', label: 'Расписание', url: '#/schedule', type: 'anchor' as const, order_index: 2, is_active: true, target: '_self' as const },
  { id: '3', label: 'Ведущие', url: '#/hosts', type: 'anchor' as const, order_index: 3, is_active: true, target: '_self' as const },
  { id: '4', label: 'Подкасты', url: '#/podcasts', type: 'anchor' as const, order_index: 4, is_active: true, target: '_self' as const },
  { id: '5', label: 'О нас', url: '#/about', type: 'anchor' as const, order_index: 5, is_active: true, target: '_self' as const },
];

const DEFAULT_HOTELS: Hotel[] = [
  { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
  { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
  { id: '3', name: 'Cosmos Sochi', city: 'Сочи' },
];

const DEMO_DATA = {
  shows: [
    { id: '1', title: 'Утренний кофе', description: 'Начните день с бодрости!', host_name: 'Анна Петрова', time: '07:00', duration: '3ч', category: 'Утреннее шоу', day_of_week: 'Пн', is_live: true },
    { id: '2', title: 'Новости отелей', description: 'Главные новости индустрии', host_name: 'Дмитрий Иванов', time: '10:00', duration: '1ч', category: 'Новости', day_of_week: 'Пн', is_live: false },
  ],
  hosts: [
    { id: '1', name: 'Анна Петрова', role: 'Ведущая утреннего шоу', hotel: 'Cosmos Moscow', bio: '5 лет в индустрии гостеприимства', initials: 'АП', color: 'from-[#f59e0b] to-[#f97316]' },
    { id: '2', name: 'Михаил Соколов', role: 'Музыкальный редактор', hotel: 'Cosmos St. Petersburg', bio: 'DJ с 10-летним стажем', initials: 'МС', color: 'from-[#8b5cf6] to-[#6366f1]' },
  ],
  podcasts: [
    { id: '1', title: 'Истории отелей', description: 'Удивительные истории из жизни отелей', host_name: 'Наталья Лебедева', episodes: 24, duration: '45 мин', category: 'Истории', likes: 128, color: 'from-[#f59e0b] to-[#f97316]' },
  ],
  categories: [
    { id: '1', name: 'Музыка', count: 156, color: 'from-[#8b5cf6] to-[#6366f1]' },
    { id: '2', name: 'Новости', count: 48, color: 'from-[#3b82f6] to-[#06b6d4]' },
  ],
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocal, setUseLocal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) throw new Error('Supabase not initialized');

      const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = await Promise.all([
        getShows().catch(() => []),
        getHosts().catch(() => []),
        getPodcasts().catch(() => []),
        getCategories().catch(() => []),
        getSettings().catch(() => ({})),
        getHotels().catch(() => DEFAULT_HOTELS),
        getNavigationLinks().catch(() => DEFAULT_NAV),
      ]);
      
      setShows(showsData || []);
      setHosts(hostsData || []);
      setPodcasts(podcastsData || []);
      setCategories(categoriesData || []);
      setSettings(settingsData);
      setHotels(hotelsData && hotelsData.length > 0 ? hotelsData : DEFAULT_HOTELS);
      setNavigationLinks(navData && navData.length > 0 ? navData : DEFAULT_NAV);
      setUseLocal(false);
      setError(null);
    } catch (err: any) {
      console.warn('Using demo data:', err.message);
      setUseLocal(true);
      setShows(DEMO_DATA.shows);
      setHosts(DEMO_DATA.hosts);
      setPodcasts(DEMO_DATA.podcasts);
      setCategories(DEMO_DATA.categories);
      setHotels(DEFAULT_HOTELS);
      setNavigationLinks(DEFAULT_NAV);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (useLocal || !supabase) return;
    const subs = [
      subscribeToShows(setShows),
      subscribeToHosts(setHosts),
      subscribeToPodcasts(setPodcasts),
    ];
    return () => { subs.forEach(sub => sub.unsubscribe()); };
  }, [useLocal]);

  const refresh = useCallback(() => { loadData(); }, [loadData]);

  const updateSettings = useCallback(async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (!useLocal && supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  }, [settings, useLocal]);

  // SHOWS
  const addShow = async (show: Omit<Show, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setShows([...shows, { ...show, id: Date.now().toString() }]);
    } else { await createShow(show); refresh(); }
  };
  const editShow = async (id: string, show: Partial<Show>) => {
    if (useLocal || !supabase) {
      setShows(shows.map(s => s.id === id ? { ...s, ...show } : s));
    } else { await updateShow(id, show); refresh(); }
  };
  const removeShow = async (id: string) => {
    if (useLocal || !supabase) setShows(shows.filter(s => s.id !== id));
    else { await deleteShow(id); refresh(); }
  };

  // HOSTS
  const addHost = async (host: Omit<Host, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setHosts([...hosts, { ...host, id: Date.now().toString() }]);
    } else { await createHost(host); refresh(); }
  };
  const editHost = async (id: string, host: Partial<Host>) => {
    if (useLocal || !supabase) {
      setHosts(hosts.map(h => h.id === id ? { ...h, ...host } : h));
    } else { await updateHost(id, host); refresh(); }
  };
  const removeHost = async (id: string) => {
    if (useLocal || !supabase) setHosts(hosts.filter(h => h.id !== id));
    else { await deleteHost(id); refresh(); }
  };

  // PODCASTS
  const addPodcast = async (podcast: Omit<Podcast, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setPodcasts([...podcasts, { ...podcast, id: Date.now().toString() }]);
    } else { await createPodcast(podcast); refresh(); }
  };
  const editPodcast = async (id: string, podcast: Partial<Podcast>) => {
    if (useLocal || !supabase) {
      setPodcasts(podcasts.map(p => p.id === id ? { ...p, ...podcast } : p));
    } else { await updatePodcast(id, podcast); refresh(); }
  };
  const removePodcast = async (id: string) => {
    if (useLocal || !supabase) setPodcasts(podcasts.filter(p => p.id !== id));
    else { await deletePodcast(id); refresh(); }
  };

  // CATEGORIES
  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setCategories([...categories, { ...category, id: Date.now().toString() }]);
    } else { await createCategory(category); refresh(); }
  };
  const editCategory = async (id: string, category: Partial<Category>) => {
    if (useLocal || !supabase) {
      setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
    } else { await updateCategory(id, category); refresh(); }
  };
  const removeCategory = async (id: string) => {
    if (useLocal || !supabase) setCategories(categories.filter(c => c.id !== id));
    else { await deleteCategory(id); refresh(); }
  };

  // HOTELS
  const addHotel = async (hotel: Omit<Hotel, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setHotels([...hotels, { ...hotel, id: Date.now().toString() }]);
    } else { await createHotel(hotel); refresh(); }
  };
  const editHotel = async (id: string, hotel: Partial<Hotel>) => {
    if (useLocal || !supabase) {
      setHotels(hotels.map(h => h.id === id ? { ...h, ...hotel } : h));
    } else { await updateHotel(id, hotel); refresh(); }
  };
  const removeHotel = async (id: string) => {
    if (useLocal || !supabase) setHotels(hotels.filter(h => h.id !== id));
    else { await deleteHotel(id); refresh(); }
  };

  // NAVIGATION
  const addNavigationLink = async (link: Omit<NavigationLink, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setNavigationLinks([...navigationLinks, { ...link, id: Date.now().toString() }]);
    } else { await createNavigationLink(link); refresh(); }
  };
  const editNavigationLink = async (id: string, link: Partial<NavigationLink>) => {
    if (useLocal || !supabase) {
      setNavigationLinks(navigationLinks.map(l => l.id === id ? { ...l, ...link } : l));
    } else { await updateNavigationLink(id, link); refresh(); }
  };
  const removeNavigationLink = async (id: string) => {
    if (useLocal || !supabase) setNavigationLinks(navigationLinks.filter(l => l.id !== id));
    else { await deleteNavigationLink(id); refresh(); }
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, loading, error, refresh,
      addShow, editShow, removeShow,
      addHost, editHost, removeHost,
      addPodcast, editPodcast, removePodcast,
      addCategory, editCategory, removeCategory,
      addHotel, editHotel, removeHotel,
      addNavigationLink, editNavigationLink, removeNavigationLink,
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
`);

// ==========================================
// 4. HEADER - ДИНАМИЧЕСКАЯ НАВИГАЦИЯ
// ==========================================
console.log('🔝 4/12 Обновление Header...');

writeFile('src/components/Header.tsx', `
import { useState } from 'react';
import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface HeaderProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function Header({ onTabChange, activeTab }: HeaderProps) {
  const { navigationLinks } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fallback если ссылки еще не загрузились
  const navItems = navigationLinks.length > 0 
    ? navigationLinks.map(link => ({
        id: link.url.replace('#/', '').replace('#', '') || 'home',
        label: link.label,
        url: link.url,
      }))
    : [
        { id: 'home', label: 'Эфир', url: '#/' },
        { id: 'schedule', label: 'Расписание', url: '#/schedule' },
        { id: 'hosts', label: 'Ведущие', url: '#/hosts' },
        { id: 'podcasts', label: 'Подкасты', url: '#/podcasts' },
        { id: 'about', label: 'О нас', url: '#/about' },
      ];

  const handleNavClick = (item: any) => {
    onTabChange(item.id);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-player">
      <div className="section-padding">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onTabChange('home')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Cosmos FM</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
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
              {isMenuOpen ? <X className="w-5 h-5 text-[#71717a]" /> : <Menu className="w-5 h-5 text-[#71717a]" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass-player border-t border-[#27273a]/50">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
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
// 5. BOTTOMNAV - ДИНАМИЧЕСКАЯ НАВИГАЦИЯ
// ==========================================
console.log('📱 5/12 Обновление BottomNav...');

writeFile('src/components/BottomNav.tsx', `
import { Radio, Calendar, Users, Headphones, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ICONS: Record<string, any> = {
  home: Radio,
  schedule: Calendar,
  hosts: Users,
  podcasts: Headphones,
  about: Info,
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { navigationLinks } = useData();

  const navItems = navigationLinks.length > 0
    ? navigationLinks.slice(0, 5).map(link => {
        const id = link.url.replace('#/', '').replace('#', '') || 'home';
        return { id, label: link.label, icon: ICONS[id] || Radio };
      })
    : [
        { id: 'home', label: 'Эфир', icon: Radio },
        { id: 'schedule', label: 'Расписание', icon: Calendar },
        { id: 'hosts', label: 'Ведущие', icon: Users },
        { id: 'podcasts', label: 'Подкасты', icon: Headphones },
        { id: 'about', label: 'О нас', icon: Info },
      ];

  return (
    <nav className="fixed bottom-20 left-0 right-0 z-40 glass-player md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={\`nav-item \${activeTab === item.id ? 'active' : ''}\`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
`);

// ==========================================
// 6. HOMESECTION - С ВЕДУЩИМИ
// ==========================================
console.log('🏠 6/12 Обновление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `
import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, hosts, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const liveShow = shows.find(show => show.is_live);

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
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
        </div>

        <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24 text-center">
          <div className={\`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          <div className={\`flex justify-center mb-8 transition-all duration-700 delay-100 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className={\`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          <p className={\`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          <p className={\`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {liveShow && (
            <div className="max-w-2xl mx-auto mb-8">
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
                    <span className="text-xs text-[#22c55e] font-semibold uppercase">Сейчас в эфире</span>
                    <h3 className="text-xl font-bold">{liveShow.title}</h3>
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

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-12">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-[#71717a]">
            <span className="text-sm">Листайте вниз</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* HOSTS SECTION */}
      <section className="py-20 max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Наши ведущие</span>
          </h2>
          <p className="text-lg text-[#71717a]">Профессионалы своего дела</p>
        </div>

        {hosts.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет ведущих</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hosts.map(host => (
              <div key={host.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {host.photo_url ? (
                    <img src={host.photo_url} alt={host.name} className="w-24 h-24 rounded-full object-cover border-2 border-[#27273a] mb-4" />
                  ) : (
                    <div className={\`w-24 h-24 rounded-full bg-gradient-to-br \${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-2xl font-bold mb-4\`}>
                      {host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1">{host.name}</h3>
                  <p className="text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                  {host.hotel && <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>}
                  {host.bio && <p className="text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
`);

// ==========================================
// 7. PODCASTSSECTION - С ЛАЙКАМИ
// ==========================================
console.log('🎙️ 7/12 Обновление PodcastsSection...');

writeFile('src/sections/PodcastsSection.tsx', `
import { useState } from 'react';
import { Play, Pause, Heart, Clock, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function PodcastsSection() {
  const { podcasts, editPodcast } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handlePlayPodcast = (podcast: any) => {
    if (podcast.audio_url) {
      playTrack({
        id: podcast.id,
        title: podcast.title,
        artist: podcast.host_name,
        audio_url: podcast.audio_url,
        cover_url: podcast.cover_url,
        isLive: false,
        type: 'podcast',
      });
    }
  };

  const handleLike = async (podcast: any) => {
    if (likedIds.has(podcast.id)) return;
    
    const newLikes = (podcast.likes || 0) + 1;
    setLikedIds(prev => new Set(prev).add(podcast.id));
    
    try {
      await editPodcast(podcast.id, { likes: newLikes });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const isCurrentTrack = (id: string) => currentTrack?.id === id && isPlaying;

  return (
    <section id="podcasts" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Подкасты</span>
          </h2>
          <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет подкастов</p>
            </div>
          ) : (
            podcasts.map(podcast => {
              const playing = isCurrentTrack(podcast.id);
              const liked = likedIds.has(podcast.id);
              return (
                <div key={podcast.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                  <div className="relative mb-4">
                    {podcast.cover_url ? (
                      <img src={podcast.cover_url} alt={podcast.title} className="w-full h-48 rounded-xl object-cover" />
                    ) : (
                      <div className={\`w-full h-48 rounded-xl bg-gradient-to-br \${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center\`}>
                        <Headphones className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {podcast.audio_url && (
                      <button
                        onClick={() => handlePlayPodcast(podcast)}
                        className={\`absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl transition-opacity \${playing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}\`}
                      >
                        <div className={\`w-16 h-16 rounded-full flex items-center justify-center \${playing ? 'bg-[#22c55e]' : 'bg-[#6366f1]'}\`}>
                          {playing ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                        </div>
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{podcast.title}</h3>
                  <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>

                  <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-3">
                    {podcast.host_name && <span>{podcast.host_name}</span>}
                    {podcast.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{podcast.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#27273a]">
                    <div className="flex items-center gap-1 text-sm text-[#71717a]">
                      <Heart className={\`w-4 h-4 \${liked ? 'fill-[#ef4444] text-[#ef4444]' : ''}\`} />
                      <span>{podcast.likes || 0}</span>
                    </div>
                    <button 
                      onClick={() => handleLike(podcast)}
                      disabled={liked}
                      className={\`p-2 transition-colors \${liked ? 'text-[#ef4444]' : 'text-[#71717a] hover:text-[#ef4444]'}\`}
                    >
                      <Heart className={\`w-5 h-5 \${liked ? 'fill-[#ef4444]' : ''}\`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// 8. ADMINLAYOUT - ДОБАВЛЯЕМ HOTELS И NAVIGATION
// ==========================================
console.log('🎨 8/12 Обновление AdminLayout...');

writeFile('src/admin/components/AdminLayout.tsx', `
import { Radio, LayoutDashboard, Radio as RadioIcon, Users, Music, Tags, Settings, Building2, Link2, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'shows', label: 'Передачи', icon: RadioIcon },
  { id: 'hosts', label: 'Ведущие', icon: Users },
  { id: 'podcasts', label: 'Подкасты', icon: Music },
  { id: 'categories', label: 'Категории', icon: Tags },
  { id: 'hotels', label: 'Отели', icon: Building2 },
  { id: 'navigation', label: 'Навигация', icon: Link2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminLayout({ children, onLogout, currentPage, onNavigate }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <aside className="w-64 bg-[#13131f] border-r border-[#27273a] flex flex-col fixed h-full">
        <div className="p-6 border-b border-[#27273a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Cosmos FM</h1>
              <p className="text-xs text-[#71717a]">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left \${
                  isActive
                    ? 'bg-[#6366f1] text-white'
                    : 'text-[#a1a1aa] hover:bg-[#1e1e2e] hover:text-white'
                }\`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#27273a]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
`);

// ==========================================
// 9. HOTELSPAGE - НОВАЯ СТРАНИЦА
// ==========================================
console.log('🏨 9/12 Создание HotelsPage...');

writeFile('src/admin/pages/HotelsPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Building2, Trash2, Edit, X } from 'lucide-react';

export function HotelsPage() {
  const { hotels, addHotel, editHotel, removeHotel } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.city) {
      setMessage('❌ Заполните название и город');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editHotel(editingItem.id, formData);
        setMessage('✅ Отель обновлён!');
      } else {
        await addHotel(formData);
        setMessage('✅ Отель добавлен!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить отель?')) {
      await removeHotel(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Отели</h1>
          <span className="text-sm text-[#71717a]">({hotels.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#71717a]">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет отелей. Добавьте первый!</p>
          </div>
        ) : (
          hotels.map(hotel => (
            <div key={hotel.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{hotel.name}</h3>
                  <p className="text-sm text-[#6366f1]">{hotel.city}</p>
                  {hotel.address && <p className="text-xs text-[#71717a] mt-1 truncate">{hotel.address}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(hotel)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm">
                  <Edit className="w-4 h-4 inline mr-1" /> Изменить
                </button>
                <button onClick={() => handleDelete(hotel.id)} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} отель</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Город *</label>
                <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Адрес</label>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 10. NAVIGATIONPAGE - НОВАЯ СТРАНИЦА
// ==========================================
console.log('🔗 10/12 Создание NavigationPage...');

writeFile('src/admin/pages/NavigationPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Link2, Trash2, Edit, X, GripVertical } from 'lucide-react';

export function NavigationPage() {
  const { navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.label || !formData.url) {
      setMessage('❌ Заполните название и URL');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editNavigationLink(editingItem.id, formData);
        setMessage('✅ Ссылка обновлена!');
      } else {
        await addNavigationLink(formData);
        setMessage('✅ Ссылка добавлена!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить ссылку?')) {
      await removeNavigationLink(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Навигация</h1>
          <span className="text-sm text-[#71717a]">({navigationLinks.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ type: 'anchor', target: '_self', is_active: true, order_index: navigationLinks.length + 1 }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {navigationLinks.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет ссылок. Добавьте первую!</p>
          </div>
        ) : (
          navigationLinks.map(link => (
            <div key={link.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-[#71717a]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{link.label}</h3>
                  <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                    link.type === 'internal' ? 'bg-[#6366f1]/20 text-[#6366f1]' :
                    link.type === 'external' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                    'bg-[#22c55e]/20 text-[#22c55e]'
                  }\`}>{link.type}</span>
                </div>
                <p className="text-sm text-[#71717a] truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(link)} className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(link.id)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} ссылка</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.label || ''} onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="Расписание" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">URL *</label>
                <input type="text" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="#/schedule" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Тип</label>
                  <select value={formData.type || 'anchor'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none">
                    <option value="anchor">Якорь</option>
                    <option value="internal">Внутренняя</option>
                    <option value="external">Внешняя</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Порядок</label>
                  <input type="number" value={formData.order_index || 0} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active || false} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 accent-[#6366f1]" />
                <span className="text-sm">Активна</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 11. SQL ДЛЯ SUPABASE
// ==========================================
console.log('📊 11/12 Создание SQL...');

writeFile('supabase-final.sql', `
-- ==========================================
-- COSMOS FM - ДОПОЛНИТЕЛЬНЫЕ ТАБЛИЦЫ
-- ==========================================

-- 1. ТАБЛИЦА ОТЕЛЕЙ
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admin write hotels" ON public.hotels;

CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin write hotels" ON public.hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. ТАБЛИЦА НАВИГАЦИИ
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'anchor',
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  target TEXT DEFAULT '_self',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read nav" ON public.navigation_links;
DROP POLICY IF EXISTS "Admin write nav" ON public.navigation_links;

CREATE POLICY "Public read nav" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Admin write nav" ON public.navigation_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. НАЧАЛЬНЫЕ ДАННЫЕ
INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;
`);

// ==========================================
// 12. ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ФИНАЛЬНЫЙ СКРИПТ ВЫПОЛНЕН!');
console.log('='.repeat(60));
console.log('\n📋 СОЗДАНО/ОБНОВЛЕНО 12 ФАЙЛОВ:');
console.log('  1. src/App.tsx - исправлена навигация');
console.log('  2. src/lib/supabase.ts - добавлены hotels + navigation');
console.log('  3. src/context/DataContext.tsx - полная интеграция');
console.log('  4. src/components/Header.tsx - динамическая навигация');
console.log('  5. src/components/BottomNav.tsx - динамическая навигация');
console.log('  6. src/sections/HomeSection.tsx - с блоком ведущих');
console.log('  7. src/sections/PodcastsSection.tsx - с лайками');
console.log('  8. src/admin/components/AdminLayout.tsx - + 2 раздела');
console.log('  9. src/admin/pages/HotelsPage.tsx - НОВЫЙ');
console.log(' 10. src/admin/pages/NavigationPage.tsx - НОВЫЙ');
console.log(' 11. supabase-final.sql - SQL для БД');
console.log(' 12. fix-final.js - этот скрипт');

console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните SQL в Supabase:');
console.log('     → Откройте https://supabase.com/dashboard');
console.log('     → SQL Editor → New query');
console.log('     → Вставьте содержимое supabase-final.sql');
console.log('     → Нажмите RUN');
console.log('');
console.log('  2. Перезапустите сервер:');
console.log('     npm run dev');
console.log('');
console.log('  3. Проверьте:');
console.log('     • Главная: http://localhost:5173');
console.log('     • Навигация в шапке работает (URL обновляется)');
console.log('     • Ведущие на главной отображаются');
console.log('     • Лайки на подкастах работают');
console.log('     • Админка: http://localhost:5173/#/admin');
console.log('     • В админке 8 разделов (+Отели и +Навигация)');

console.log('\n🚀 ГОТОВО!');