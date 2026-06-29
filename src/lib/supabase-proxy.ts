// Прокси клиент для обхода блокировки Supabase в России

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Определяем использовать ли прокси
// Если мы в production на Vercel - используем прокси
const USE_PROXY = typeof window !== 'undefined' && 
  window.location.hostname.includes('vercel.app');

// Базовый URL для запросов
const BASE_URL = USE_PROXY ? '' : supabaseUrl;
const PROXY_PATH = USE_PROXY ? '/api/supabase' : '';

// Custom fetch с прокси и таймаутом 30 секунд
export const proxyFetch = async (url: string, options: any = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    // Если это запрос к Supabase
    if (url && url.includes('supabase.co')) {
      // Извлекаем путь после URL Supabase
      const path = url.replace(supabaseUrl, '');
      const proxyUrl = `${PROXY_PATH}${path}`;
      
      console.log('Using proxy:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    }
    
    // Обычный fetch для других запросов
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch error:', error);
    throw error;
  }
};

// Экспортируем для совместимости
export { supabaseUrl, supabaseKey, USE_PROXY };
