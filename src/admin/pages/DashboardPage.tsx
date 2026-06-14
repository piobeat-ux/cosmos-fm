import { Radio, Users, Headphones, Tag, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function DashboardPage() {
  const { shows, hosts, podcasts, categories } = useData();

  const stats = [
    { label: 'Передач', value: shows.length, icon: Calendar, color: 'from-[#6366f1] to-[#8b5cf6]' },
    { label: 'Ведущих', value: hosts.length, icon: Users, color: 'from-[#22c55e] to-[#14b8a6]' },
    { label: 'Подкастов', value: podcasts.length, icon: Headphones, color: 'from-[#f59e0b] to-[#f97316]' },
    { label: 'Категорий', value: categories.length, icon: Tag, color: 'from-[#ef4444] to-[#ec4899]' },
  ];

  const liveShows = shows.filter(s => s.is_live);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-[#71717a]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Быстрые действия</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => window.location.hash = '/admin/shows'} className="flex items-center gap-3 p-4 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#6366f1]/50 transition-colors text-left">
            <Calendar className="w-5 h-5 text-[#6366f1]" />
            <span>Добавить передачу</span>
          </button>
          <button onClick={() => window.location.hash = '/admin/hosts'} className="flex items-center gap-3 p-4 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#22c55e]/50 transition-colors text-left">
            <Users className="w-5 h-5 text-[#22c55e]" />
            <span>Добавить ведущего</span>
          </button>
          <button onClick={() => window.location.hash = '/admin/podcasts'} className="flex items-center gap-3 p-4 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#f59e0b]/50 transition-colors text-left">
            <Headphones className="w-5 h-5 text-[#f59e0b]" />
            <span>Добавить подкаст</span>
          </button>
        </div>
      </div>

      {/* Live Shows */}
      {liveShows.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-[#ef4444]" />
            <h2 className="text-lg font-bold">Сейчас в эфире</h2>
          </div>
          <div className="space-y-3">
            {liveShows.map(show => (
              <div key={show.id} className="flex items-center justify-between p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                <div>
                  <span className="font-medium">{show.title}</span>
                  <span className="text-sm text-[#71717a] ml-2">{show.host}</span>
                </div>
                <span className="px-2 py-1 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">LIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Последние передачи</h2>
          <div className="space-y-2">
            {shows.slice(0, 5).map(show => (
              <div key={show.id} className="flex items-center justify-between py-2 border-b border-[#27273a] last:border-0">
                <div>
                  <p className="font-medium">{show.title}</p>
                  <p className="text-xs text-[#71717a]">{show.time} • {show.day_of_week}</p>
                </div>
                <span className="text-xs text-[#6366f1]">{show.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Популярные подкасты</h2>
          <div className="space-y-2">
            {podcasts.sort((a, b) => b.likes - a.likes).slice(0, 5).map(podcast => (
              <div key={podcast.id} className="flex items-center justify-between py-2 border-b border-[#27273a] last:border-0">
                <div>
                  <p className="font-medium">{podcast.title}</p>
                  <p className="text-xs text-[#71717a]">{podcast.episodes} выпусков</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#ef4444]">
                  <TrendingUp className="w-3 h-3" />
                  {podcast.likes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
