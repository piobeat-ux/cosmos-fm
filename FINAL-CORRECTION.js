import fs from 'fs';

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ===\n');

// 1. Fix DataContext - correct table names
console.log('1/3 Исправление DataContext.tsx...');

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

// 2. Fix App.tsx - add error to useData destructuring
console.log('2/3 Исправление App.tsx...');

if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  
  // Fix FrontLayout - add error to useData
  content = content.replace(
    'const { loading } = useData();',
    'const { loading, error } = useData();'
  );
  
  // Remove any broken console.log remnants
  content = content.replace(/,\n\s*hasValidImage,/g, 'hasValidImage,');
  content = content.replace(/\n\s*,\n\s*hasValidImage,/g, '\n    hasValidImage,');
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('✅ App.tsx исправлен (добавлен error в useData)');
}

// 3. Fix Header.tsx - correct variable name
console.log('3/3 Исправление Header.tsx...');

if (fs.existsSync('src/components/Header.tsx')) {
  let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');
  
  // Fix navigationLinks -> navigation
  content = content.replace(
    'const { navigationLinks } = useData();',
    'const { navigation } = useData();'
  );
  
  content = content.replace(
    'navigationLinks.length',
    'navigation.length'
  );
  
  content = content.replace(
    'navigationLinks.map',
    'navigation.map'
  );
  
  fs.writeFileSync('src/components/Header.tsx', content);
  console.log('✅ Header.tsx исправлен (navigationLinks → navigation)');
}

console.log('\n' + '='.repeat(70));
console.log('✅ ВСЁ ИСПРАВЛЕНО!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ navigation → navigation_links');
console.log('2. ✅ settings → site_settings');
console.log('3. ✅ Добавлен error в FrontLayout');
console.log('4. ✅ navigationLinks → navigation в Header');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\nЕсли заработало:');
console.log('  npm run build');
console.log('  git add .');
console.log('  git commit -m "fix: table names and error handling"');
console.log('  git push origin main');
console.log('='.repeat(70));
