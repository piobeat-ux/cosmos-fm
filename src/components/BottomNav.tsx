import { Radio, Calendar, Users, Headphones, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ICONS: Record<string, any> = {
  home: Radio,
  schedule: Calendar,
  hosts: Users,
  podcasts: Headphones,
  about: Info,
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { navigationLinks } = useData();

  const navItems = navigationLinks.length > 0
    ? navigationLinks.slice(0, 5).map(link => {
        const id = link.url.replace('#/', '').replace('#', '') || 'home';
        return { id, label: link.label, icon: ICONS[id] || Radio };
      })
    : [
        { id: 'home', label: 'Эфир', icon: Radio },
        { id: 'schedule', label: 'Расписание', icon: Calendar },
        { id: 'hosts', label: 'Ведущие', icon: Users },
        { id: 'podcasts', label: 'Подкасты', icon: Headphones },
        { id: 'about', label: 'О нас', icon: Info },
      ];

  return (
    <nav className="fixed bottom-20 left-0 right-0 z-40 glass-player md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}