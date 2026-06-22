import fs from 'fs';

console.log('🔧 ИСПРАВЛЕНИЕ ИМЕН ТАБЛИЦ И ОШИБОК...\n');

// 1. Fix DataContext - correct table names
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

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            setLoading(false);
            setError('Превышено время загрузки');
          }
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
          supabase.from('navigation_links').select('*').order('order'),
          supabase.from('site_settings').select('*')
        ]);

        if (cancelled) return;

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

        clearTimeout(timeoutId);
        setLoading(false);
        setVersion(v => v + 1);
        
      } catch (err: any) {
        console.error('Error loading data:', err);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
          setError(err.message || 'Ошибка загрузки');
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
`;

fs.writeFileSync('src/context/DataContext.tsx', dataContextContent);
console.log('✅ DataContext.tsx исправлен (navigation_links, site_settings)');

// 2. Fix App.tsx line 88
if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  
  // Fix error variable issues
  content = content.replace(/if\s*\(\s*error\s*&&\s*error\s*!==\s*["']undefined["']\s*\)/g, 'if (error)');
  content = content.replace(/error\s*&&\s*error\s*!==\s*["']undefined["']\s*\?/g, 'error ?');
  
  // Remove any broken console.log remnants
  content = content.replace(/,\n\s*hasValidImage,/g, 'hasValidImage,');
  content = content.replace(/\n\s*,\n\s*hasValidImage,/g, '\n    hasValidImage,');
  content = content.replace(/\n\s*,\n\s*imageLoaded,/g, '\n    imageLoaded,');
  content = content.replace(/\n\s*,\n\s*imageError,/g, '\n    imageError,');
  content = content.replace(/\n\s*,\n\s*loadAttempts\n\s*\}\);/g, '\n  });');
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('✅ App.tsx исправлен');
}

console.log('\n✅ ГОТОВО! Запустите: npm run dev');
