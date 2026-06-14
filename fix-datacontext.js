import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Исправление DataContext.tsx...\n');

const dataContextPath = path.join(__dirname, 'src/context/DataContext.tsx');
let content = fs.readFileSync(dataContextPath, 'utf-8');

// Исправляем синтаксис импорта
content = content.replace(
  /,\s*getNavigationLinks,/,
  '\n  getNavigationLinks,'
);

// Если не помогло, попробуем другой паттерн
content = content.replace(
  /\s*,\s*getNavigationLinks,/,
  '\n  getNavigationLinks,'
);

fs.writeFileSync(dataContextPath, content);

console.log('✅ DataContext.tsx исправлен!');
console.log('\nПерезапустите dev сервер:');
console.log('  npm run dev');