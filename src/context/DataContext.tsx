import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
