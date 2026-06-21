
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Тестирование подключения к Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствует URL или ключ!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('\n📡 Проверка подключения...');
    const { data, error } = await supabase.from('site_settings').select('*').limit(1);
    
    if (error) {
      console.error('❌ Ошибка:', error.message);
      console.error('Code:', error.code);
    } else {
      console.log('✅ Подключение успешно!');
      console.log('Данные:', data);
    }
  } catch (err) {
    console.error('❌ Исключение:', err.message);
  }
}

test();
