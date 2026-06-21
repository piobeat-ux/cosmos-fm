import { Calendar, Users, Headphones, Tag, Plus } from 'lucide-react';
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

export function DashboardPage() {
  const { shows, hosts, podcasts, categories } = useData();

  const stats = [
    { label: 'Передач', value: shows.length, icon: Calendar, color: '#8B5CF6' },
    { label: 'Ведущих', value: hosts.length, icon: Users, color: '#22C55E' },
    { label: 'Подкастов', value: podcasts.length, icon: Headphones, color: '#F97316' },
    { label: 'Категорий', value: categories.length, icon: Tag, color: '#EC4899' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ color: COLORS.text }}>Дашборд</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-2xl p-6 shadow-lg" style={{ background: COLORS.white, border: `1px solid ${COLORS.neppy}20` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: stat.color + '20' }}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <span className="text-3xl font-bold" style={{ color: COLORS.text }}>{stat.value}</span>
              </div>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-6 shadow-lg mb-8" style={{ background: COLORS.white, border: `1px solid ${COLORS.neppy}20` }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-xl transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`, color: COLORS.white }}>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span className="font-bold">Добавить передачу</span>
            </div>
          </button>
          <button className="p-4 rounded-xl transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`, color: COLORS.white }}>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span className="font-bold">Добавить ведущего</span>
            </div>
          </button>
          <button className="p-4 rounded-xl transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`, color: COLORS.white }}>
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5" />
              <span className="font-bold">Добавить подкаст</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Shows & Popular Podcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-lg" style={{ background: COLORS.white, border: `1px solid ${COLORS.neppy}20` }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>Последние передачи</h2>
          <div className="space-y-3">
            {shows.slice(0, 5).map((show) => (
              <div key={show.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: COLORS.bg + '40' }}>
                <div>
                  <h3 className="font-bold" style={{ color: COLORS.text }}>{show.title}</h3>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>{show.time} • {show.day_of_week}</p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full" style={{ background: COLORS.neppy + '20', color: COLORS.purple }}>{show.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ background: COLORS.white, border: `1px solid ${COLORS.neppy}20` }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>Популярные подкасты</h2>
          <div className="space-y-3">
            {podcasts.slice(0, 5).map((podcast) => (
              <div key={podcast.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: COLORS.bg + '40' }}>
                <div>
                  <h3 className="font-bold" style={{ color: COLORS.text }}>{podcast.title}</h3>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>{podcast.episodes} выпусков</p>
                </div>
                <span className="text-sm" style={{ color: COLORS.green }}> {podcast.likes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
