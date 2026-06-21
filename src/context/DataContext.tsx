import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  navigationLinks: [],
  settings: {
    site_title: 'Cosmos FM',
    hero_title: 'Голос вашего отеля',
    hero_subtitle: 'Звуки вашего космоса',
    hero_description: 'Первый в России корпоративный медиа-канал',
    stream_url: 'https://stream.radioparadise.com/aac-128',
    primary_color: '#6366f1',
    neppy_image: '',
    neppy_phrase: 'ПРИВЕТ! Я НЭППИ'
  }
};

export function DataProvider({ children }) {
  const [shows, setShows] = useState(DEMO_DATA.shows);
  const [hosts, setHosts] = useState(DEMO_DATA.hosts);
  const [podcasts, setPodcasts] = useState(DEMO_DATA.podcasts);
  const [categories, setCategories] = useState(DEMO_DATA.categories);
  const [hotels, setHotels] = useState(DEMO_DATA.hotels);
  const [navigationLinks, setNavigationLinks] = useState(DEMO_DATA.navigationLinks);
  const [settings, setSettings] = useState(DEMO_DATA.settings);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [version, setVersion] = useState(0);

  const loadData = useCallback(async () => {
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized');
      return;
    }

    setLoading(true);
    console.log('🔄 Loading data...');

    try {
      console.log(' Batch 1: shows + settings');
      const [showsData, settingsData] = await Promise.all([
        getShows(),
        getSettings(),
      ]);
      
      if (showsData?.length > 0) {
        setShows(showsData);
        console.log('✅ Shows:', showsData.length);
      }
      
      if (settingsData && Object.keys(settingsData).length > 0) {
        console.log('💾 Settings from DB:', settingsData);
        const newSettings = { ...DEMO_DATA.settings, ...settingsData };
        console.log('💾 Merged settings:', newSettings);
        setSettings(newSettings);
        console.log('✅ Settings loaded');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(' Batch 2: hosts + podcasts');
      const [hostsData, podcastsData] = await Promise.all([
        getHosts(),
        getPodcasts(),
      ]);
      
      if (hostsData?.length > 0) {
        setHosts(hostsData);
        console.log('✅ Hosts:', hostsData.length);
      }
      if (podcastsData?.length > 0) {
        setPodcasts(podcastsData);
        console.log('✅ Podcasts:', podcastsData.length);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(' Batch 3: categories + hotels');
      const [categoriesData, hotelsData] = await Promise.all([
        getCategories(),
        getHotels(),
      ]);
      
      if (categoriesData?.length > 0) {
        setCategories(categoriesData);
        console.log('✅ Categories:', categoriesData.length);
      }
      if (hotelsData?.length > 0) {
        setHotels(hotelsData);
        console.log('✅ Hotels:', hotelsData.length);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(' Batch 4: navigation');
      const navData = await getNavigationLinks();
      if (navData?.length > 0) {
        setNavigationLinks(navData);
        console.log('✅ Navigation:', navData.length);
      }

      setIsDemoMode(false);
      console.log('✅ All data loaded!');
      
    } catch (err) {
      console.error('❌ Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const refresh = useCallback(() => { 
    console.log('🔄 Refresh');
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
    console.log('💾 Updating settings:', newSettings);
    
    // Сначала обновляем локально
    const updatedSettings = { ...settings, ...newSettings };
    console.log('💾 New settings:', updatedSettings);
    setSettings(updatedSettings);
    setVersion(v => v + 1);
    
    // Потом сохраняем в Supabase
    if (supabase && !isDemoMode) {
      try {
        for (const [key, value] of Object.entries(newSettings)) {
          if (value !== undefined && value !== null) {
            console.log(`💾 Saving '${key}' = '${value}'`);
            await updateSetting(key, value);
            console.log(`✅ Setting '${key}' saved`);
          }
        }
        console.log('✅ All settings saved to DB');
      } catch (err) {
        console.error('❌ Settings save error:', err);
      }
    }
  };

  const addShow = async (show) => { 
    try {
      if (!isDemoMode) {
        const newShow = await createShow(show);
        setShows(prev => [newShow, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add show error:', err);
      throw err;
    }
  };
  
  const editShow = async (id, show) => { 
    try {
      if (!isDemoMode) await updateShow(id, show);
      setShows(prev => prev.map(s => s.id === id ? { ...s, ...show } : s));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit show error:', err);
      throw err;
    }
  };
  
  const removeShow = async (id) => { 
    try {
      if (!isDemoMode) await deleteShow(id);
      setShows(prev => prev.filter(s => s.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove show error:', err);
      throw err;
    }
  };

  const addHost = async (host) => { 
    try {
      if (!isDemoMode) {
        const newHost = await createHost(host);
        setHosts(prev => [newHost, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add host error:', err);
      throw err;
    }
  };
  
  const editHost = async (id, host) => { 
    try {
      if (!isDemoMode) await updateHost(id, host);
      setHosts(prev => prev.map(h => h.id === id ? { ...h, ...host } : h));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit host error:', err);
      throw err;
    }
  };
  
  const removeHost = async (id) => { 
    try {
      if (!isDemoMode) await deleteHost(id);
      setHosts(prev => prev.filter(h => h.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove host error:', err);
      throw err;
    }
  };

  const addPodcast = async (podcast) => { 
    try {
      if (!isDemoMode) {
        const newPodcast = await createPodcast(podcast);
        setPodcasts(prev => [newPodcast, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add podcast error:', err);
      throw err;
    }
  };
  
  const editPodcast = async (id, podcast) => { 
    try {
      if (!isDemoMode) await updatePodcast(id, podcast);
      setPodcasts(prev => prev.map(p => p.id === id ? { ...p, ...podcast } : p));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit podcast error:', err);
      throw err;
    }
  };
  
  const removePodcast = async (id) => { 
    try {
      if (!isDemoMode) await deletePodcast(id);
      setPodcasts(prev => prev.filter(p => p.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove podcast error:', err);
      throw err;
    }
  };

  const addCategory = async (category) => { 
    try {
      if (!isDemoMode) {
        const newCategory = await createCategory(category);
        setCategories(prev => [newCategory, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add category error:', err);
      throw err;
    }
  };
  
  const editCategory = async (id, category) => { 
    try {
      if (!isDemoMode) await updateCategory(id, category);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit category error:', err);
      throw err;
    }
  };
  
  const removeCategory = async (id) => { 
    try {
      if (!isDemoMode) await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove category error:', err);
      throw err;
    }
  };

  const addHotel = async (hotel) => { 
    try {
      if (!isDemoMode) {
        const newHotel = await createHotel(hotel);
        setHotels(prev => [newHotel, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add hotel error:', err);
      throw err;
    }
  };
  
  const editHotel = async (id, hotel) => { 
    try {
      if (!isDemoMode) await updateHotel(id, hotel);
      setHotels(prev => prev.map(h => h.id === id ? { ...h, ...hotel } : h));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit hotel error:', err);
      throw err;
    }
  };
  
  const removeHotel = async (id) => { 
    try {
      if (!isDemoMode) await deleteHotel(id);
      setHotels(prev => prev.filter(h => h.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove hotel error:', err);
      throw err;
    }
  };

  const addNavigationLink = async (link) => { 
    try {
      if (!isDemoMode) {
        const newLink = await createNavigationLink(link);
        setNavigationLinks(prev => [...prev, newLink]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add navigation link error:', err);
      throw err;
    }
  };
  
  const editNavigationLink = async (id, link) => { 
    try {
      if (!isDemoMode) await updateNavigationLink(id, link);
      setNavigationLinks(prev => prev.map(l => l.id === id ? { ...l, ...link } : l));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit navigation link error:', err);
      throw err;
    }
  };
  
  const removeNavigationLink = async (id) => { 
    try {
      if (!isDemoMode) await deleteNavigationLink(id);
      setNavigationLinks(prev => prev.filter(l => l.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove navigation link error:', err);
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, 
      loading, refresh, isDemoMode, version,
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
