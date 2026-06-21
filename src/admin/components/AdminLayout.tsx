import { Radio, LayoutDashboard, Radio as RadioIcon, Users, Music, Tag, Building2, Link, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  border: '#28B9D040',
};

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'shows', label: 'Передачи', icon: RadioIcon },
  { id: 'hosts', label: 'Ведущие', icon: Users },
  { id: 'podcasts', label: 'Подкасты', icon: Music },
  { id: 'categories', label: 'Категории', icon: Tag },
  { id: 'hotels', label: 'Отели', icon: Building2 },
  { id: 'navigation', label: 'Навигация', icon: Link },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminLayout({ children, onLogout, currentPage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: COLORS.bg }}>
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`} style={{ background: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}` }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` }}>
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: COLORS.text }}>Cosmos FM</h1>
              <p className="text-xs" style={{ color: COLORS.textMuted }}>Админ-панель</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'font-bold' : ''}`}
                  style={isActive 
                    ? { background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`, color: COLORS.white }
                    : { background: 'transparent', color: COLORS.text }
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
            style={{ background: '#EF444420', color: '#EF4444' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: COLORS.sidebar + 'F0', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${COLORS.border}` }}>
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X style={{ color: COLORS.text }} /> : <Menu style={{ color: COLORS.text }} />}
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: COLORS.textMuted }}>Администратор</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
