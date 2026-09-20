export const MAX_AUDIO_BYTES = 50_000_000;
export const MAX_AUDIO_SECONDS = 3600;

export function validateAudioSize(size: number) {
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_AUDIO_BYTES) throw new Error('Размер MP3 должен быть от 1 байта до 50 МБ.');
}

/** Inspect the file contents, not the extension or browser-supplied MIME alone. */
export async function inspectMp3(blob: Blob) {
  validateAudioSize(blob.size);
  const { parseBlob } = await import('music-metadata');
  let metadata;
  try { metadata = await parseBlob(blob, { duration: true, skipCovers: true }); }
  catch { throw new Error('Не удалось прочитать MP3. Проверьте формат файла.'); }
  const seconds = metadata.format.duration;
  if (!metadata.format.codec?.match(/Layer 3/i) || !seconds || !Number.isFinite(seconds)) throw new Error('Не удалось прочитать MP3. Проверьте формат файла.');
  if (seconds > MAX_AUDIO_SECONDS) throw new Error('Продолжительность передачи — не больше 60 минут.');
  return { duration_seconds: Math.ceil(seconds), size_bytes: blob.size };
}

export async function inspectMp3File(file: File) {
  if (!file.name.toLowerCase().endsWith('.mp3')) throw new Error('Выберите файл в формате MP3.');
  return inspectMp3(file);
}
