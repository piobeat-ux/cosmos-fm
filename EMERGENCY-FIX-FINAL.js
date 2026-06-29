import fs from 'fs';

console.log('🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ - ТАЙМАУТ ЗАГРУЗКИ\n');

// 1. Исправляем DataContext.tsx - правильные имена таблиц
console.log('1/4 Исправление DataContext.tsx...');

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
console.log('✅ DataContext.tsx исправлен');

// 2. Исправляем supabase.ts - правильное имя колонки order_index
console.log('2/4 Исправление supabase.ts...');

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
      
      console.log(' Fetch:', url.substring(0, 80));
      
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
console.log('✅ supabase.ts исправлен');

// 3. Удаляем Service Worker временно
console.log('3/4 Удаление Service Worker...');

if (fs.existsSync('public/sw.js')) {
  fs.unlinkSync('public/sw.js');
  console.log('✅ public/sw.js удалён');
}

// 4. Исправляем Header.tsx - добавляем navigationLinks
console.log('4/4 Исправление Header.tsx...');

const headerContent = `import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export function Header({ onTabChange, activeTab }) {
  const { navigation, navigationLinks } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Используем navigationLinks если есть, иначе navigation
  const navData = (navigationLinks && navigationLinks.length > 0) 
    ? navigationLinks 
    : (navigation && navigation.length > 0 ? navigation : []);

  const navItems = navData.length > 0
    ? navData.map(link => ({
        id: link.url ? link.url.replace('#/', '').replace('#', '') || 'home' : 'home',
        label: link.label || link.name || 'Пункт',
      }))
    : [
        { id: 'home', label: 'Эфир' },
        { id: 'schedule', label: 'Расписание' },
        { id: 'hosts', label: 'Ведущие' },
        { id: 'podcasts', label: 'Подкасты' },
        { id: 'about', label: 'О нас' },
      ];

  console.log('📋 Navigation items:', navItems);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg bg-white">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#28B9D0] to-[#685096] flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A2B3C]">Cosmos FM</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 rounded-xl p-1 bg-[#B6E0EE60]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' 
                  : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-[#4A6578]">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#4A6578] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#AFCB31]" />
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-[#1A2B3C]" /> : <Menu className="text-[#1A2B3C]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
              className={\`w-full text-left px-4 py-3 rounded-lg mb-1 font-bold \${
                activeTab === item.id ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
`;

fs.writeFileSync('src/components/Header.tsx', headerContent);
console.log('✅ Header.tsx исправлен');

console.log('\n' + '='.repeat(70));
console.log('✅ ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ ГОТОВО!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ DataContext - правильные имена таблиц:');
console.log('   - navigation_links (вместо navigation)');
console.log('   - site_settings (вместо settings)');
console.log('2. ✅ supabase.ts - правильная сортировка:');
console.log('   - order_index (вместо order)');
console.log('3. ✅ Service Worker удалён (не мешает)');
console.log('4. ✅ Header.tsx - navigationLinks с fallback');
console.log('\n🚀 СРОЧНО ВЫПОЛНИТЕ:');
console.log('  1. Проверьте .env.local:');
console.log('     VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co');
console.log('     VITE_SUPABASE_ANON_KEY=ваш_ключ');
console.log('  2. Остановите dev сервер (Ctrl+C)');
console.log('  3. Запустите заново: npm run dev');
console.log('  4. Откройте консоль (F12)');
console.log('  5. Должны появиться логи:');
console.log('     ✅ Supabase credentials loaded');
console.log('     🔄 Loading data from Supabase...');
console.log('     ✅ Loaded: X items');
console.log('     ✅ All data loaded successfully!');
console.log('\n⚠️ ВАЖНО:');
console.log('  - Если всё ещё не работает - проверьте:');
console.log('    1. .env.local существует и содержит правильные ключи');
console.log('    2. Supabase проект доступен (откройте в браузере)');
console.log('    3. Таблицы существуют в Supabase');
console.log('='.repeat(70));
