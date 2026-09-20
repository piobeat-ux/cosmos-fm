import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) throw new Error('Не настроено подключение к радиостанции.');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: {
    fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
      const controller = new AbortController();
      const parentSignal = options.signal;
      const abort = () => controller.abort(parentSignal?.reason);
      if (parentSignal?.aborted) abort();
      else parentSignal?.addEventListener('abort', abort, { once: true });
      const timeout = setTimeout(() => controller.abort(), 15_000);
      try { return await fetch(url, { ...options, signal: controller.signal }); }
      finally {
        clearTimeout(timeout);
        parentSignal?.removeEventListener('abort', abort);
      }
    },
  },
});
