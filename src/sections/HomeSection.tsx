import { useState, useEffect } from 'react';
import { Radio, Music, Mic, Play, Pause, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

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
  const { shows, settings, version } = useData();
  const { playLiveStream, playTrack, isPlaying, isLoading } = useAudio();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultCharacterUrl = 'https://ozchhkjsrstdnowutsow.supabase.co/storage/v1/object/public/media/1-Photoroom.png';
  const neppyImageUrl = settings?.neppy_image || defaultCharacterUrl;
  
  useEffect(() => {
    console.log('🎨 Settings changed:', settings);
    console.log('🖼️ Neppy image URL:', neppyImageUrl);
    setImageLoaded(false);
    setImageError(false);
  }, [neppyImageUrl, version]);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
    console.log('▶️ Play clicked, isPlaying:', isPlaying);
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id,
        title: liveShow.title,
        artist: liveShow.host_name,
        audio_url: liveShow.audio_url,
        isLive: true,
        type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, settings.site_title || 'Cosmos FM');
    }
  };

  const hasValidImage = neppyImageUrl && neppyImageUrl.trim() !== '' && !imageError;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: COLORS.bg }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      {/* Main Content - Flex Column */}
      <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Character Container - ADAPTIVE SIZE, fills space between header and cards */}
          <div className="flex-1 flex items-center justify-center mb-8 min-h-[40vh] max-h-[60vh]">
            <div className="relative w-full h-full max-w-[600px] max-h-[500px] flex items-center justify-center">
              
              {/* Speech Bubble - positioned above character */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-xl z-40" style={{ background: COLORS.white }}>
                <p className="text-2xl font-extrabold" style={{ color: COLORS.purple }}>ПРИВЕТ! Я НЭППИ</p>
              </div>

              {/* Character Image - LARGE and ADAPTIVE */}
              {hasValidImage ? (
                <img 
                  key={neppyImageUrl + version}
                  src={neppyImageUrl}
                  alt="Neppy Character" 
                  className="w-full h-full object-contain"
                  style={{
                    animation: isPlaying ? 'bounceCharacter 0.5s ease-in-out infinite' : 'none',
                    transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                    filter: isPlaying ? 'drop-shadow(0 0 40px rgba(40, 185, 208, 0.6))' : 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
                    marginTop: '60px' // Space for speech bubble
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully!');
                    setImageLoaded(true);
                    setImageError(false);
                  }}
                  onError={(e) => {
                    console.error('❌ Image load failed:', neppyImageUrl);
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                /* Fallback */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: COLORS.purple }} />
                    <p style={{ color: COLORS.text, fontSize: '1.25rem' }}>Загрузка персонажа...</p>
                  </div>
                </div>
              )}

              {/* Play/Pause Button - Centered on character */}
              <button 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-30"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  marginTop: '30px'
                }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  console.log('🎯 Button clicked');
                  handlePlayClick(); 
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-14 h-14 animate-spin" style={{ color: COLORS.purple }} />
                ) : isPlaying ? (
                  <Pause className="w-14 h-14" style={{ color: COLORS.purple }} />
                ) : (
                  <Play className="w-14 h-14 ml-1" style={{ color: COLORS.purple }} />
                )}
              </button>
            </div>
          </div>

          {/* Cards - HORIZONTAL LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-auto">
            <button 
              onClick={() => onTabChange && onTabChange('home')} 
              className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
              style={{ background: COLORS.white, borderColor: 'transparent' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
              <p style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
            </button>

            <button 
              onClick={() => onTabChange && onTabChange('podcasts')} 
              className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
              style={{ background: COLORS.white, borderColor: 'transparent' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                <Music className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
              <p style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
            </button>

            <button 
              onClick={() => onTabChange && onTabChange('hosts')} 
              className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
              style={{ background: COLORS.white, borderColor: 'transparent' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
              <p style={{ color: COLORS.textMuted }}>Таланты отелей</p>
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounceCharacter {
          0%, 100% {
            transform: translateY(0) scale(1.05);
          }
          50% {
            transform: translateY(-20px) scale(1.08);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(30px) rotate(240deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
