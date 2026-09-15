import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';
import { supabase } from '@/lib/supabase';
import { resolveAudio } from '@/lib/media';
import type { Airing } from '@/lib/schedule';

const stationDate = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', weekday: 'short', day: 'numeric', month: 'long' });
const stationTime = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });

export function ScheduleSection() {
  const { shows: allShows } = useData();
  const { playRecording, currentTrack, isPlaying } = useAudio();
  const shows = allShows.filter(row => row.published !== false && (row.catalog_mode !== 'after_airing' || (row.catalog_visible_at && Date.parse(row.catalog_visible_at) <= Date.now())));
  const [airings, setAirings] = useState<Airing[]>([]);
  const [error, setError] = useState('');
  const [week, setWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const start = new Date(Date.now() + week * 7 * 86400000);
    const end = new Date(start.getTime() + 7 * 86400000);
    void Promise.resolve(supabase.rpc('get_schedule', { window_start: start.toISOString(), window_end: end.toISOString() }).abortSignal(controller.signal)).then(result => {
      if (controller.signal.aborted) return;
      if (result.error || !Array.isArray(result.data)) throw new Error('Не удалось загрузить расписание.');
      setAirings(result.data as Airing[]);
    }).catch(() => { if (!controller.signal.aborted) setError('Не удалось загрузить расписание. Попробуйте позже.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [week]);

  return <main className="min-h-screen pt-32 pb-28 px-4 sm:px-6 lg:px-8 bg-[#E0F4F8]">
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="space-y-5">
        <h1 className="text-4xl font-extrabold text-[#2D3748]">Расписание эфиров</h1>
        <div className="flex flex-wrap justify-between gap-3"><p className="text-[#4A6578]">Ближайшие 7 дней · Московское время</p><div className="flex gap-4"><button disabled={week <= 0} onClick={() => setWeek(value => value - 1)} className="text-[#685096] underline disabled:opacity-30">Раньше</button><button onClick={() => setWeek(value => value + 1)} className="text-[#685096] underline">Позже</button></div></div>
        {loading ? <p role="status">Загружаем расписание…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : airings.length ? <div className="space-y-3">{airings.map(airing => <article key={`${airing.schedule_id}:${airing.starts_at}`} className="rounded-2xl bg-white p-5 flex flex-wrap items-center gap-4">
          <div className="min-w-44 text-sm text-[#4A6578]"><p>{stationDate.format(new Date(airing.starts_at))}</p><p className="font-bold text-[#685096]">{stationTime.format(new Date(airing.starts_at))}–{stationTime.format(new Date(airing.ends_at))}</p></div>
          <div><h2 className="font-bold text-lg">{airing.title}</h2><p className="text-sm text-[#4A6578]">{airing.kind === 'show' ? 'Передача' : 'Подкаст'}</p></div>
        </article>)}</div> : <p className="rounded-2xl bg-white p-6 text-[#4A6578]">На этот период передачи не назначены. В эфире — основной радиопоток.</p>}
      </section>
      <section className="space-y-5">
        <h2 className="text-3xl font-bold">Записи передач</h2>
        {!shows.length && <p className="text-[#4A6578]">После эфира записи появятся здесь.</p>}
        <div className="grid gap-5 sm:grid-cols-2">{shows.map(show => <article key={show.id} className="rounded-2xl bg-white p-5 space-y-3">
          {show.cover_url && <img src={show.cover_url} alt="" className="h-40 w-full rounded-xl object-cover" />}
          <h3 className="text-xl font-bold">{show.title}</h3><p className="text-[#4A6578]">{show.description}</p><p className="text-sm">{show.host_name} {show.duration && `· ${show.duration}`}</p>
          <button onClick={() => playRecording({ id: show.id, title: show.title, artist: show.host_name, audio_url: show.audio_url || '', isLive: false, type: 'show' }, () => show.asset_id ? resolveAudio(show.asset_id) : Promise.resolve(show.audio_url || ''))} className="btn-primary">{isPlaying && currentTrack?.id === show.id ? 'Пауза' : 'Слушать запись'}</button>
        </article>)}</div>
      </section>
    </div>
  </main>;
}
