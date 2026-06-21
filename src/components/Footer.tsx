import { Radio, Heart } from 'lucide-react';
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

export function Footer() {
  const { settings } = useData();

  return (
    <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.white + 'F0', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` 
              }}>
                <Radio className="w-5 h-5" style={{ color: COLORS.white }} />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text" style={{ 
                backgroundImage: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.neppy})`
              }}>
                {settings.site_title || 'Cosmos FM'}
              </span>
            </div>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4" style={{ color: COLORS.text }}>Навигация</h3>
            <ul className="space-y-2">
              <li><a href="#/" className="text-sm hover:underline" style={{ color: COLORS.textMuted }}>Эфир</a></li>
              <li><a href="#/schedule" className="text-sm hover:underline" style={{ color: COLORS.textMuted }}>Расписание</a></li>
              <li><a href="#/hosts" className="text-sm hover:underline" style={{ color: COLORS.textMuted }}>Ведущие</a></li>
              <li><a href="#/podcasts" className="text-sm hover:underline" style={{ color: COLORS.textMuted }}>Подкасты</a></li>
              <li><a href="#/about" className="text-sm hover:underline" style={{ color: COLORS.textMuted }}>О нас</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4" style={{ color: COLORS.text }}>Контакты</h3>
            <ul className="space-y-2 text-sm" style={{ color: COLORS.textMuted }}>
              <li> info@cosmosfm.ru</li>
              <li>📱 +7 (800) 555-35-35</li>
              <li>📍 Москва, Россия</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t" style={{ borderColor: COLORS.neppy + '30' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              © 2024 {settings.site_title || 'Cosmos FM'}. Все права защищены.
            </p>
            <p className="text-sm flex items-center gap-1" style={{ color: COLORS.textMuted }}>
              Сделано с <Heart className="w-4 h-4" style={{ color: '#EF4444' }} /> в России
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
