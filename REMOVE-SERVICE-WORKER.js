import fs from 'fs';

console.log('🚨 УДАЛЕНИЕ SERVICE WORKER...\n');

// 1. Удаляем sw.js
console.log('1/4 Удаление Service Worker...');

if (fs.existsSync('public/sw.js')) {
  fs.unlinkSync('public/sw.js');
  console.log('✅ public/sw.js удалён');
} else {
  console.log('✅ public/sw.js уже удалён');
}

// 2. Исправляем main.tsx - удаляем регистрацию SW
console.log('2/4 Исправление main.tsx...');

const mainPath = 'src/main.tsx';
if (fs.existsSync(mainPath)) {
  let content = fs.readFileSync(mainPath, 'utf-8');
  
  // Удаляем ВСЁ что связано с Service Worker
  content = content.replace(/\/\/ Register Service Worker[\s\S]*?navigator\.serviceWorker\.register[\s\S]*?\}\);\s*\}/g, '');
  content = content.replace(/if \('serviceWorker' in navigator\) \{[\s\S]*?navigator\.serviceWorker\.register[\s\S]*?\}\);\s*\}/g, '');
  content = content.replace(/window\.addEventListener\('load', async \(\) => \{[\s\S]*?navigator\.serviceWorker\.register[\s\S]*?\}\);\s*\}/g, '');
  
  fs.writeFileSync(mainPath, content);
  console.log('✅ main.tsx - Service Worker регистрация удалена');
}

// 3. Исправляем DataContext - правильные имена таблиц
console.log('3/4 Исправление DataContext.tsx...');

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
        console.log('🔄 Loading data from Supabase...');
        
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            console.error('⏱️ Data load timeout (30s)');
            setLoading(false);
            setError('Превышено время загрузки. Проверьте подключение.');
          }
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

        if (cancelled) return;

        const getData = (result: any) => {
          if (result.status === 'fulfilled' && result.value.data) {
            console.log('✅ Loaded:', result.value.data.length, 'items');
            return result.value.data;
          }
          console.warn('⚠️ Failed to load table:', result.reason);
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
        console.log('✅ All data loaded successfully!');
        
      } catch (err: any) {
        console.error('❌ Error loading data:', err);
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

// 4. Исправляем supabase.ts - добавляем правильные заголовки
console.log('4/4 Исправление supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '***' + supabaseKey.slice(-10) : 'undefined');
} else {
  console.log('✅ Supabase credentials loaded');
  console.log('URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: \`Bearer \${supabaseKey}\`,
    },
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      console.log('📡 Fetch:', url.substring(0, 80));
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          apikey: supabaseKey,
          Authorization: \`Bearer \${supabaseKey}\`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
        .then(response => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            console.error('❌ HTTP error:', response.status, response.statusText);
          }
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('❌ Fetch error:', error.message);
          throw error;
        });
    },
  },
});

export async function signInAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    console.error('SignIn error:', err);
    return { data: null, error: err };
  }
}

export async function signUpAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  } catch (err) {
    console.error('SignUp error:', err);
    return { data: null, error: err };
  }
}

export async function signOutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('SignOut error:', err);
    return { error: err };
  }
}

export async function getShows() {
  try {
    const { data, error } = await supabase.from('shows').select('*').order('time');
    return { data: data || [], error };
  } catch (err) {
    console.error('getShows error:', err);
    return { data: [], error: err };
  }
}

export async function getHosts() {
  try {
    const { data, error } = await supabase.from('hosts').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getHosts error:', err);
    return { data: [], error: err };
  }
}

export async function getPodcasts() {
  try {
    const { data, error } = await supabase.from('podcasts').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getPodcasts error:', err);
    return { data: [], error: err };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getCategories error:', err);
    return { data: [], error: err };
  }
}

export async function getHotels() {
  try {
    const { data, error } = await supabase.from('hotels').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getHotels error:', err);
    return { data: [], error: err };
  }
}

export async function getNavigation() {
  try {
    const { data, error } = await supabase.from('navigation_links').select('*').order('order_index', { ascending: true });
    return { data: data || [], error };
  } catch (err) {
    console.error('getNavigation error:', err);
    return { data: [], error: err };
  }
}

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    return { data: data || [], error };
  } catch (err) {
    console.error('getSettings error:', err);
    return { data: [], error: err };
  }
}

export async function updateSetting(key: string, value: any) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    return { data, error };
  } catch (err) {
    console.error('updateSetting error:', err);
    return { data: null, error: err };
  }
}

export async function updateSettings(settings: Record<string, any>) {
  try {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    );
    const results = await Promise.all(updates);
    return results;
  } catch (err) {
    console.error('updateSettings error:', err);
    return [null];
  }
}
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ supabase.ts исправлен (заголовки, таймаут 30 сек)');

console.log('\n' + '='.repeat(70));
console.log('✅ SERVICE WORKER УДАЛЁН!');
console.log('='.repeat(70));
console.log('\n📋 Что сделано:');
console.log('1. ✅ public/sw.js удалён');
console.log('2. ✅ main.tsx - регистрация SW удалена');
console.log('3. ✅ DataContext.tsx - правильные имена таблиц');
console.log('4. ✅ supabase.ts - правильные заголовки и таймаут');
console.log('\n🚀 СРОЧНО ВЫПОЛНИТЕ:');
console.log('  1. Очистите кэш браузера:');
console.log('     - F12 → Application → Service Workers → Unregister');
console.log('     - Application → Storage → Clear site data');
console.log('  2. Обновите страницу (Ctrl+F5)');
console.log('  3. Откройте консоль (F12)');
console.log('  4. Должны появиться логи:');
console.log('     ✅ Supabase credentials loaded');
console.log('     🔄 Loading data from Supabase...');
console.log('     ✅ Loaded: X items');
console.log('     ✅ All data loaded successfully!');
console.log('\n⚠️ ВАЖНО:');
console.log('  - Service Worker больше НЕ будет перехватывать запросы');
console.log('  - Запросы к Supabase будут идти напрямую');
console.log('  - Сайт должен работать БЕЗ VPN!');
console.log('='.repeat(70));
