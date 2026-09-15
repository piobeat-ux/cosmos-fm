import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { supabase } from '@/lib/supabase';
import { useData } from '@/context/DataContext';
import { AdminDialog } from '@/admin/components/AdminDialog';
import { expandSchedule, stationInput, stationIso, type BroadcastSchedule } from '@/lib/schedule';

const MSK = 3 * 3600000;
const emptyForm = () => ({ media: '', starts_at: stationInput(new Date(Date.now() + 3600000).toISOString()), weekly: false, repeat_until: '', published: false });

export function CalendarPage() {
  const { shows, podcasts, refresh } = useData();
  const [entries, setEntries] = useState<BroadcastSchedule[]>([]);
  const [range, setRange] = useState({ start: new Date(), end: new Date(Date.now() + 7 * 86400000) });
  const [editing, setEditing] = useState<BroadcastSchedule | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const loadGeneration = useRef(0);
  const records = [...shows.map(row => ({ ...row, kind: 'show' as const })), ...podcasts.map(row => ({ ...row, kind: 'podcast' as const }))];

  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    const all: BroadcastSchedule[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error: queryError } = await supabase.from('broadcast_schedule').select('*').order('starts_at').order('id').range(offset, offset + 499);
      if (generation !== loadGeneration.current) return;
      if (queryError) throw new Error('Не удалось загрузить календарь. Повторите попытку.');
      all.push(...data as BroadcastSchedule[]);
      if (data.length < 500) break;
    }
    setEntries(all); setLoaded(true);
  }, []);
  const cancelLoad = useCallback(() => { loadGeneration.current++; }, []);
  useEffect(() => { void load().catch(cause => setError(cause.message)); return cancelLoad; }, [load, cancelLoad]);

  const edit = (entry: BroadcastSchedule) => {
    if (busy) return;
    setEditing(entry);
    setForm({ media: `${entry.show_id ? 'show' : 'podcast'}:${entry.show_id || entry.podcast_id}`, starts_at: stationInput(entry.starts_at), weekly: entry.weekly, repeat_until: entry.repeat_until ? stationInput(entry.repeat_until) : '', published: entry.published });
    setError(''); setOpen(true);
  };

  const save = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const [kind, id] = form.media.split(':');
      const record = records.find(row => row.id === id && row.kind === kind);
      if (!record?.asset_id) throw new Error('Выберите запись с проверенным MP3. Аудио можно добавить в разделе передач или подкастов.');
      const payload = { show_id: kind === 'show' ? id : null, podcast_id: kind === 'podcast' ? id : null, starts_at: stationIso(form.starts_at), weekly: form.weekly, repeat_until: form.weekly && form.repeat_until ? stationIso(form.repeat_until) : null, published: form.published, duration_seconds: 1 };
      const query = editing ? supabase.from('broadcast_schedule').update(payload).eq('id', editing.id) : supabase.from('broadcast_schedule').insert(payload);
      const { error: saveError, data } = await query.select('id');
      if (saveError) throw new Error(saveError.message);
      if (!data?.length) throw new Error('Запись расписания уже удалена. Обновите календарь.');
      setOpen(false); await Promise.all([load(), refresh()]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось сохранить эфир.'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!editing || busy || !confirm(editing.weekly ? 'Удалить всю серию повторов из расписания?' : 'Удалить эфир из расписания?')) return;
    setBusy(true); setError('');
    try {
      const { error: deleteError, data } = await supabase.from('broadcast_schedule').delete().eq('id', editing.id).select('id');
      if (deleteError) throw deleteError;
      if (!data?.length) throw new Error('Эфир уже удалён или недоступен.');
      setOpen(false); await Promise.all([load(), refresh()]);
    } catch { setError('Не удалось удалить эфир.'); }
    finally { setBusy(false); }
  };

  const events = entries.flatMap(entry => {
    const record = records.find(row => row.id === (entry.show_id || entry.podcast_id));
    return expandSchedule(entry, range.start, range.end).map(event => ({
      ...event, title: `${entry.published ? '' : 'Черновик · '}${record?.title || 'Запись'}${entry.weekly ? ' ↻' : ''}`,
      // FullCalendar's UTC display carries Moscow wall time, regardless of editor timezone.
      start: new Date(event.start.getTime() + MSK), end: new Date(event.end.getTime() + MSK),
      backgroundColor: entry.published ? '#685096' : '#64748b', borderColor: 'transparent',
      extendedProps: { scheduleId: entry.id, offset: event.offset },
    }));
  });

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Календарь эфиров</h1><button id="open-airing-dialog" className="btn-primary" disabled={busy} onClick={() => { setEditing(null); setForm(emptyForm()); setError(''); setOpen(true); }}>Добавить эфир</button></div>
    <p className="text-sm text-[#4A6578]">Время московское (UTC+03:00). Нажмите на день или перетащите эфир на другое время. Длительность определяется по MP3. Перенос повторяющегося эфира меняет всю серию.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {!loaded && <button onClick={() => void load().catch(cause => setError(cause.message))} className="btn-secondary">Обновить календарь</button>}
    <div className="rounded-2xl bg-white p-3 sm:p-5">
      <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} locale={ruLocale} timeZone="UTC" initialView="timeGridWeek" height="auto" firstDay={1} now={new Date(Date.now() + MSK)} nowIndicator allDaySlot={false} slotDuration="00:30:00" snapDuration="00:05:00" eventDurationEditable={false} editable={!busy}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }} events={events}
        datesSet={info => setRange({ start: new Date(info.start.getTime() - MSK), end: new Date(info.end.getTime() - MSK) })}
        dateClick={info => { setEditing(null); setForm({ ...emptyForm(), starts_at: stationInput(new Date(info.date.getTime() - MSK).toISOString()) }); setError(''); setOpen(true); }}
        eventClick={info => { const entry = entries.find(row => row.id === info.event.extendedProps.scheduleId); if (entry) edit(entry); }}
        eventDrop={info => {
          const entry = entries.find(row => row.id === info.event.extendedProps.scheduleId);
          if (!entry || !info.event.start) { info.revert(); return; }
          const newStart = info.event.start.getTime() - MSK - Number(info.event.extendedProps.offset);
          const delta = newStart - Date.parse(entry.starts_at);
          setBusy(true); setError('');
          void Promise.resolve(supabase.from('broadcast_schedule').update({ starts_at: new Date(newStart).toISOString(), repeat_until: entry.repeat_until ? new Date(Date.parse(entry.repeat_until) + delta).toISOString() : null }).eq('id', entry.id).select('id')).then(async result => {
            if (result.error || !result.data?.length) { info.revert(); setError(result.error?.message || 'Эфир недоступен для изменения.'); }
            else await Promise.all([load(), refresh()]);
          }).catch(() => { info.revert(); setError('Не удалось перенести эфир.'); }).finally(() => setBusy(false));
        }} />
    </div>
    {open && <AdminDialog labelledBy="airing-title" returnFocusId="open-airing-dialog" busy={busy} onDismiss={() => setOpen(false)}>
      <form onSubmit={event => { event.preventDefault(); void save(); }} className="p-6 space-y-4">
        <h2 id="airing-title" className="text-xl font-bold">{editing ? 'Изменить эфир' : 'Новый эфир'}</h2>
        <fieldset disabled={busy} className="space-y-4">
        <label className="block">Запись<select value={form.media} onChange={event => setForm({ ...form, media: event.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="">Выберите передачу или подкаст</option>{records.map(row => <option key={`${row.kind}:${row.id}`} value={`${row.kind}:${row.id}`} disabled={!row.asset_id}>{row.kind === 'show' ? 'Передача' : 'Подкаст'} · {row.title}{!row.asset_id ? ' (нужна проверка MP3)' : ''}</option>)}</select></label>
        <label className="block">Начало по Москве<input type="datetime-local" value={form.starts_at} onInput={event => { const value = event.currentTarget.value; setForm(current => ({ ...current, starts_at: value })); }} onChange={event => setForm(current => ({ ...current, starts_at: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
        <label className="flex gap-2"><input type="checkbox" checked={form.weekly} onChange={event => setForm({ ...form, weekly: event.target.checked })} /> Повторять каждую неделю</label>
        {form.weekly && <label className="block">Последний повтор (необязательно)<input type="datetime-local" value={form.repeat_until} onInput={event => { const value = event.currentTarget.value; setForm(current => ({ ...current, repeat_until: value })); }} onChange={event => setForm(current => ({ ...current, repeat_until: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>}
        <label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} /> Опубликовать в эфирной сетке</label>
        <p className="text-xs text-[#4A6578]">Черновик не выходит в эфир. Для трансляции сама запись также должна быть опубликована.</p>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy} className="btn-primary">{busy ? 'Сохранение…' : 'Сохранить'}</button><button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn-secondary">Отмена</button>{editing && <button type="button" onClick={() => void remove()} disabled={busy} className="text-red-700 underline">Удалить эфир</button>}</div>
      </form>
    </AdminDialog>}
  </div>;
}
