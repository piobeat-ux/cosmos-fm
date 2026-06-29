import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'image' | 'audio';
  label?: string;
}

export function ImageUpload({ value, onChange, type = 'image', label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(!value || !value.startsWith('http'));
  const [urlInput, setUrlInput] = useState(value);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (10MB for images, 50MB for audio)
      const maxSize = type === 'audio' ? 52428800 : 10485760;
      if (file.size > maxSize) {
        setError(`Файл слишком большой. Максимум ${maxSize / 1024 / 1024}MB`);
        return;
      }

      setUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = type === 'audio' ? 'audio' : 'media';

      console.log('Uploading to bucket:', bucket, 'File:', file.name);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          setError('❌ Бакет не найден. Создайте бакеты в Supabase Storage (media и audio). См. SETUP-STORAGE.md');
        } else if (uploadError.message.includes('row-level security')) {
          setError('❌ Ошибка RLS. Настройте политики доступа в Supabase. См. SETUP-STORAGE.md');
        } else {
          setError(`Ошибка загрузки: ${uploadError.message}`);
        }
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('File uploaded successfully:', publicUrl);
      onChange(publicUrl);
      setUrlInput(publicUrl);
      setUploading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Ошибка загрузки файла');
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError('');
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#4A6578]">
          {label || (type === 'audio' ? 'Аудио файл' : 'Изображение')}
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="text-xs text-[#6366f1] hover:underline flex items-center gap-1"
        >
          {urlMode ? <><ImageIcon className="w-3 h-3" /> Использовать URL</> : <><LinkIcon className="w-3 h-3" /> Загрузить файл</>}
        </button>
      </div>

      {urlMode ? (
        <div className="space-y-2">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] cursor-pointer hover:bg-[#F5FBFD]/80 transition">
            <Upload className="w-5 h-5 text-[#6366f1]" />
            <span className="text-sm text-[#4A6578]">
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </span>
            <input
              type="file"
              accept={type === 'audio' ? 'audio/*' : 'image/*'}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && (
            <p className="text-xs text-[#6366f1]">Загрузка файла...</p>
          )}
          <p className="text-xs text-[#4A6578]">
            Максимальный размер: {type === 'audio' ? '50MB' : '10MB'}
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#6366f1]/90"
          >
            OK
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
          {(error.includes('Бакет не найден') || error.includes('RLS')) && (
            <div className="mt-2 text-xs">
              <p className="font-semibold mb-1">Как исправить:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Откройте <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Storage → Create new bucket</li>
                <li>Создайте бакет "media" (для изображений) - сделайте публичным</li>
                <li>Создайте бакет "audio" (для аудио) - сделайте публичным</li>
                <li>SQL Editor → выполните SQL из SETUP-STORAGE.md</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {value && !error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040]">
          {type === 'image' && value.startsWith('http') && (
            <img src={value} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
          )}
          {type === 'audio' && (
            <div className="w-12 h-12 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#4A6578] truncate">{value}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
