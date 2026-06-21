import { useState, useEffect } from 'react';
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
  const [currentImage, setCurrentImage] = useState('');

  // Отслеживаем изменения neppyImage
  useEffect(() => {
    console.log('️ NeppyImage changed:', neppyImage);
    setImageLoaded(false);
    setImageError(false);
    
    if (neppyImage && neppyImage.trim() !== '') {
      setCurrentImage(neppyImage);
      console.log('✅ Image URL set:', neppyImage);
    } else {
      setCurrentImage('');
      console.log('⚠️ No image URL');
    }
  }, [neppyImage]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully');
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error('❌ Image load failed:', currentImage);
    setImageError(true);
    setImageLoaded(false);
  };

  // Если есть изображение из админки - показываем его
  if (currentImage && !imageError) {
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
          {/* Контейнер с изображением */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl" style={{
            boxShadow: isPlaying ? `0 0 60px ${COLORS.neppy}80` : `0 20px 60px rgba(0,0,0,0.3)`
          }}>
            <img 
              src={currentImage}
              alt="Cosmos FM" 
              className="w-full h-full object-cover"
              style={{ 
                transition: 'transform 0.5s ease',
                transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
            
            {/* Градиент оверлей */}
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{ 
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                opacity: isHovered ? 1 : 0.5
              }}
            />
          </div>
          
          {/* Индикатор загрузки */}
          {!imageLoaded && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.white }} />
            </div>
          )}

          {/* Кнопка Play/Pause по центру */}
          <button 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-20"
            style={{ 
              background: COLORS.white + 'F0', 
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px ${COLORS.white}40`,
            }}
            onClick={(e) => { 
              e.stopPropagation(); 
              e.preventDefault();
              console.log(' Play button clicked');
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
                  border: `3px solid ${COLORS.neppy}`,
                  opacity: 0.5
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Дефолтный SVG персонаж
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
          <ellipse cx="200" cy="280" rx="100" ry="140" fill={COLORS.neppy} />
          
          {/* Зеленые пятна */}
          <ellipse cx="170" cy="220" rx="8" ry="12" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="230" cy="240" rx="6" ry="10" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="190" cy="260" rx="7" ry="11" fill="#AFCB31" opacity="0.7" />
          <ellipse cx="220" cy="280" rx="8" ry="12" fill="#AFCB31" opacity="0.7" />
          
          {/* Руки */}
          <path d="M 120 250 Q 80 280 70 350 Q 65 380 80 400 Q 90 410 100 400 Q 110 390 115 370 Q 120 340 130 300" fill={COLORS.neppy} />
          <path d="M 280 250 Q 320 280 330 350 Q 335 380 320 400 Q 310 410 300 400 Q 290 390 285 370 Q 280 340 270 300" fill={COLORS.neppy} />
          
          {/* Ноги */}
          <ellipse cx="170" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          <ellipse cx="230" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
          
          {/* Шапка */}
          <path d="M 140 180 Q 140 140 200 140 Q 260 140 260 180 L 260 200 Q 260 210 250 210 L 150 210 Q 140 210 140 200 Z" fill={COLORS.purple} />
          <circle cx="200" cy="130" r="25" fill={COLORS.white} />
          
          {/* Глаза */}
          <circle cx="175" cy="240" r="18" fill={COLORS.white} />
          <circle cx="225" cy="240" r="18" fill={COLORS.white} />
          <circle cx="178" cy="242" r="8" fill="#1A2B3C" />
          <circle cx="228" cy="242" r="8" fill="#1A2B3C" />
          
          {/* Улыбка */}
          <path d="M 190 270 Q 200 280 210 270" fill="none" stroke="#1A2B3C" strokeWidth="3" strokeLinecap="round" />
        </svg>
        
        {/* Кнопка Play/Pause */}
        <button 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-20"
          style={{ 
            background: COLORS.white + 'F0', 
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px ${COLORS.white}40`,
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault();
            console.log(' Play button clicked');
            onPlayClick(); 
          }}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10" style={{ color: COLORS.purple }} />
          ) : (
            <Play className="w-10 h-10 ml-1" style={{ color: COLORS.purple }} />
          )}
        </button>

        {isPlaying && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute inset-0 rounded-3xl animate-ping" style={{ border: `3px solid ${COLORS.neppy}`, opacity: 0.5 }} />
          </div>
        )}
      </div>
    </div>
  );
}
