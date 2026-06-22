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
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        console.log('🔄 Starting data load...');
        
        // Timeout after 10 seconds
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            console.error('⏱️ Data load timeout');
            setLoading(false);
            setError('Превышено время загрузки. Проверьте подключение к интернету.');
          }
        }, 10000);

        // Load all data in parallel
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
          supabase.from('navigation').select('*').order('order'),
          supabase.from('settings').select('*')
        ]);

        if (cancelled) return;

        // Process results
        setShows(showsRes.status === 'fulfilled' ? showsRes.value.data || [] : []);
        setHosts(hostsRes.status === 'fulfilled' ? hostsRes.value.data || [] : []);
        setPodcasts(podcastsRes.status === 'fulfilled' ? podcastsRes.value.data || [] : []);
        setCategories(categoriesRes.status === 'fulfilled' ? categoriesRes.value.data || [] : []);
        setHotels(hotelsRes.status === 'fulfilled' ? hotelsRes.value.data || [] : []);
        setNavigation(navigationRes.status === 'fulfilled' ? navigationRes.value.data || [] : []);
        
        // Process settings into object
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
          const settingsObj = {};
          settingsRes.value.data.forEach(item => {
            settingsObj[item.key] = item.value;
          });
          setSettings(settingsObj);
        }

        clearTimeout(timeoutId);
        setLoading(false);
        setVersion(v => v + 1);
        console.log('✅ Data loaded successfully');
        
      } catch (err) {
        console.error('❌ Error loading data:', err);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
          setError('Ошибка загрузки данных');
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

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
