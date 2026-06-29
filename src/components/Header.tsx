import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export function Header({ onTabChange, activeTab }) {
  const { navigation } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = navigation && navigation.length > 0
    ? navigation.map(link => ({
        id: link.url ? link.url.replace('#/', '').replace('#', '') || 'home' : 'home',
        label: link.label || 'Item',
      }))
    : [
        { id: 'home', label: 'Home' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'hosts', label: 'Hosts' },
        { id: 'podcasts', label: 'Podcasts' },
        { id: 'about', label: 'About' },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg bg-white">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#28B9D0] to-[#685096] flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A2B3C]">Cosmos FM</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 rounded-xl p-1 bg-[#B6E0EE60]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' 
                  : 'text-[#1A2B3C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-[#4A6578]">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#4A6578] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#AFCB31]" />
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-[#1A2B3C]" /> : <Menu className="text-[#1A2B3C]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-bold ${
                activeTab === item.id ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' : 'text-[#1A2B3C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
