import { useState } from 'react';
import {
  Radio, LayoutDashboard, Calendar, Mic2, Headphones, Tag,
  LogOut, Menu, X, ChevronRight, Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { page: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { page: 'shows', label: 'Передачи', icon: Calendar },
  { page: 'hosts', label: 'Ведущие', icon: Mic2 },
  { page: 'podcasts', label: 'Подкасты', icon: Headphones },
  { page: 'categories', label: 'Категории', icon: Tag },
  { page: 'settings', label: 'Настройки', icon: Settings },
];

const pageLabels: Record<string, string> = {
  dashboard: 'Дашборд',
  shows: 'Передачи',
  hosts: 'Ведущие',
  podcasts: 'Подкасты',
  categories: 'Категории',
  settings: 'Настройки сайта',
};

export function AdminLayout({ children, onLogout, currentPage, onNavigate }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#27273a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Cosmos FM Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-[#27273a] 
          transform transition-transform lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="p-4 border-b border-[#27273a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">Cosmos FM</h2>
                <p className="text-xs text-[#71717a]">Админ панель</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${
                  currentPage === item.page
                    ? 'bg-[#6366f1]/20 text-[#6366f1]'
                    : 'text-[#a1a1aa] hover:bg-[#13131f] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#27273a]">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="p-4 lg:p-6 border-b border-[#27273a]">
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <span>Админ</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{pageLabels[currentPage] || 'Дашборд'}</span>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
