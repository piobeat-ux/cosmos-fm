import fs from 'fs';

console.log('🔧 === ДИНАМИЧЕСКИЙ КОНТЕЙНЕР С КНОПКОЙ PLAY ===\n');

// ==========================================
// 1. НОВЫЙ NEPPYCHARACTER - ДИНАМИЧЕСКИЙ
// ==========================================
console.log('1/3 Создание динамического NeppyCharacter...');

const neppyCharacterContent = `import { useState, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

const COLORS = {
  neppy: '#28B9D0',
  purple: '#685096',
  white: '#FFFFFF',
};

export function NeppyCharacter({ isPlaying, onPlayClick, neppyImage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Сброс состояния при изменении изображения
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [neppyImage]);

  // Если есть изображение из админки - показываем его
  if (neppyImage && neppyImage.trim() !== '' && !imageError) {
    return (
      <div 
        className="relative cursor-pointer transition-transform duration-500"
        style={{ 
          transform: isPlaying ? 'scale(1.05)' : isHovered ? 'scale(1.02)' : 'scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
          {/* Изображение из админки */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl" style={{
            boxShadow: isPlaying ? \`0 0 60px \${COLORS.neppy}80\` : \`0 20px 60px rgba(0,0,0,0.3)\`
          }}>
            <img 
              src={neppyImage} 
              alt="Cosmos FM" 
              className="w-full h-full object-cover"
              style={{ 
                transition: 'transform 0.5s ease',
                transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
              }}
              onLoad={() => {
                console.log('✅ Image loaded:', neppyImage);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error('❌ Image load failed:', neppyImage);
                setImageError(true);
              }}
            />
            
            {/* Градиент оверлей при наведении */}
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{ 
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                opacity: isHovered ? 1 : 0.5
              }}
            />
          </div>
          
          {/* Кнопка Play/Pause по центру */}
          <button 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-20"
            style={{ 
              background: COLORS.white + 'F0', 
              boxShadow: \`0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px \${COLORS.white}40\`,
              transform: 'translate(-50%, -50%)' + (isHovered ? ' scale(1.1)' : ' scale(1)')
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

          {/* Индикатор загрузки */}
          {!imageLoaded && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.white }} />
            </div>
          )}

          {/* Пульсирующее кольцо при воспроизведении */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-3xl pointer-events-none">
              <div 
                className="absolute inset-0 rounded-3xl animate-ping"
                style={{ 
                  border: \`3px solid \${COLORS.neppy}\`,
                  opacity: 0.5
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Дефолтный SVG персонаж (если изображение не загружено)
  return (
    <div 
      className="relative cursor-pointer transition-transform duration-500"
      style={{ 
        transform: isPlaying ? 'scale(1.05)' : isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
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
          <ellipse cx="170" cy="220" rx="8" ry="12" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="230" cy="240" rx="6" ry="10" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="190" cy="260" rx="7" ry="11" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="220" cy="280" rx="8" ry="12" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="180" cy="300" rx="6" ry="10" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="210" cy="320" rx="7" ry="11" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="240" cy="260" rx="6" ry="10" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="160" cy="280" rx="8" ry="12" fill="#AFCB31" opacity="0.7" />
          
          {/* Левая рука */}
          <path 
            d="M 120 250 Q 80 280 70 350 Q 65 380 80 400 Q 90 410 100 400 Q 110 390 115 370 Q 120 340 130 300" 
            fill={COLORS.neppy}
            stroke="#1FA8C0"
            strokeWidth="2"
          />
          
          {/* Правая рука */}
          <path 
            d="M 280 250 Q 320 280 330 350 Q 335 380 320 400 Q 310 410 300 400 Q 290 390 285 370 Q 280 340 270 300" 
            fill={COLORS.neppy}
            stroke="#1FA8C0"
            strokeWidth="2"
          />
          
          {/* Левая нога */}
          <ellipse cx="170" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          <ellipse cx="165" cy="430" rx="15" ry="10" fill="#1FA8C0" />
          
          {/* Правая нога */}
          <ellipse cx="230" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          <ellipse cx="235" cy="430" rx="15" ry="10" fill="#1FA8C0" />
          
          {/* Шапка */}
          <path 
            d="M 140 180 Q 140 140 200 140 Q 260 140 260 180 L 260 200 Q 260 210 250 210 L 150 210 Q 140 210 140 200 Z" 
            fill={COLORS.purple}
          />
          <rect x="140" y="195" width="120" height="15" fill="#553D80" rx="5" />
          
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
          <circle cx="178" cy="242" r="8" fill="#1A2B3C" />
          <circle cx="228" cy="242" r="8" fill="#1A2B3C" />
          
          {/* Блики в глазах */}
          <circle cx="180" cy="238" r="3" fill={COLORS.white} />
          <circle cx="230" cy="238" r="3" fill={COLORS.white} />
          
          {/* Улыбка */}
          <path 
            d="M 190 270 Q 200 280 210 270" 
            fill="none" 
            stroke="#1A2B3C" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>
        
        {/* Кнопка Play/Pause по центру */}
        <button 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-20"
          style={{ 
            background: COLORS.white + 'F0', 
            boxShadow: \`0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px \${COLORS.white}40\`,
            transform: 'translate(-50%, -50%)' + (isHovered ? ' scale(1.1)' : ' scale(1)')
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

        {/* Пульсирующее кольцо при воспроизведении */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div 
              className="absolute inset-0 rounded-3xl animate-ping"
              style={{ 
                border: \`3px solid \${COLORS.neppy}\`,
                opacity: 0.5
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/NeppyCharacter.tsx', neppyCharacterContent);
console.log('✅ NeppyCharacter.tsx - динамический контейнер создан');

// ==========================================
// 2. HOMESECTION - ПРОВЕРКА
// ==========================================
console.log('2/3 Проверка HomeSection.tsx...');

const homePath = 'src/sections/HomeSection.tsx';
if (fs.existsSync(homePath)) {
  let content = fs.readFileSync(homePath, 'utf-8');
  
  if (content.includes('NeppyCharacter') && content.includes('neppyImage={settings.neppy_image}')) {
    console.log('✅ HomeSection правильно использует NeppyCharacter');
  } else {
    console.log('⚠️  HomeSection требует обновления');
  }
}

// ==========================================
// 3. DATACONTEXT - ПРОВЕРКА РЕАКТИВНОСТИ
// ==========================================
console.log('3/3 Проверка DataContext.tsx...');

const dataContextPath = 'src/context/DataContext.tsx';
if (fs.existsSync(dataContextPath)) {
  let content = fs.readFileSync(dataContextPath, 'utf-8');
  
  if (content.includes('version') && content.includes('setVersion')) {
    console.log('✅ DataContext имеет реактивность');
  } else {
    console.log('⚠️  DataContext требует обновления');
  }
}

console.log('\n' + '='.repeat(70));
console.log('✅ ДИНАМИЧЕСКИЙ КОНТЕЙНЕР СОЗДАН!');
console.log('='.repeat(70));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  1. ✅ Динамический контейнер для изображения из админки');
console.log('  2. ✅ Кнопка Play/Pause поверх изображения');
console.log('  3. ✅ Анимация при воспроизведении (scale + pulse)');
console.log('  4. ✅ Hover эффекты');
console.log('  5. ✅ Индикатор загрузки изображения');
console.log('  6. ✅ Fallback на SVG персонажа если изображение не загружено');
console.log('  7. ✅ Обработка ошибок загрузки');
console.log('\n🎯 КАК ЭТО РАБОТАЕТ:');
console.log('  1. Загрузите изображение в админке (Настройки → neppy_image)');
console.log('  2. Изображение автоматически появится на главной странице');
console.log('  3. Кнопка Play будет поверх изображения');
console.log('  4. При нажатии Play - изображение масштабируется + пульсация');
console.log('  5. Если изображение не загружено - показывается SVG персонаж');
console.log('\n ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('='.repeat(70));