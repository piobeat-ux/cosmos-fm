import { useEffect, useRef, useState } from 'react';
import { createExternalAsset, createUploadedAsset, type MediaAsset } from '@/lib/media';

export function AudioUpload({ assetId, legacyUrl, onChange, onBusyChange }: { assetId?: string; legacyUrl?: string; onChange: (asset: MediaAsset) => void; onBusyChange?: (busy: boolean) => void }) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState(legacyUrl || '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<MediaAsset | null>(null);
  const operation = useRef<AbortController | null>(null);
  useEffect(() => () => { operation.current?.abort(); operation.current = null; }, []);

  const upload = async (file?: File) => {
    if (busy || (mode === 'file' && !file)) return;
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true); onBusyChange?.(true); setError(''); setProgress(0);
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, mode === 'url' ? 120_000 : 600_000);
    try {
      const asset = file ? await createUploadedAsset(file, controller.signal, setProgress) : await createExternalAsset(url, controller.signal);
      if (controller.signal.aborted) return;
      setDetails(asset); onChange(asset);
    } catch (cause) {
      if (operation.current === controller) setError(timedOut ? 'Проверка или загрузка заняла слишком много времени. Повторите попытку.' : controller.signal.aborted ? 'Загрузка отменена.' : cause instanceof Error ? cause.message : 'Не удалось загрузить запись.');
    } finally {
      clearTimeout(timeout);
      if (operation.current === controller) { operation.current = null; setBusy(false); onBusyChange?.(false); }
    }
  };

  return <fieldset className="space-y-3 rounded-xl border border-[#28B9D040] p-4">
    <legend className="px-2 font-medium">Аудиозапись</legend>
    <p className="text-sm text-[#4A6578]">MP3, до 50 МБ и 60 минут. Для часового выпуска подойдёт битрейт 96 кбит/с — примерно 43 МБ.</p>
    <div className="flex gap-4">
      <label><input type="radio" checked={mode === 'file'} onChange={() => setMode('file')} disabled={busy} /> Загрузить файл</label>
      <label><input type="radio" checked={mode === 'url'} onChange={() => setMode('url')} disabled={busy} /> HTTPS-ссылка</label>
    </div>
    {mode === 'file' ? <input aria-label="Выбрать MP3" type="file" accept=".mp3,audio/mpeg" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} />
      : <div className="space-y-2"><input aria-label="Ссылка на MP3" type="url" value={url} onChange={event => setUrl(event.target.value)} disabled={busy} placeholder="https://…/episode.mp3" className="w-full rounded-lg border p-2" /><button type="button" onClick={() => void upload()} disabled={busy || !url} className="btn-secondary">Проверить и сохранить ссылку</button><p className="text-xs text-[#4A6578]">Сервер источника должен разрешать проверку файла из браузера. Если проверка недоступна, загрузите MP3 файлом.</p></div>}
    {busy && <div role="status" className="text-sm">{progress ? `Загрузка: ${progress}%` : 'Проверка MP3…'} <button type="button" onClick={() => operation.current?.abort()} className="underline">Отменить</button></div>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {(details || assetId) && <p className="text-sm text-green-800">{details ? `Проверено: ${Math.floor(details.duration_seconds / 60)} мин ${details.duration_seconds % 60} с` : 'Аудиозапись сохранена'}</p>}
  </fieldset>;
}
