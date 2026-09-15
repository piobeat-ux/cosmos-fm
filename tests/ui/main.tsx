import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarPage } from '@/admin/pages/CalendarPage';
import { MediaLibraryPage } from '@/admin/pages/MediaLibraryPage';
import { FixtureData } from './data';
import '@/index.css';

function Harness() {
  const [route, setRoute] = useState(location.hash);
  useEffect(() => { const change = () => setRoute(location.hash); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  return <main className="p-4 sm:p-8 max-w-7xl mx-auto">
    <p role="status" className="mb-4 rounded bg-amber-100 p-3">Тестовый стенд: временная база, без подключения к рабочему Supabase. Файловое хранилище не имитируется.</p>
    <nav className="flex gap-5 mb-6"><a href="#/admin/calendar">Календарь</a><a href="#/admin/shows">Передачи</a><a href="#/admin/podcasts">Подкасты</a></nav>
    <FixtureData>{route.includes('shows') ? <MediaLibraryPage key="shows" kind="show" /> : route.includes('podcasts') ? <MediaLibraryPage key="podcasts" kind="podcast" /> : <CalendarPage />}</FixtureData>
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Harness /></React.StrictMode>);
