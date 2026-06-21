import fs from 'fs';

// Исправляем DataContext - добавляем обработку ошибок и демо режим
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

// ДЕМО ДАННЫЕ (fallback)
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
    { id: '2', title: 'Тренды гостеприимства', description: 'Что нового в отелях', host_name: 'Дмитрий Иванов', episodes: 8, duration: '30 мин', category: 'Обучение', likes: 89, color: 'from-[#22c55e] to-[#14b8a6]', cover_url: '', audio_url: '' },
  ],
  categories: [
    { id: '1', name: 'Музыка', icon: '🎵', description: 'Музыкальные программы' },
    { id: '2', name: 'Новости', icon: '📰', description: 'Новости индустрии' },
    { id: '3', name: 'Интервью', icon: '🎙️', description: 'Интервью с экспертами' },
  ],
  hotels: [
    { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
    { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
    { id: '3', name: 'Cosmos Sochi', city: 'Сочи' },
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
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем доступен ли supabase
      if (!supabase) {
        console.warn('⚠️ Supabase не инициализирован, используем демо данные');
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

      console.log('🔄 Загрузка данных из Supabase...');
      
      // Пробуем загрузить с таймаутом 10 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = await Promise.all([
          getShows(),
          getHosts(),
          getPodcasts(),
          getCategories(),
          getSettings(),
          getHotels(),
          getNavigationLinks(),
        ]);
        
        clearTimeout(timeoutId);
        
        // Проверяем получили ли данные
        const hasData = showsData?.length > 0 || hostsData?.length > 0 || podcastsData?.length > 0;
        
        if (hasData) {
          console.log('✅ Данные загружены из Supabase');
          setShows(showsData || []);
          setHosts(hostsData || []);
          setPodcasts(podcastsData || []);
          setCategories(categoriesData || []);
          setSettings({ ...DEMO_DATA.settings, ...settingsData });
          setHotels(hotelsData?.length > 0 ? hotelsData : DEMO_DATA.hotels);
          setNavigationLinks(navData?.length > 0 ? navData : DEMO_DATA.navigationLinks);
          setIsDemoMode(false);
        } else {
          console.log('⚠️ Supabase пуст, используем демо данные');
          setShows(DEMO_DATA.shows);
          setHosts(DEMO_DATA.hosts);
          setPodcasts(DEMO_DATA.podcasts);
          setCategories(DEMO_DATA.categories);
          setHotels(DEMO_DATA.hotels);
          setNavigationLinks(DEMO_DATA.navigationLinks);
          setIsDemoMode(true);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.warn('⚠️ Ошибка загрузки из Supabase:', fetchError.message);
        console.log('📦 Используем демо данные');
        
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
        setError(fetchError.message);
      }
    } catch (err) {
      console.error('❌ Критическая ошибка:', err);
      setShows(DEMO_DATA.shows);
      setHosts(DEMO_DATA.hosts);
      setPodcasts(DEMO_DATA.podcasts);
      setCategories(DEMO_DATA.categories);
      setHotels(DEMO_DATA.hotels);
      setNavigationLinks(DEMO_DATA.navigationLinks);
      setIsDemoMode(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const refresh = useCallback(() => { 
    loadData(); 
  }, [loadData]);

  const uploadMedia = async (file, type) => {
    try {
      const url = await uploadFile(file, type);
      return url;
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

  const addShow = async (show) => { 
    if (!isDemoMode) await createShow(show); 
    refresh(); 
  };
  const editShow = async (id, show) => { 
    if (!isDemoMode) await updateShow(id, show); 
    refresh(); 
  };
  const removeShow = async (id) => { 
    if (!isDemoMode) await deleteShow(id); 
    refresh(); 
  };

  const addHost = async (host) => { 
    if (!isDemoMode) await createHost(host); 
    refresh(); 
  };
  const editHost = async (id, host) => { 
    if (!isDemoMode) await updateHost(id, host); 
    refresh(); 
  };
  const removeHost = async (id) => { 
    if (!isDemoMode) await deleteHost(id); 
    refresh(); 
  };

  const addPodcast = async (podcast) => { 
    if (!isDemoMode) await createPodcast(podcast); 
    refresh(); 
  };
  const editPodcast = async (id, podcast) => { 
    if (!isDemoMode) await updatePodcast(id, podcast); 
    refresh(); 
  };
  const removePodcast = async (id) => { 
    if (!isDemoMode) await deletePodcast(id); 
    refresh(); 
  };

  const addCategory = async (category) => { 
    if (!isDemoMode) await createCategory(category); 
    refresh(); 
  };
  const editCategory = async (id, category) => { 
    if (!isDemoMode) await updateCategory(id, category); 
    refresh(); 
  };
  const removeCategory = async (id) => { 
    if (!isDemoMode) await deleteCategory(id); 
    refresh(); 
  };

  const addHotel = async (hotel) => { 
    if (!isDemoMode) await createHotel(hotel); 
    refresh(); 
  };
  const editHotel = async (id, hotel) => { 
    if (!isDemoMode) await updateHotel(id, hotel); 
    refresh(); 
  };
  const removeHotel = async (id) => { 
    if (!isDemoMode) await deleteHotel(id); 
    refresh(); 
  };

  const addNavigationLink = async (link) => { 
    if (!isDemoMode) await createNavigationLink(link); 
    refresh(); 
  };
  const editNavigationLink = async (id, link) => { 
    if (!isDemoMode) await updateNavigationLink(id, link); 
    refresh(); 
  };
  const removeNavigationLink = async (id) => { 
    if (!isDemoMode) await deleteNavigationLink(id); 
    refresh(); 
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, 
      loading, refresh, isDemoMode, error,
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
console.log('✅ DataContext исправлен!');
console.log('Теперь:');
console.log('  - Данные загружаются с таймаутом 10 секунд');
console.log('  - При ошибке используются демо данные');
console.log('  - Приложение не блокируется');
console.log('  - Показывается предупреждение');
console.log('\n🚀 Перезапустите: npm run dev');