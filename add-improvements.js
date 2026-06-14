import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 === ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// 1. УЛУЧШШЕННЫЙ INDEX.CSS
console.log('📱 1/5 Улучшение стилей...');

writeFile('src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@layer base {
  :root {
    --background: 240 20% 4%;
    --foreground: 0 0% 100%;
    --card: 240 15% 8%;
    --card-foreground: 0 0% 100%;
    --popover: 240 15% 8%;
    --popover-foreground: 0 0% 100%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 263 70% 66%;
    --secondary-foreground: 0 0% 100%;
    --muted: 240 10% 15%;
    --muted-foreground: 240 5% 65%;
    --accent: 187 94% 43%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 10% 20%;
    --input: 240 10% 20%;
    --ring: 239 84% 67%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
    -webkit-tap-highlight-color: transparent;
  }
  body {
    @apply bg-[#0a0a0f] text-white antialiased;
    font-family: 'Inter', system-ui, sans-serif;
    padding-bottom: 140px;
    overscroll-behavior-y: none;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

@layer components {
  .gradient-text {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  }
  .glass-card {
    @apply bg-[#13131f]/90 backdrop-blur-xl;
    border: 1px solid rgba(39, 39, 58, 0.5);
  }
  .glass-player {
    @apply bg-[#0a0a0f]/95 backdrop-blur-2xl;
    border-top: 1px solid rgba(39, 39, 58, 0.5);
  }
  .btn-primary {
    @apply relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }
  .btn-primary:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
  .btn-secondary {
    @apply px-6 py-3 rounded-xl font-semibold text-white border border-[#6366f1] bg-transparent transition-all duration-300;
  }
  .btn-secondary:hover {
    @apply bg-[#6366f1]/10;
  }
  .section-padding {
    @apply px-4 sm:px-6 lg:px-8;
  }
  .now-playing-glow {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
  }
  .audio-wave {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 24px;
  }
  .audio-wave-bar {
    width: 3px;
    background: linear-gradient(to top, #6366f1, #8b5cf6);
    border-radius: 2px;
    animation: wave 0.8s ease-in-out infinite;
  }
  .audio-wave-bar:nth-child(1) { animation-delay: 0s; height: 8px; }
  .audio-wave-bar:nth-child(2) { animation-delay: 0.1s; height: 16px; }
  .audio-wave-bar:nth-child(3) { animation-delay: 0.2s; height: 12px; }
  .audio-wave-bar:nth-child(4) { animation-delay: 0.3s; height: 20px; }
  .audio-wave-bar:nth-child(5) { animation-delay: 0.4s; height: 10px; }
  .nav-item {
    @apply flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200;
  }
  .nav-item.active {
    @apply text-[#6366f1];
  }
  .nav-item:not(.active) {
    @apply text-[#71717a] hover:text-white;
  }
  .show-card {
    @apply glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer;
  }
  .show-card:hover {
    @apply border-[#6366f1]/50;
    transform: translateY(-2px);
  }
  .show-card.live {
    @apply border-[#22c55e]/50 now-playing-glow;
  }
  .category-badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium;
  }
  .host-avatar {
    @apply w-16 h-16 rounded-full object-cover border-2 border-[#27273a];
  }
  .host-avatar.large {
    @apply w-24 h-24;
  }
  .search-input {
    @apply w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-all;
  }
  .filter-chip {
    @apply px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer;
  }
  .filter-chip.active {
    @apply bg-[#6366f1] text-white;
  }
  .filter-chip:not(.active) {
    @apply bg-[#13131f] text-[#a1a1aa] hover:bg-[#1e1e2e];
  }
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  .slide-up {
    animation: slideUp 0.5s ease-out;
  }
  .scale-in {
    animation: scaleIn 0.3s ease-out;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .touch-manipulation {
    touch-action: manipulation;
  }
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0a0a0f;
}
::-webkit-scrollbar-thumb {
  background: #27273a;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}

::selection {
  background: rgba(99, 102, 241, 0.3);
  color: white;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  body {
    padding-bottom: 160px;
  }
  
  .section-padding {
    @apply px-3;
  }
  
  h1 {
    @apply text-3xl sm:text-4xl;
  }
  
  h2 {
    @apply text-2xl sm:text-3xl;
  }
  
  .grid {
    @apply grid-cols-1;
  }
  
  @media (min-width: 640px) {
    .grid {
      @apply grid-cols-2;
    }
  }
  
  @media (min-width: 1024px) {
    .grid {
      @apply grid-cols-3;
    }
  }
}

/* Touch devices */
@media (hover: none) {
  .btn-primary:hover,
  .btn-secondary:hover,
  .show-card:hover {
    transform: none;
  }
  
  .btn-primary:active,
  .btn-secondary:active {
    transform: scale(0.98);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`);

console.log('\n✅ Стили обновлены!');
console.log('\nТеперь создайте компоненты поиска и фильтров вручную:');
console.log('1. src/components/SearchBar.tsx');
console.log('2. src/components/FilterChips.tsx');
console.log('\nИли просто перезапустите проект:');
console.log('npm run dev');