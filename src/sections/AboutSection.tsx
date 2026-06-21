import { useData } from '@/context/DataContext';
import { Users, Radio, Headphones, Star } from 'lucide-react';

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
  const { settings } = useData();

  const stats = [
    { icon: Radio, value: '24/7', label: settings.about_stat1_label || 'Непрерывное вещание профессионального контента для гостей' },
    { icon: Users, value: '4000+', label: settings.about_stat2_label || 'Объединяем команды лучших отелей по всей России и миру' },
    { icon: Star, value: '2.5M', label: settings.about_stat3_label || 'Ежегодный охват гостей сети отелей Cosmos' },
    { icon: Headphones, value: '100+', label: settings.about_stat4_label || 'Эксклюзивные подкасты, интервью и музыкальные программы' },
  ];

  const cities = (settings.about_cities || 'Москва • Санкт-Петербург • Сочи').split('•').map(c => c.trim());

  return (
    <div className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12" style={{ color: COLORS.text }}>
          {settings.about_title || 'О Cosmos FM'}
        </h1>

        <div className="text-center mb-16">
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: COLORS.textMuted }}>
            {settings.about_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-3xl p-8 shadow-xl text-center" style={{ background: COLORS.white }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>{stat.value}</div>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Cities */}
        <div className="rounded-3xl p-8 shadow-xl mb-12" style={{ background: COLORS.white }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: COLORS.text }}>
            {settings.about_cities_title || 'Присоединяйтесь к нам! Слушайте Cosmos FM в лучших отелях сети'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {cities.map((city, i) => (
              <div key={i} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
