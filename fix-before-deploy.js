import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ИСПРАВЛЕНИЕ ПЕРЕД ДЕПЛОЕМ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// 1. ИСПРАВЛЕНИЕ VITE.CONFIG.TS
console.log('1/5 Исправление vite.config.ts...');
writeFile('vite.config.ts', `import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
`);

// 2. ИСПРАВЛЕНИЕ PACKAGE.JSON
console.log('2/5 Исправление package.json...');
const packageJson = {
  "name": "cosmos-fm",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.106.2",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
};

writeFile('package.json', JSON.stringify(packageJson, null, 2));

// 3. СОЗДАНИЕ .ENV.PRODUCTION
console.log('3/5 Создание .env.production...');
writeFile('.env.production', `VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=ВСТАВЬТЕ_СЮДА_ВАШ_ANON_KEY
`);

// 4. СОЗДАНИЕ VERCEL.JSON
console.log('4/5 Создание vercel.json...');
writeFile('vercel.json', `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
`);

// 5. СОЗДАНИЕ .GITIGNORE
console.log('5/5 Создание .gitignore...');
writeFile('.gitignore', `node_modules
dist
.env
.env.local
.env.production.local
*.log
.DS_Store
`);

console.log('\n' + '='.repeat(60));
console.log('✅ ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Откройте .env.production и вставьте SUPABASE_ANON_KEY');
console.log('  2. Запушьте код в GitHub');
console.log('  3. Подключите репозиторий в Vercel');
console.log('  4. Добавьте переменные окружения в Vercel');
console.log('  5. Деплой!');