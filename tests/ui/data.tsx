import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './client';
const Context = createContext(null);
export function FixtureData({ children }) {
  const [rows, setRows] = useState({ shows: [], podcasts: [], categories: [] });
  const refresh = useCallback(async () => {
    const results = await Promise.all(['shows', 'podcasts', 'categories'].map(table => supabase.from(table).select('*')));
    for (const result of results) if (result.error) throw new Error(result.error.message);
    setRows({ shows: results[0].data, podcasts: results[1].data, categories: results[2].data });
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <Context.Provider value={{ ...rows, refresh }}>{children}</Context.Provider>;
}
export function useData() { return useContext(Context); }
