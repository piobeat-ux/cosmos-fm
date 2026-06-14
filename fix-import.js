import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(' Исправление импорта в DataContext.tsx...\n');

const dataContextPath = path.join(__dirname, 'src/context/DataContext.tsx');
let content = fs.readFileSync(dataContextPath, 'utf-8');

// Исправляем: добавляем запятую после supabase
content = content.replace(
  /uploadFile, updateSetting, supabase\s+getNavigationLinks/,
  'uploadFile, updateSetting, supabase,\n  getNavigationLinks'
);

fs.writeFileSync(dataContextPath, content);

console.log('✅ DataContext.tsx исправлен!');
console.log('\nПерезапустите dev сервер:');
console.log('  npm run dev');