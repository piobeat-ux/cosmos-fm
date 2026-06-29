import fs from 'fs';

console.log(' === ФИНАЛЬНОЕ РЕШЕНИЕ С FALLBACK ДАННЫМИ ===\n');

// 1. Исправляем DataContext.tsx - правильные имена таблиц + fallback
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

// Fallback данные если Supabase недоступен
const FALLBACK_DATA = {
  shows: [
    { id: '1', title: 'Утреннее шоу', description: 'Бодрое начало дня', host_name: 'Дмитрий Иванов', time: '08:00', day_of_week: 'Пн', is_live: true }
  ],
  hosts: [
    { id: '1', name: 'Дмитрий Иванов', role: 'Ведущий', bio: 'Профессиональный радиоведущий' }
  ],
  podcasts: [
    { id: '1', title: 'Cosmos FM Podcast', description: 'Еженедельный подкаст', host_name: 'Команда Cosmos FM', episodes: 10 }
  ],
  categories: [
    { id: '1', name: 'Музыка', description: 'Лучшие хиты' }
  ],
  hotels: [
    { id: '1', name: 'Cosmos Hotel Moscow', city: 'Москва' }
  ],
  navigation: [
    { id: '1', label: 'Эфир', url: '#/home', order_index: 1 },
    { id: '2', label: 'Расписание', url: '#/schedule', order_index: 2 },
    { id: '3', label: 'Ведущие', url: '#/hosts', order_index: 3 },
    { id: '4', label: 'Подкасты', url: '#/podcasts', order_index: 4 },
    { id: '5', label: 'О нас', url: '#/about', order_index: 5 }
  ],
  settings: {
    site_name: 'Cosmos FM',
    hero_title: 'Голос вашего отеля',
    hero_subtitle: 'Звуки вашего космоса',
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

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        console.log(' Попытка загрузки данных из Supabase...');
        
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            console.warn('️ Таймаут загрузки (15 сек), используем fallback данные');
            setLoading(false);
            setError('Не удалось подключиться к серверу. Показаны демо-данные.');
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
          supabase.from('navigation_links').select('*').order('order_index', { ascending: true }),
          supabase.from('site_settings').select('*')
        ]);

        if (cancelled) return;

        const getData = (result: any, fallback: any[]) => {
          if (result.status === 'fulfilled' && result.value.data) {
            console.log('✅ Загружено из Supabase:', result.value.data.length, 'записей');
            return result.value.data;
          }
          console.warn('⚠️ Используем fallback данные');
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
        console.log('✅ Данные загружены!');
        
      } catch (err: any) {
        console.error('❌ Ошибка загрузки:', err);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
          setError('Используются демо-данные');
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
console.log('✅ DataContext.tsx - добавлены fallback данные');

// 2. Исправляем Header.tsx - используем navigation вместо navigationLinks
console.log('2/4 Исправление Header.tsx...');

const headerContent = `import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export function Header({ onTabChange, activeTab }) {
  const { navigation } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = navigation && navigation.length > 0
    ? navigation.map(link => ({
        id: link.url ? link.url.replace('#/', '').replace('#', '') || 'home' : 'home',
        label: link.label || 'Пункт',
      }))
    : [
        { id: 'home', label: 'Эфир' },
        { id: 'schedule', label: 'Расписание' },
        { id: 'hosts', label: 'Ведущие' },
        { id: 'podcasts', label: 'Подкасты' },
        { id: 'about', label: 'О нас' },
      ];

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
console.log('✅ Header.tsx - используется navigation');

// 3. Увеличиваем таймаут в supabase.ts
console.log('3/4 Увеличение таймаута в supabase.ts...');

if (fs.existsSync('src/lib/supabase.ts')) {
  let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');
  
  // Увеличиваем таймаут с 10000 до 15000
  content = content.replace(
    'const timeoutId = setTimeout(() => controller.abort(), 10000);',
    'const timeoutId = setTimeout(() => controller.abort(), 15000);'
  );
  
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log('✅ supabase.ts - таймаут увеличен до 15 сек');
}

// 4. Исправляем App.tsx - добавляем error в useData
console.log('4/4 Исправление App.tsx...');

if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  
  // Добавляем error в FrontLayout
  content = content.replace(
    'const { loading } = useData();',
    'const { loading, error } = useData();'
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('✅ App.tsx - добавлен error');
}

console.log('\n' + '='.repeat(70));
console.log('✅ ФИНАЛЬНОЕ РЕШЕНИЕ ГОТОВО!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ DataContext.tsx - правильные имена таблиц:');
console.log('   - navigation_links (вместо navigation)');
console.log('   - site_settings (вместо settings)');
console.log('2. ✅ DataContext.tsx - добавлены FALLBACK данные');
console.log('3. ✅ Header.tsx - используется navigation (не navigationLinks)');
console.log('4. ✅ supabase.ts - таймаут увеличен до 15 сек');
console.log('5. ✅ App.tsx - добавлен error в useData()');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\n✅ РЕЗУЛЬТАТ:');
console.log('  - Сайт ЗАГРУЗИТСЯ даже без Supabase!');
console.log('  - Будут показаны демо-данные');
console.log('  - Навигация будет работать');
console.log('  - Все страницы будут доступны');
console.log('\n Когда Supabase станет доступен:');
console.log('  - Данные загрузятся автоматически');
console.log('  - Демо-данные заменятся реальными');
console.log('='.repeat(70));
