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

const DEFAULT_NAV = [
  { id: '1', label: 'Эфир', url: '#/', type: 'anchor', order_index: 1, is_active: true },
  { id: '2', label: 'Расписание', url: '#/schedule', type: 'anchor', order_index: 2, is_active: true },
  { id: '3', label: 'Ведущие', url: '#/hosts', type: 'anchor', order_index: 3, is_active: true },
  { id: '4', label: 'Подкасты', url: '#/podcasts', type: 'anchor', order_index: 4, is_active: true },
  { id: '5', label: 'О нас', url: '#/about', type: 'anchor', order_index: 5, is_active: true },
];

const DEFAULT_HOTELS = [
  { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
  { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
  { id: '3', name: 'Cosmos Sochi', city: 'Сочи' },
];

const DEFAULT_SETTINGS = {
  site_title: 'Cosmos FM',
  hero_title: 'Голос вашего отеля',
  hero_subtitle: 'Звуки вашего космоса',
  hero_description: 'Первый в России корпоративный медиа-канал в индустрии гостеприимства',
  stream_url: '',
  primary_color: '#6366f1',
};

export function DataProvider({ children }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
      setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
      setHotels(hotelsData && hotelsData.length > 0 ? hotelsData : DEFAULT_HOTELS);
      setNavigationLinks(navData && navData.length > 0 ? navData : DEFAULT_NAV);
    } catch (err) {
      console.warn('Using demo data:', err.message);
      setShows([]);
      setHosts([]);
      setPodcasts([]);
      setCategories([]);
      setHotels(DEFAULT_HOTELS);
      setNavigationLinks(DEFAULT_NAV);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const refresh = useCallback(() => { loadData(); }, [loadData]);

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
    if (supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  };

  const addShow = async (show) => { await createShow(show); refresh(); };
  const editShow = async (id, show) => { await updateShow(id, show); refresh(); };
  const removeShow = async (id) => { await deleteShow(id); refresh(); };

  const addHost = async (host) => { await createHost(host); refresh(); };
  const editHost = async (id, host) => { await updateHost(id, host); refresh(); };
  const removeHost = async (id) => { await deleteHost(id); refresh(); };

  const addPodcast = async (podcast) => { await createPodcast(podcast); refresh(); };
  const editPodcast = async (id, podcast) => { await updatePodcast(id, podcast); refresh(); };
  const removePodcast = async (id) => { await deletePodcast(id); refresh(); };

  const addCategory = async (category) => { await createCategory(category); refresh(); };
  const editCategory = async (id, category) => { await updateCategory(id, category); refresh(); };
  const removeCategory = async (id) => { await deleteCategory(id); refresh(); };

  const addHotel = async (hotel) => { await createHotel(hotel); refresh(); };
  const editHotel = async (id, hotel) => { await updateHotel(id, hotel); refresh(); };
  const removeHotel = async (id) => { await deleteHotel(id); refresh(); };

  const addNavigationLink = async (link) => { await createNavigationLink(link); refresh(); };
  const editNavigationLink = async (id, link) => { await updateNavigationLink(id, link); refresh(); };
  const removeNavigationLink = async (id) => { await deleteNavigationLink(id); refresh(); };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, loading, refresh,
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