import { useState, type FormEvent } from 'react';
import { useData } from '@/context/DataContext';
import { AudioUpload } from '@/admin/components/AudioUpload';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { supabase } from '@/lib/supabase';
import { stationInput, stationIso } from '@/lib/schedule';
import type { Show, Podcast } from '@/types/database';

interface MediaForm {
  title: string; description: string; host_name: string; category: string;
  cover_url: string; audio_url: string; duration: string; asset_id: string;
  published: boolean; catalog_mode: 'immediate' | 'after_airing';
}
const initial = (): MediaForm => ({ title: '', description: '', host_name: '', category: '', cover_url: '', audio_url: '', duration: '', asset_id: '', published: true, catalog_mode: 'immediate' });

export function MediaLibraryPage({ kind }: { kind: 'show' | 'podcast' }) {
  const { shows, podcasts, categories, refresh } = useData();
  const rows = kind === 'show' ? shows : podcasts;
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const uploading = audioBusy || imageBusy;
  const [error, setError] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [start, setStart] = useState('');
  const [weekly, setWeekly] = useState(false);

  const edit = (record?: Show | Podcast) => {
    if (busy) return;
    setAudioBusy(false); setImageBusy(false);
    setEditing(record?.id || null);
    setForm(record ? {
      title: record.title, description: record.description || '', host_name: record.host_name || '', category: record.category || '',
      cover_url: record.cover_url || '', audio_url: record.audio_url || '', duration: record.duration || '', asset_id: record.asset_id || '',
      published: record.published !== false, catalog_mode: record.catalog_mode || 'immediate',
    } : initial());
    setScheduled(false); setWeekly(false); setStart(stationInput(new Date(Date.now() + 3600000).toISOString()));
    setError(''); setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || uploading) return;
    setBusy(true); setError('');
    try {
      if (!form.asset_id && (!editing || scheduled)) throw new Error('Загрузите MP3 или проверьте внешнюю ссылку.');
      const { error: saveError } = await supabase.rpc('save_media_record', {
        record_kind: kind, record_id: editing,
        record_data: { ...form, title: form.title.trim(), audio_url: form.asset_id ? '' : form.audio_url, catalog_mode: scheduled && !editing ? 'after_airing' : form.catalog_mode },
        first_airing: scheduled ? { starts_at: stationIso(start), weekly, published: form.published } : null,
      });
      if (saveError) throw new Error(saveError.message);
      setOpen(false); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось сохранить запись.'); }
    finally { setBusy(false); }
  };

  const remove = async (record: Show | Podcast) => {
    if (busy || !confirm(`Удалить «${record.title}» и связанные эфиры из расписания?`)) return;
    setBusy(true); setError('');
    try {
      const { data, error: deleteError } = await supabase.from(kind === 'show' ? 'shows' : 'podcasts').delete().eq('id', record.id).select('id');
      if (deleteError) throw deleteError;
      if (!data?.length) throw new Error('Запись уже удалена или недостаточно прав.');
      await refresh();
    } catch { setError('Не удалось удалить запись. Повторите попытку.'); }
    finally { setBusy(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3"><h1 className="text-2xl font-bold">{kind === 'show' ? 'Передачи' : 'Подкасты'} <span className="text-sm text-[#4A6578]">({rows.length})</span></h1><button onClick={() => edit()} className="btn-primary">Добавить запись</button></div>
    <a href="#/admin/calendar" className="inline-block text-[#685096] underline">Открыть календарь эфиров</a>
    {error && !open && <p role="alert" className="text-red-700">{error}</p>}
    {!rows.length && <p className="py-8 text-[#4A6578]">Записи пока не добавлены.</p>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(record => <article key={record.id} className="rounded-2xl bg-white p-5 space-y-3">
      {record.cover_url && <img src={record.cover_url} alt="" className="h-36 w-full rounded-xl object-cover" />}
      <h2 className="font-bold text-lg">{record.title}</h2><p className="text-sm text-[#4A6578] line-clamp-3">{record.description}</p>
      <p className="text-sm">{record.duration} {record.host_name && `· ${record.host_name}`}</p>
      <p className="text-xs text-[#685096]">{record.published === false ? 'Черновик' : record.catalog_mode === 'after_airing' && (!record.catalog_visible_at || Date.parse(record.catalog_visible_at) > Date.now()) ? 'В каталоге после первого эфира' : 'Доступно в каталоге'}</p>
      <div className="flex gap-4"><button onClick={() => edit(record)} className="text-[#685096] underline">Изменить</button><button onClick={() => void remove(record)} disabled={busy} className="text-red-700 underline">Удалить</button></div>
    </article>)}</div>
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 flex items-start justify-center">
      <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="media-title" className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4">
        <h2 id="media-title" className="text-xl font-bold">{editing ? 'Редактировать запись' : 'Новая запись'}</h2>
        <label className="block">Название<input required maxLength={300} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
        <label className="block">Описание<textarea maxLength={10000} rows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label>Ведущий<input maxLength={200} value={form.host_name} onChange={event => setForm({ ...form, host_name: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label>Категория<input list="media-categories" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /><datalist id="media-categories">{categories.map(category => <option key={category.id} value={category.name} />)}</datalist></label></div>
        <ImageUpload value={form.cover_url} onBusyChange={setImageBusy} onChange={cover_url => setForm(current => ({ ...current, cover_url }))} label="Обложка" />
        <AudioUpload assetId={form.asset_id} legacyUrl={form.audio_url} onBusyChange={setAudioBusy} onChange={asset => setForm(current => ({ ...current, asset_id: asset.id, audio_url: '', duration: `${Math.floor(asset.duration_seconds / 60)} мин ${asset.duration_seconds % 60} с` }))} />
        <label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={event => setForm({ ...form, published: event.target.checked })} /> Опубликовать запись (снимите отметку для черновика)</label>
        <label className="flex gap-2"><input type="checkbox" checked={scheduled} onChange={event => setScheduled(event.target.checked)} /> Назначить {editing ? 'дополнительный ' : ''}эфир сейчас</label>
        {scheduled ? <div className="rounded-xl bg-[#F5FBFD] p-4 space-y-3"><label className="block">Дата и время по Москве<input type="datetime-local" required value={start} onInput={event => setStart(event.currentTarget.value)} onChange={event => setStart(event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label><label className="flex gap-2"><input type="checkbox" checked={weekly} onChange={event => setWeekly(event.target.checked)} /> Повторять каждую неделю</label><p className="text-sm text-[#4A6578]">{editing ? 'Настройка доступности этой записи в каталоге сохранится.' : 'Новая запись появится в каталоге после первого эфира.'} При сохранении черновика эфир тоже останется черновиком.</p></div>
          : <label className="block">Появление в каталоге<select value={form.catalog_mode} onChange={event => setForm({ ...form, catalog_mode: event.target.value as MediaForm['catalog_mode'] })} className="mt-1 w-full rounded-lg border p-2"><option value="immediate">Сразу после публикации</option><option value="after_airing">После первого эфира</option></select></label>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <div className="flex gap-3"><button type="submit" disabled={busy || uploading} className="btn-primary">{busy ? 'Сохранение…' : uploading ? 'Дождитесь загрузки…' : 'Сохранить'}</button><button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn-secondary">Отмена</button></div>
      </form>
    </div>}
  </div>;
}
