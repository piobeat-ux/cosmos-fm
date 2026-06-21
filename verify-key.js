import fs from 'fs';

console.log('🔍 ПРОВЕРКА КЛЮЧА SUPABASE\n');

const envContent = fs.readFileSync('.env', 'utf-8');
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);

if (!keyMatch || !urlMatch) {
  console.log('❌ Ключ или URL не найдены в .env');
  process.exit(1);
}

const key = keyMatch[1].trim();
const url = urlMatch[1].trim();

console.log('URL:', url);
console.log('Key:', key);
console.log('Key length:', key.length);
console.log('Starts with eyJ:', key.startsWith('eyJ'));
console.log('Has quotes:', key.includes('"') || key.includes("'"));
console.log('Has spaces:', key.includes(' '));

// Проверяем ключ напрямую через fetch
console.log('\n🔗 Тестирование ключа напрямую...\n');

async function test() {
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    console.log('Status:', res.status, res.statusText);
    
    if (res.status === 401) {
      console.log('\n❌ КЛЮЧ НЕДЕЙСТВИТЕЛЕН!');
      console.log('\n ИНСТРУКЦИЯ:');
      console.log('1. Откройте: https://supabase.com/dashboard/project/ozchhkjsrstdnowutsow/settings/api');
      console.log('2. Прокрутите до "Project API keys"');
      console.log('3. Нажмите на иконку "показать" рядом с "anon public"');
      console.log('4. Скопируйте ВЕСЬ ключ (начинается с eyJhbGci...)');
      console.log('5. Вставьте в .env БЕЗ кавычек и пробелов');
    } else if (res.status === 200) {
      console.log('✅ КЛЮЧ РАБОТАЕТ!');
    }
  } catch (e) {
    console.log(' Ошибка сети:', e.message);
  }
}

test();