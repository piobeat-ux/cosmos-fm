import { supabase } from './supabase';
import { isSecureAudioUrl } from './audio-controller';

export const MAX_AUDIO_BYTES = 50_000_000;
export const MAX_AUDIO_SECONDS = 3600;
export interface MediaAsset {
  id: string;
  storage_path: string | null;
  external_url: string | null;
  duration_seconds: number;
  size_bytes?: number;
}

async function inspectMp3(blob: Blob) {
  if (!blob.size || blob.size > MAX_AUDIO_BYTES) throw new Error('Размер MP3 должен быть от 1 байта до 50 МБ.');
  const { parseBlob } = await import('music-metadata');
  const metadata = await parseBlob(blob, { duration: true, skipCovers: true });
  const seconds = metadata.format.duration;
  if (!metadata.format.codec?.match(/Layer 3/i) || !seconds || !Number.isFinite(seconds)) throw new Error('Не удалось прочитать MP3. Проверьте формат файла.');
  if (seconds > MAX_AUDIO_SECONDS) throw new Error('Продолжительность передачи — не больше 60 минут.');
  return { duration_seconds: Math.ceil(seconds), size_bytes: blob.size };
}

export async function createUploadedAsset(file: File, signal: AbortSignal, onProgress: (percent: number) => void): Promise<MediaAsset> {
  if (!file.name.toLowerCase().endsWith('.mp3')) throw new Error('Выберите файл в формате MP3.');
  const details = await inspectMp3(file);
  signal.throwIfAborted();
  const path = `${crypto.randomUUID()}.mp3`;
  const { Upload } = await import('tus-js-client');
  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      storeFingerprintForResuming: false,
      metadata: { bucketName: 'broadcasts', objectName: path, contentType: 'audio/mpeg', cacheControl: '3600' },
      onBeforeRequest: async request => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) throw new Error('Войдите в панель управления заново.');
        request.setHeader('authorization', `Bearer ${session.access_token}`);
        request.setHeader('x-upsert', 'false');
      },
      onProgress: (sent, total) => onProgress(Math.round(sent / total * 100)),
      onError: () => { signal.removeEventListener('abort', cancel); reject(new Error('Загрузка прервана. Проверьте подключение и повторите попытку.')); },
      onSuccess: () => { signal.removeEventListener('abort', cancel); resolve(); },
    });
    const cancel = () => {
      void upload.abort().catch(() => undefined);
      reject(new DOMException('Загрузка отменена', 'AbortError'));
    };
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel(); else upload.start();
  });
  signal.throwIfAborted();
  const { data, error } = await supabase.from('media_assets').insert({ storage_path: path, ...details }).select('*').single();
  if (error) throw new Error('Файл загружен, но не удалось сохранить его карточку. Повторите попытку.');
  return data as MediaAsset;
}

export async function createExternalAsset(value: string, signal: AbortSignal): Promise<MediaAsset> {
  const url = value.trim();
  if (!isSecureAudioUrl(url)) throw new Error('Укажите HTTPS-ссылку без логина и пароля.');
  // Fetch in the browser, never through a privileged server-side proxy.
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok || !response.body || !isSecureAudioUrl(response.url)) throw new Error('Источник не разрешает загрузку MP3. Проверьте ссылку и доступ к файлу.');
  if (Number(response.headers.get('content-length')) > MAX_AUDIO_BYTES) {
    await response.body.cancel();
    throw new Error('Размер MP3 превышает 50 МБ.');
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;
      size += chunk.byteLength;
      if (size > MAX_AUDIO_BYTES) throw new Error('Размер MP3 превышает 50 МБ.');
      chunks.push(new Uint8Array(chunk));
    }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  const details = await inspectMp3(new Blob(chunks, { type: 'audio/mpeg' }));
  signal.throwIfAborted();
  const { data, error } = await supabase.from('media_assets').insert({ external_url: url, ...details }).select('*').single();
  if (error) throw new Error('Не удалось сохранить аудиозапись.');
  return data as MediaAsset;
}

export async function resolveAudio(assetId: string): Promise<string> {
  const { data, error } = await supabase.rpc('resolve_audio', { target_id: assetId });
  if (error || !data) throw new Error('Аудиозапись сейчас недоступна.');
  const asset = data as MediaAsset;
  if (asset.external_url && isSecureAudioUrl(asset.external_url)) return asset.external_url;
  if (!asset.storage_path) throw new Error('Файл не найден.');
  const { data: signed, error: signingError } = await supabase.storage.from('broadcasts').createSignedUrl(asset.storage_path, 7200);
  if (signingError || !signed) throw new Error('Не удалось открыть аудиозапись.');
  return signed.signedUrl;
}
