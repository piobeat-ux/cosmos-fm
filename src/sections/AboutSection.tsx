import { Radio, Users, Globe, Award, Sparkles, Heart, Star } from 'lucide-react';
import { useData } from '@/context/DataContext';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function AboutSection() {
  const { settings, shows, hosts, podcasts } = useData();

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
          
          {/* HERO-БЛОК - ИЗ НАСТРОЕК АДМИНКИ */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in-up" style={{ background: COLORS.white + 'CC' }}>
              <Sparkles className="w-4 h-4" style={{ color: COLORS.purple }} />
              <span className="text-sm font-bold" style={{ color: COLORS.text }}>
                {settings.hero_title || 'Голос вашего отеля'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: COLORS.text }}>
              {settings.hero_subtitle || 'Звуки вашего космоса'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                {settings.hero_description || 'Первый в России корпоративный медиа-канал'}
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
                animationDelay: `${i * 100}ms` 
              }}>
                <span className="text-2xl font-bold" style={{ color: COLORS.text }}>{stat}</span>
              </div>
            ))}
          </div>

          {/* About Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>24/7 Вещание</h3>
              <p style={{ color: COLORS.textMuted }}>Непрерывное вещание профессионального контента для гостей и сотрудников отелей</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>4000+ Сотрудников</h3>
              <p style={{ color: COLORS.textMuted }}>Объединяем команды лучших отелей по всей России и миру</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>2.5M Гостей</h3>
              <p style={{ color: COLORS.textMuted }}>Ежегодный охват гостей сети отелей Cosmos</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Премиум Контент</h3>
              <p style={{ color: COLORS.textMuted }}>Эксклюзивные подкасты, интервью и музыкальные программы</p>
            </div>
          </div>

          {/* CTA Block */}
          <div className="rounded-3xl p-8 shadow-xl border-2 text-center" style={{ background: COLORS.white, borderColor: 'transparent' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.text }}>Присоединяйтесь к нам!</h3>
            <p className="mb-6" style={{ color: COLORS.textMuted }}>Слушайте Cosmos FM в лучших отелях сети</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                Москва
              </div>
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                Санкт-Петербург
              </div>
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
                Сочи
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-12 text-center">
            <p className="flex items-center justify-center gap-2 text-sm" style={{ color: COLORS.textMuted }}>
              Сделано с <Heart className="w-4 h-4" style={{ color: '#EF4444' }} /> для сети отелей Cosmos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
