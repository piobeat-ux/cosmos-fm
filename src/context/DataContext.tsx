import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
      setError(null);

      const timeoutId = setTimeout(() => {
        setError('Превышено время загрузки');
        setLoading(false);
      }, 30000);

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

      clearTimeout(timeoutId);

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
      setError(err.message || 'Ошибка загрузки');
      setLoading(false);
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
