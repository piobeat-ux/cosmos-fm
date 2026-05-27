import { Link, useLocation } from 'react-router-dom';

export function TabBar() {
  const { pathname } = useLocation();
  const tabs = [
    { path: '/', icon: '📻', label: 'Эфир' },
    { path: '/shows', icon: '📺', label: 'Передачи' },
    { path: '/podcasts', icon: '🎧', label: 'Подкасты' },
    { path: '/hosts', icon: '👤', label: 'Ведущие' },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(t => (
        <Link key={t.path} to={t.path} className={pathname === t.path ? 'active' : ''}>
          <span>{t.icon}</span>
          <small>{t.label}</small>
        </Link>
      ))}
    </nav>
  );
}
