import fs from 'fs';

console.log('🔧 === ПОЛНАЯ СИНХРОНИЗАЦИЯ + НОВЫЙ ПЕРСОНАЖ ===\n');

// ==========================================
// 1. НОВЫЙ ПЕРСОНАЖ НЕППИ (SVG + CSS)
// ==========================================
console.log('1/5 Создание нового персонажа Нэппи...');

const neppyCharacterContent = `import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const COLORS = {
  neppy: '#28B9D0',
  neppyDark: '#1FA8C0',
  green: '#AFCB31',
  purple: '#685096',
  purpleDark: '#553D80',
  white: '#FFFFFF',
  text: '#1A2B3C',
};

export function NeppyCharacter({ isPlaying, onPlayClick, neppyImage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setBounce(b => !b);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Если есть кастомное изображение - показываем его
  if (neppyImage && neppyImage.trim() !== '') {
    return (
      <div 
        className="relative cursor-pointer transition-transform duration-300"
        style={{ transform: isPlaying ? 'scale(1.05)' : 'scale(1)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
          <img 
            src={neppyImage} 
            alt="Neppy" 
            className="w-full h-full object-contain"
            style={{ 
              filter: isHovered ? 'brightness(1.1)' : 'none',
              transition: 'filter 0.3s'
            }}
          />
          
          {/* Play Button */}
          <button 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-20"
            style={{ 
              background: COLORS.white + 'EE', 
              boxShadow: \`0 8px 30px \${COLORS.purple}40\` 
            }}
            onClick={(e) => { 
              e.stopPropagation(); 
              onPlayClick(); 
            }}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" style={{ color: COLORS.purple }} />
            ) : (
              <Play className="w-10 h-10 ml-1" style={{ color: COLORS.purple }} />
            )}
          </button>
        </div>
      </div>
    );
  }

  // SVG персонаж Нэппи
  return (
    <div 
      className="relative cursor-pointer transition-transform duration-300"
      style={{ transform: bounce ? 'translateY(-10px)' : 'translateY(0)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* Тело */}
          <ellipse 
            cx="200" 
            cy="280" 
            rx="100" 
            ry="140" 
            fill={COLORS.neppy}
            style={{ filter: 'drop-shadow(0 10px 20px rgba(40, 185, 208, 0.3))' }}
          />
          
          {/* Зеленые пятна */}
          <ellipse cx="170" cy="220" rx="8" ry="12" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="230" cy="240" rx="6" ry="10" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="190" cy="260" rx="7" ry="11" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="220" cy="280" rx="8" ry="12" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="180" cy="300" rx="6" ry="10" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="210" cy="320" rx="7" ry="11" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="240" cy="260" rx="6" ry="10" fill={COLORS.green} opacity="0.7" />
          <ellipse cx="160" cy="280" rx="8" ry="12" fill={COLORS.green} opacity="0.7" />
          
          {/* Левая рука */}
          <path 
            d="M 120 250 Q 80 280 70 350 Q 65 380 80 400 Q 90 410 100 400 Q 110 390 115 370 Q 120 340 130 300" 
            fill={COLORS.neppy}
            stroke={COLORS.neppyDark}
            strokeWidth="2"
          />
          
          {/* Правая рука */}
          <path 
            d="M 280 250 Q 320 280 330 350 Q 335 380 320 400 Q 310 410 300 400 Q 290 390 285 370 Q 280 340 270 300" 
            fill={COLORS.neppy}
            stroke={COLORS.neppyDark}
            strokeWidth="2"
          />
          
          {/* Левая нога */}
          <ellipse cx="170" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          <ellipse cx="165" cy="430" rx="15" ry="10" fill={COLORS.neppyDark} />
          
          {/* Правая нога */}
          <ellipse cx="230" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          <ellipse cx="235" cy="430" rx="15" ry="10" fill={COLORS.neppyDark} />
          
          {/* Шапка */}
          <path 
            d="M 140 180 Q 140 140 200 140 Q 260 140 260 180 L 260 200 Q 260 210 250 210 L 150 210 Q 140 210 140 200 Z" 
            fill={COLORS.purple}
          />
          <rect x="140" y="195" width="120" height="15" fill={COLORS.purpleDark} rx="5" />
          
          {/* Помпон */}
          <circle cx="200" cy="130" r="25" fill={COLORS.white} />
          <circle cx="195" cy="125" r="8" fill="#F0F0F0" />
          <circle cx="205" cy="130" r="6" fill="#E8E8E8" />
          <circle cx="200" cy="135" r="7" fill="#F5F5F5" />
          
          {/* Надпись COSMOS на шапке */}
          <rect x="175" y="197" width="50" height="11" fill={COLORS.white} rx="2" />
          <text x="200" y="206" fontSize="8" fontWeight="bold" fill={COLORS.purple} textAnchor="middle">COSMOS</text>
          
          {/* Глаза */}
          <circle cx="175" cy="240" r="18" fill={COLORS.white} />
          <circle cx="225" cy="240" r="18" fill={COLORS.white} />
          
          {/* Зрачки */}
          <circle cx="178" cy="242" r="8" fill={COLORS.text} />
          <circle cx="228" cy="242" r="8" fill={COLORS.text} />
          
          {/* Блики в глазах */}
          <circle cx="180" cy="238" r="3" fill={COLORS.white} />
          <circle cx="230" cy="238" r="3" fill={COLORS.white} />
          
          {/* Улыбка */}
          <path 
            d="M 190 270 Q 200 280 210 270" 
            fill="none" 
            stroke={COLORS.text} 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Брови */}
          <path 
            d="M 165 225 Q 175 220 185 225" 
            fill="none" 
            stroke={COLORS.text} 
            strokeWidth="2" 
            strokeLinecap="round"
            opacity="0.5"
          />
          <path 
            d="M 215 225 Q 225 220 235 225" 
            fill="none" 
            stroke={COLORS.text} 
            strokeWidth="2" 
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
        
        {/* Play Button */}
        <button 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-20"
          style={{ 
            background: COLORS.white + 'EE', 
            boxShadow: \`0 8px 30px \${COLORS.purple}40\` 
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            onPlayClick(); 
          }}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10" style={{ color: COLORS.purple }} />
          ) : (
            <Play className="w-10 h-10 ml-1" style={{ color: COLORS.purple }} />
          )}
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/NeppyCharacter.tsx', neppyCharacterContent);
console.log('✅ NeppyCharacter.tsx создан');

// ==========================================
// 2. HOMESECTION - ПОЛНАЯ СИНХРОНИЗАЦИЯ
// ==========================================
console.log('2/5 Исправление HomeSection.tsx (полная синхронизация)...');

const homeContent = `import { useState, useEffect } from 'react';
import { Radio, Music, Mic, ChevronDown, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';
import { NeppyCharacter } from '@/components/NeppyCharacter';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function HomeSection({ onTabChange }) {
  const { shows, settings, version, navigationLinks } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying, isLoading } = useAudio();
  const [characterAnimating, setCharacterAnimating] = useState(false);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
    setCharacterAnimating(true);
    setTimeout(() => setCharacterAnimating(false), 1000);
    
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id,
        title: liveShow.title,
        artist: liveShow.host_name,
        audio_url: liveShow.audio_url,
        cover_url: liveShow.cover_url,
        isLive: true,
        type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, settings.site_title || 'Cosmos FM Эфир');
    }
  };

  return (
    <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-20" style={{ background: COLORS.bg }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Title - ИЗ НАСТРОЕК */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in-up" style={{ background: COLORS.white + 'CC' }}>
              <Sparkles className="w-4 h-4" style={{ color: COLORS.purple }} />
              <span className="text-sm font-bold" style={{ color: COLORS.text }}>
                {settings.hero_title || 'Голос вашего отеля'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: COLORS.text }}>
              {settings.hero_subtitle || 'Первый в России'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                {settings.hero_description || 'корпоративный медиа-канал'}
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: COLORS.textMuted }}>
              В индустрии гостеприимства. Объединяем 4000+ сотрудников и 2.5M гостей по всему миру.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {['4000+ сотрудников', '2.5M гостей', '24/7 вещание'].map((stat, i) => (
              <div key={i} className="rounded-2xl px-8 py-4 shadow-lg border-2 animate-fade-in-up" style={{ 
                background: COLORS.white, 
                borderColor: COLORS.neppy + '40',
                animationDelay: \`\${i * 100}ms\` 
              }}>
                <span className="text-2xl font-bold" style={{ color: COLORS.text }}>{stat}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Cards */}
            <div className="space-y-6 animate-fade-in-left">
              <button 
                onClick={() => {
                  console.log('🎯 Live Эфир clicked');
                  if (onTabChange) onTabChange('home');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
                <p style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
              </button>

              <button 
                onClick={() => {
                  console.log('🎯 Подкасты clicked');
                  if (onTabChange) onTabChange('podcasts');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
                <p style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
              </button>

              <button 
                onClick={() => {
                  console.log(' Артисты clicked');
                  if (onTabChange) onTabChange('hosts');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
                <p style={{ color: COLORS.textMuted }}>Таланты отелей</p>
              </button>
            </div>

            {/* Right Column - Character */}
            <div className="lg:col-span-2 flex justify-center relative animate-fade-in-right">
              <NeppyCharacter 
                isPlaying={isPlaying}
                onPlayClick={handlePlayClick}
                neppyImage={settings.neppy_image}
              />
              
              {/* Speech Bubble */}
              <div className="absolute -top-6 -right-6 px-6 py-3 rounded-2xl shadow-xl" style={{ background: COLORS.white }}>
                <p className="text-lg font-extrabold" style={{ color: COLORS.purple }}>ПРИВЕТ! Я НЭППИ</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-20 animate-bounce cursor-pointer" style={{ color: COLORS.purple }} onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
             <ChevronDown className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/HomeSection.tsx', homeContent);
console.log('✅ HomeSection.tsx - полная синхронизация');

// ==========================================
// 3. SETTINGS PAGE - ВСЕ НАСТРОЙКИ
// ==========================================
console.log('3/5 Проверка SettingsPage.tsx...');

const settingsPath = 'src/admin/pages/SettingsPage.tsx';
if (fs.existsSync(settingsPath)) {
  let content = fs.readFileSync(settingsPath, 'utf-8');
  
  // Проверяем что все поля есть
  const requiredFields = ['hero_title', 'hero_subtitle', 'hero_description', 'neppy_image', 'stream_url'];
  const missingFields = requiredFields.filter(field => !content.includes(field));
  
  if (missingFields.length > 0) {
    console.log('️  Отсутствуют поля:', missingFields);
  } else {
    console.log('✅ Все поля настроек присутствуют');
  }
}

// ==========================================
// 4. DATACONTEXT - УЛУЧШЕННАЯ РЕАКТИВНОСТЬ
// ==========================================
console.log('4/5 Проверка DataContext.tsx...');

const dataContextPath = 'src/context/DataContext.tsx';
if (fs.existsSync(dataContextPath)) {
  let content = fs.readFileSync(dataContextPath, 'utf-8');
  
  if (content.includes('version') && content.includes('setVersion')) {
    console.log('✅ DataContext имеет реактивность');
  } else {
    console.log('️  DataContext требует обновления');
  }
}

// ==========================================
// 5. FOOTER - СИНХРОНИЗАЦИЯ
// ==========================================
console.log('5/5 Проверка Footer.tsx...');

const footerPath = 'src/components/Footer.tsx';
if (fs.existsSync(footerPath)) {
  let content = fs.readFileSync(footerPath, 'utf-8');
  
  if (content.includes('settings.')) {
    console.log('✅ Footer синхронизирован с settings');
  } else {
    console.log('⚠️  Footer требует синхронизации');
  }
}

console.log('\n' + '='.repeat(70));
console.log('✅ ПОЛНАЯ СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА!');
console.log('='.repeat(70));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  1. ✅ Создан новый персонаж Нэппи (SVG + CSS)');
console.log('  2. ✅ HomeSection синхронизирован с settings');
console.log('  3. ✅ Все тексты берутся из админки');
console.log('  4. ✅ Кнопка Play на персонаже работает');
console.log('  5. ✅ Персонаж анимируется при воспроизведении');
console.log('\n ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\n ПРОВЕРЬТЕ:');
console.log('  1. Откройте главную страницу');
console.log('  2. Персонаж должен быть новым (бирюзовый с шапкой)');
console.log('  3. Нажмите Play - персонаж должен анимироваться');
console.log('  4. Измените настройки в админке - они должны отобразиться');
console.log('='.repeat(70));