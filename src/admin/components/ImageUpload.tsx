import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ImageUpload({ value, onChange, type = 'image', label }) {
  const { uploadMedia } = useData();
  const [mode, setMode] = useState(value?.startsWith('http') ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10 МБ)');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting upload...', file.name);
      const url = await uploadMedia(file, type);
      console.log('Upload complete:', url);
      onChange(url);
      setError('');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка загрузки: ' + err.message + '. Попробуйте использовать URL вместо файла.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
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
      {label && <label className="block text-sm text-[#a1a1aa] mb-2">{label}</label>}
      
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${mode === 'upload' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa]'}`}>
          <Upload className="w-4 h-4" /> Файл
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${mode === 'url' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa]'}`}>
          <LinkIcon className="w-4 h-4" /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input type="file" accept={type === 'image' ? 'image/*' : 'audio/*'}
            onChange={handleFileUpload} disabled={uploading}
            className="w-full text-sm text-[#a1a1aa] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6366f1] file:text-white hover:file:bg-[#8b5cf6] disabled:opacity-50" />
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-[#6366f1]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Загрузка в Supabase...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/file.mp3"
            className="flex-1 px-4 py-2 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
          <button type="button" onClick={handleUrlSave}
            className="px-4 py-2 bg-[#6366f1] text-white rounded-xl hover:bg-[#8b5cf6] transition">OK</button>
        </div>
      )}

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      {value && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#13131f] border border-[#27273a]">
          {type === 'image' ? (
            <img src={value} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <audio controls src={value} className="w-full h-10" />
          )}
          <button type="button" onClick={handleClear} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}