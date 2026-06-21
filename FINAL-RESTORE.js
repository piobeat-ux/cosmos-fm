import fs from 'fs';

console.log('🚨 === СРОЧНОЕ ВОССТАНОВЛЕНИЕ ===\n');

// ==========================================
// 1. ВОССТАНАВЛИВАЕМ РАБОЧИЙ APP.TSX + HotelsPage
// ==========================================
console.log('1. Восстановление App.tsx...');

const appContent = `import { useState, useEffect } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AudioProvider } from '@/context/AudioContext';
import { Header } from '@/components/Header';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { HomeSection } from '@/sections/HomeSection';
import { ScheduleSection } from '@/sections/ScheduleSection';
import { HostsSection } from '@/sections/HostsSection';
import { PodcastsSection } from '@/sections/PodcastsSection';
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
  const { loading } = useData();

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
      case 'hotels': return <HotelsPage />;
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
console.log('✅ App.tsx восстановлен + добавлен HotelsPage');

// ==========================================
// 2. ИСПРАВЛЯЕМ DATACONTEXT - ГЛАВНАЯ ПРОБЛЕМА
// ==========================================
console.log('\n2. Исправление DataContext (ГЛАВНАЯ ПРОБЛЕМА)...');

const dataContextContent = `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getShows, getHosts, getPodcasts, getCategories, getSettings,
  getHotels, getNavigationLinks,
  createShow, updateShow, deleteShow,
  createHost, updateHost, deleteHost,
  createPodcast, updatePodcast, deletePodcast,
  createCategory, updateCategory, deleteCategory,
  createHotel, updateHotel, deleteHotel,
  createNavigationLink, updateNavigationLink, deleteNavigationLink,
  updateSetting, supabase,
  uploadFile,
} from '@/lib/supabase';

const DataContext = createContext(undefined);

