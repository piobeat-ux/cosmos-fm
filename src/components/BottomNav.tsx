import { Radio, Headphones, Users, Calendar, Info } from 'lucide-react';

const COLORS = {
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

const navItems = [
  { id: 'home', label: 'Эфир', icon: Radio },
  { id: 'podcasts', label: 'Подкасты', icon: Headphones },
  { id: 'hosts', label: 'Ведущие', icon: Users },
  { id: 'schedule', label: 'Расписание', icon: Calendar },
  { id: 'about', label: 'О нас', icon: Info },
];

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={{ 
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(40, 185, 208, 0.3)',
      boxShadow: '0 -4px 20px rgba(104, 80, 150, 0.15)'
    }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
              style={isActive 
                ? { 
                    background: 'linear-gradient(135deg, #28B9D0, #685096)',
                    color: '#FFFFFF'
                  }
                : { 
                    background: 'transparent',
                    color: '#4A6578'
                  }
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
