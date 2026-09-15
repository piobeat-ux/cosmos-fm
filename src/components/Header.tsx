import { Radio, Menu, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';
import { navigationTarget } from '@/lib/content-validation';

export function Header({ onTabChange, activeTab }: { onTabChange: (tab: string) => void; activeTab: string }) {
  const { navigation } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = navigation.filter(link => link.is_active).flatMap(link => {
    const target = navigationTarget(link.url);
    return target ? [{ id: link.id, label: link.label, ...target }] : [];
  });
  const links = (mobile: boolean) => navItems.map(item => {
    const className = `${mobile ? 'block w-full text-left mb-1' : ''} px-4 py-3 rounded-lg text-sm font-bold ${activeTab === item.tab ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' : 'text-[#1A2B3C]'}`;
    return item.href ? <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
      : <button key={item.id} onClick={() => { onTabChange(item.tab!); setMobileMenuOpen(false); }} className={className}>{item.label}</button>;
  });
  return <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3">
    <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg bg-white">
      <button onClick={() => onTabChange('home')} className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#28B9D0] to-[#685096] flex items-center justify-center"><Radio className="w-5 h-5 text-white" /></span><span className="text-xl font-bold text-[#1A2B3C]">Cosmos FM</span></button>
      <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-1 rounded-xl p-1 bg-[#B6E0EE60]">{links(false)}</nav>
      <button aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={mobileMenuOpen} className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
    </div>
    {mobileMenuOpen && <nav aria-label="Мобильная навигация" className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">{links(true)}</nav>}
  </header>;
}