// ДЕМО ДАННЫЕ
const DEMO_DATA = {
  shows: [
    { id: '1', title: 'Утреннее шоу', description: 'Бодрое начало дня', host_name: 'Дмитрий Иванов', time: '08:00', duration: '2ч', category: 'Музыка', day_of_week: 'Пн', is_live: true, cover_url: '', audio_url: 'https://stream.radioparadise.com/aac-128' },
    { id: '2', title: 'Новости отелей', description: 'Главные новости', host_name: 'Анна Петрова', time: '12:00', duration: '1ч', category: 'Новости', day_of_week: 'Пн', is_live: false, cover_url: '', audio_url: '' },
  ],
  hosts: [
    { id: '1', name: 'Дмитрий Иванов', role: 'Ведущий', hotel: 'Cosmos Moscow', bio: 'Профессиональный радиоведущий', photo_url: '', color: 'from-[#f59e0b] to-[#f97316]', initials: 'ДИ' },
    { id: '2', name: 'Анна Петрова', role: 'Журналист', hotel: 'Cosmos St. Petersburg', bio: 'Эксперт в области гостеприимства', photo_url: '', color: 'from-[#8b5cf6] to-[#6366f1]', initials: 'АП' },
  ],
  podcasts: [
    { id: '1', title: 'Истории успеха', description: 'Интервью с лидерами', host_name: 'Анна Петрова', episodes: 12, duration: '45 мин', category: 'Интервью', likes: 156, color: 'from-[#6366f1] to-[#8b5cf6]', cover_url: '', audio_url: '' },
  ],
  categories: [
    { id: '1', name: 'Музыка', icon: '🎵', description: 'Музыкальные программы' },
    { id: '2', name: 'Новости', icon: '📰', description: 'Новости индустрии' },
  ],
  hotels: [
    { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
    { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
  ],
  navigationLinks: [
    { id: '1', label: 'Эфир', url: '#/', order_index: 1, is_active: true },
    { id: '2', label: 'Расписание', url: '#/schedule', order_index: 2, is_active: true },
    { id: '3', label: 'Ведущие', url: '#/hosts', order_index: 3, is_active: true },
    { id: '4', label: 'Подкасты', url: '#/podcasts', order_index: 4, is_active: true },
    { id: '5', label: 'О нас', url: '#/about', order_index: 5, is_active: true },
  ],
  settings: {
    site_title: 'Cosmos FM',
    hero_title: 'Голос вашего отеля',
    hero_subtitle: 'Звуки вашего космоса',
    hero_description: 'Первый в России корпоративный медиа-канал',
    stream_url: 'https://stream.radioparadise.com/aac-128',
    primary_color: '#6366f1',
    neppy_image: ''
  }
};

export function DataProvider({ children }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [settings, setSettings] = useState(DEMO_DATA.settings);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    
    // ТАЙМАУТ 5 СЕКУНД
    const timeoutPromise = new Promise(resolve => 
      setTimeout(() => resolve({ timeout: true }), 5000)
    );
    
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase не инициализирован');
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      console.log('🔄 Загрузка из Supabase...');
      
      const result = await Promise.race([
        Promise.all([
          getShows(),
          getHosts(),
          getPodcasts(),
          getCategories(),
          getSettings(),
          getHotels(),
          getNavigationLinks(),
        ]),
        timeoutPromise
      ]);
      
      if (result && result.timeout) {
        console.warn('⏰ Таймаут Supabase, используем демо данные');
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
      } else {
        const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = result;
        
        const hasData = showsData?.length > 0 || hostsData?.length > 0;
        
        if (hasData) {
          console.log('✅ Данные из Supabase загружены');
          setShows(showsData || []);
          setHosts(hostsData || []);
          setPodcasts(podcastsData || []);
          setCategories(categoriesData || []);
          setSettings({ ...DEMO_DATA.settings, ...settingsData });
          setHotels(hotelsData?.length > 0 ? hotelsData : DEMO_DATA.hotels);
          setNavigationLinks(navData?.length > 0 ? navData : DEMO_DATA.navigationLinks);
          setIsDemoMode(false);
        } else {
          console.log('⚠️ Supabase пуст, демо данные');
          setShows(DEMO_DATA.shows);
          setHosts(DEMO_DATA.hosts);
          setPodcasts(DEMO_DATA.podcasts);
          setCategories(DEMO_DATA.categories);
          setHotels(DEMO_DATA.hotels);
          setNavigationLinks(DEMO_DATA.navigationLinks);
          setIsDemoMode(true);
        }
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки:', err);
      setShows(DEMO_DATA.shows);
      setHosts(DEMO_DATA.hosts);
      setPodcasts(DEMO_DATA.podcasts);
      setCategories(DEMO_DATA.categories);
      setHotels(DEMO_DATA.hotels);
      setNavigationLinks(DEMO_DATA.navigationLinks);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const refresh = useCallback(() => { loadData(); }, [loadData]);

  const uploadMedia = async (file, type) => {
    try {
      return await uploadFile(file, type);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (supabase && !isDemoMode) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  };

  const addShow = async (show) => { if (!isDemoMode) await createShow(show); refresh(); };
  const editShow = async (id, show) => { if (!isDemoMode) await updateShow(id, show); refresh(); };
  const removeShow = async (id) => { if (!isDemoMode) await deleteShow(id); refresh(); };

  const addHost = async (host) => { if (!isDemoMode) await createHost(host); refresh(); };
  const editHost = async (id, host) => { if (!isDemoMode) await updateHost(id, host); refresh(); };
  const removeHost = async (id) => { if (!isDemoMode) await deleteHost(id); refresh(); };

  const addPodcast = async (podcast) => { if (!isDemoMode) await createPodcast(podcast); refresh(); };
  const editPodcast = async (id, podcast) => { if (!isDemoMode) await updatePodcast(id, podcast); refresh(); };
  const removePodcast = async (id) => { if (!isDemoMode) await deletePodcast(id); refresh(); };

  const addCategory = async (category) => { if (!isDemoMode) await createCategory(category); refresh(); };
  const editCategory = async (id, category) => { if (!isDemoMode) await updateCategory(id, category); refresh(); };
  const removeCategory = async (id) => { if (!isDemoMode) await deleteCategory(id); refresh(); };

  const addHotel = async (hotel) => { if (!isDemoMode) await createHotel(hotel); refresh(); };
  const editHotel = async (id, hotel) => { if (!isDemoMode) await updateHotel(id, hotel); refresh(); };
  const removeHotel = async (id) => { if (!isDemoMode) await deleteHotel(id); refresh(); };

  const addNavigationLink = async (link) => { if (!isDemoMode) await createNavigationLink(link); refresh(); };
  const editNavigationLink = async (id, link) => { if (!isDemoMode) await updateNavigationLink(id, link); refresh(); };
  const removeNavigationLink = async (id) => { if (!isDemoMode) await deleteNavigationLink(id); refresh(); };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, 
      loading, refresh, isDemoMode,
      uploadMedia,
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
`;

fs.writeFileSync('src/context/DataContext.tsx', dataContextContent);
console.log('✅ DataContext исправлен (таймаут 5 сек + демо данные)');

// ==========================================
// 3. ВОССТАНАВЛИВАЕМ LIB/SUPABASE.TS
// ==========================================
console.log('\n3. Восстановление lib/supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    })
  : null;

export async function getShows() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('shows').select('*');
  if (error) throw error;
  return data || [];
}

export async function getHosts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('hosts').select('*');
  if (error) throw error;
  return data || [];
}

export async function getPodcasts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('podcasts').select('*');
  if (error) throw error;
  return data || [];
}

export async function getCategories() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data || [];
}

export async function getHotels() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('hotels').select('*');
  if (error) throw error;
  return data || [];
}

export async function getNavigationLinks() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('navigation_links').select('*').order('order_index');
  if (error) throw error;
  return (data || []).filter(l => l.is_active);
}

export async function getSettings() {
  if (!supabase) return {};
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings = {};
  data?.forEach(item => { settings[item.key] = item.value; });
  return settings;
}

export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;
  const { data, error } = await supabase.storage.from('media').upload(filePath, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function createShow(show) { const { error } = await supabase.from('shows').insert([show]); if (error) throw error; }
export async function updateShow(id, show) { const { error } = await supabase.from('shows').update(show).eq('id', id); if (error) throw error; }
export async function deleteShow(id) { const { error } = await supabase.from('shows').delete().eq('id', id); if (error) throw error; }

export async function createHost(host) { const { error } = await supabase.from('hosts').insert([host]); if (error) throw error; }
export async function updateHost(id, host) { const { error } = await supabase.from('hosts').update(host).eq('id', id); if (error) throw error; }
export async function deleteHost(id) { const { error } = await supabase.from('hosts').delete().eq('id', id); if (error) throw error; }

export async function createPodcast(podcast) { const { error } = await supabase.from('podcasts').insert([podcast]); if (error) throw error; }
export async function updatePodcast(id, podcast) { const { error } = await supabase.from('podcasts').update(podcast).eq('id', id); if (error) throw error; }
export async function deletePodcast(id) { const { error } = await supabase.from('podcasts').delete().eq('id', id); if (error) throw error; }

export async function createCategory(category) { const { error } = await supabase.from('categories').insert([category]); if (error) throw error; }
export async function updateCategory(id, category) { const { error } = await supabase.from('categories').update(category).eq('id', id); if (error) throw error; }
export async function deleteCategory(id) { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) throw error; }

export async function createHotel(hotel) { const { error } = await supabase.from('hotels').insert([hotel]); if (error) throw error; }
export async function updateHotel(id, hotel) { const { error } = await supabase.from('hotels').update(hotel).eq('id', id); if (error) throw error; }
export async function deleteHotel(id) { const { error } = await supabase.from('hotels').delete().eq('id', id); if (error) throw error; }

export async function createNavigationLink(link) { const { error } = await supabase.from('navigation_links').insert([link]); if (error) throw error; }
export async function updateNavigationLink(id, link) { const { error } = await supabase.from('navigation_links').update(link).eq('id', id); if (error) throw error; }
export async function deleteNavigationLink(id) { const { error } = await supabase.from('navigation_links').delete().eq('id', id); if (error) throw error; }

export async function updateSetting(key, value) { const { error } = await supabase.from('site_settings').upsert({ key, value }); if (error) throw error; }
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ lib/supabase.ts восстановлен');

console.log('\n' + '='.repeat(60));
console.log('✅ ВОССТАНОВЛЕНИЕ ЗАВЕРШЕНО!');
console.log('='.repeat(60));
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ App.tsx восстановлен (рабочая версия)');
console.log('  ✅ Добавлен HotelsPage в роутинг');
console.log('  ✅ DataContext: таймаут 5 сек + демо данные');
console.log('  ✅ lib/supabase.ts: чистый код без лишних логов');
console.log('\n️ Приложение загрузится за 5 секунд максимум!');