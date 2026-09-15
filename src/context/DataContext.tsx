import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_SETTINGS, type Show, type Host, type Podcast, type Category, type Hotel, type SiteSettings } from '@/types/database';

interface NavigationLink {
  id: string;
  label: string;
  url: string;
  type: string;
  is_active: boolean;
  order_index: number;
}
interface ResourceRows {
  shows: Show;
  hosts: Host;
  podcasts: Podcast;
  categories: Category;
  hotels: Hotel;
  navigation_links: NavigationLink;
}
type Resource = keyof ResourceRows;
type Snapshot = { [K in Resource]: ResourceRows[K][] } & { settings: SiteSettings };
type Input = Record<string, unknown>;
type Crud = { [K in `add${'Show' | 'Host' | 'Podcast' | 'Category' | 'Hotel' | 'NavigationLink'}`]: (data: Input) => Promise<void> }
  & { [K in `edit${'Show' | 'Host' | 'Podcast' | 'Category' | 'Hotel' | 'NavigationLink'}`]: (id: string, data: Input) => Promise<void> }
  & { [K in `remove${'Show' | 'Host' | 'Podcast' | 'Category' | 'Hotel' | 'NavigationLink'}`]: (id: string) => Promise<void> };
type DataContextType = Omit<Snapshot, 'navigation_links'> & Crud & {
  navigation: NavigationLink[];
  loading: boolean;
  error: string | null;
  version: number;
  refresh: () => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
};

const emptySnapshot = (): Snapshot => ({ shows: [], hosts: [], podcasts: [], categories: [], hotels: [], navigation_links: [], settings: { ...DEFAULT_SETTINGS } });
const DataContext = createContext<DataContextType | undefined>(undefined);

async function readAll<K extends Resource>(table: K, signal: AbortSignal): Promise<ResourceRows[K][]> {
  const rows: ResourceRows[K][] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase.from(table).select('*').order('id').range(start, start + 499).abortSignal(signal);
    if (error) throw error;
    rows.push(...(data as ResourceRows[K][]));
    if (data.length < 500) return rows;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const [shows, hosts, podcasts, categories, hotels, navigation_links, settingsResult] = await Promise.all([
        readAll('shows', controller.signal), readAll('hosts', controller.signal),
        readAll('podcasts', controller.signal), readAll('categories', controller.signal),
        readAll('hotels', controller.signal), readAll('navigation_links', controller.signal),
        supabase.from('site_settings').select('key,value').abortSignal(controller.signal),
      ]);
      if (settingsResult.error) throw settingsResult.error;
      if (controller.signal.aborted) return;
      const settings: SiteSettings = { ...DEFAULT_SETTINGS };
      for (const item of settingsResult.data || []) {
        if (typeof item.key === 'string' && typeof item.value === 'string' && !['__proto__', 'constructor', 'prototype'].includes(item.key)) settings[item.key] = item.value;
      }
      setSnapshot({ shows, hosts, podcasts, categories, hotels, navigation_links: [...navigation_links].sort((a, b) => a.order_index - b.order_index), settings });
      setError(null);
      setVersion(value => value + 1);
    } catch {
      if (!controller.signal.aborted) setError('Не удалось загрузить данные радиостанции. Проверьте соединение и повторите попытку.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSnapshot(emptySnapshot());
    setLoading(true);
    void refresh();
    return () => request.current?.abort();
  }, [isAdmin, refresh]);

  const mutate = async (table: Resource, action: 'insert' | 'update' | 'delete', data?: Input, id?: string) => {
    const query = action === 'insert' ? supabase.from(table).insert(data)
      : action === 'update' ? supabase.from(table).update(data).eq('id', id)
      : supabase.from(table).delete().eq('id', id);
    const { data: changed, error: mutationError } = await query.select('id');
    if (mutationError) throw new Error('Не удалось сохранить изменение. Проверьте права доступа и введённые данные.');
    if (!changed?.length) throw new Error('Запись уже удалена или недоступна для изменения.');
    await refresh();
  };

  const crud = <K extends Resource>(table: K) => ({
    add: (data: Input) => mutate(table, 'insert', data),
    edit: (id: string, data: Input) => mutate(table, 'update', data, id),
    remove: (id: string) => mutate(table, 'delete', undefined, id),
  });
  const shows = crud('shows'), hosts = crud('hosts'), podcasts = crud('podcasts');
  const categories = crud('categories'), hotels = crud('hotels'), navigation = crud('navigation_links');

  const updateSettings = async (settings: SiteSettings) => {
    const rows = Object.entries(settings).map(([key, value]) => {
      if (!/^[a-z][a-z0-9_]{0,63}$/.test(key) || typeof value !== 'string' || value.length > 50_000) throw new Error('Проверьте значения настроек.');
      return { key, value };
    });
    if (!rows.length) return;
    const { error: saveError } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (saveError) throw new Error('Не удалось сохранить настройки. Повторите попытку.');
    await refresh();
  };

  return <DataContext.Provider value={{
    ...snapshot, navigation: snapshot.navigation_links, loading, error, version, refresh, updateSettings,
    addShow: shows.add, editShow: shows.edit, removeShow: shows.remove,
    addHost: hosts.add, editHost: hosts.edit, removeHost: hosts.remove,
    addPodcast: podcasts.add, editPodcast: podcasts.edit, removePodcast: podcasts.remove,
    addCategory: categories.add, editCategory: categories.edit, removeCategory: categories.remove,
    addHotel: hotels.add, editHotel: hotels.edit, removeHotel: hotels.remove,
    addNavigationLink: navigation.add, editNavigationLink: navigation.edit, removeNavigationLink: navigation.remove,
  }}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
