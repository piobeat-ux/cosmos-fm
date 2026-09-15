import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeHttpsUrl } from '@/lib/content-validation';

const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export function ImageUpload({ value, onChange, label = 'Изображение' }: { value: string; onChange: (value: string) => void; type?: 'image'; label?: string }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setUrl(value), [value]);

  const upload = async (file?: File) => {
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      const ext = types[file.type];
      if (!ext || !file.size || file.size > 10_000_000) throw new Error('Выберите JPG, PNG, WebP или GIF размером до 10 МБ.');
      const decoded = await createImageBitmap(file);
      const tooLarge = decoded.width > 8000 || decoded.height > 8000;
      decoded.close();
      if (tooLarge) throw new Error('Размер изображения — не больше 8000 × 8000 пикселей.');
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error('Не удалось загрузить изображение. Проверьте соединение и права доступа.');
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Файл не удалось прочитать.'); }
    finally { setBusy(false); }
  };
  return <fieldset className="rounded-xl border border-[#28B9D040] p-4 space-y-3">
    <legend className="px-2 font-medium">{label}</legend>
    <input aria-label={`Загрузить: ${label}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} />
    <p className="text-xs text-[#4A6578]">JPG, PNG, WebP или GIF, до 10 МБ.</p>
    <div className="flex gap-2"><input aria-label={`HTTPS-ссылка: ${label}`} type="url" value={url} disabled={busy} onChange={event => setUrl(event.target.value)} placeholder="https://…" className="min-w-0 flex-1 rounded-lg border p-2" /><button type="button" disabled={busy} className="btn-secondary" onClick={() => { const safe = safeHttpsUrl(url); if (!safe) setError('Укажите корректную HTTPS-ссылку.'); else { onChange(safe); setError(''); } }}>Применить</button></div>
    {safeHttpsUrl(value) && <div className="flex items-center gap-3"><img src={value} alt="Предпросмотр" className="h-20 w-20 object-cover rounded-lg" /><button type="button" disabled={busy} onClick={() => onChange('')} className="text-red-700 underline">Убрать из карточки</button></div>}
    {busy && <p role="status" className="text-sm">Загрузка изображения…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </fieldset>;
}
