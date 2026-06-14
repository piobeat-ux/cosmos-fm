import { Radio, LayoutDashboard, Radio as RadioIcon, Users, Music, Tags, Settings, Building2, Link2, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'shows', label: 'Передачи', icon: RadioIcon },
  { id: 'hosts', label: 'Ведущие', icon: Users },
  { id: 'podcasts', label: 'Подкасты', icon: Music },
  { id: 'categories', label: 'Категории', icon: Tags },
  { id: 'hotels', label: 'Отели', icon: Building2 },
  { id: 'navigation', label: 'Навигация', icon: Link2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminLayout({ children, onLogout, currentPage, onNavigate }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <aside className="w-64 bg-[#13131f] border-r border-[#27273a] flex flex-col fixed h-full">
        <div className="p-6 border-b border-[#27273a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Cosmos FM</h1>
              <p className="text-xs text-[#71717a]">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                  isActive
                    ? 'bg-[#6366f1] text-white'
                    : 'text-[#a1a1aa] hover:bg-[#1e1e2e] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#27273a]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}