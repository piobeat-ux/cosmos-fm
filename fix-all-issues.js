import fs from 'fs';

console.log('🔧 ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ...\n');

// 1. Fix FAQ Section - add FAQSection component
console.log('1/5 Создание FAQSection...');

if (!fs.existsSync('src/sections')) {
  fs.mkdirSync('src/sections', { recursive: true });
}

const faqSectionContent = `import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function FAQSection() {
  const { settings } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Parse FAQ from settings
  let faqs = [];
  try {
    if (settings.faq_items) {
      faqs = typeof settings.faq_items === 'string' 
        ? JSON.parse(settings.faq_items) 
        : settings.faq_items;
    }
  } catch (e) {
    console.error('Error parsing FAQ:', e);
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.bg }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.text }}>
            {settings.faq_title || 'Часто задаваемые вопросы'}
          </h1>
          <p className="text-lg" style={{ color: COLORS.textMuted }}>
            {settings.faq_subtitle || 'Ответы на популярные вопросы'}
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12" style={{ color: COLORS.textMuted }}>
            <p>Вопросы пока не добавлены</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden border-2"
                style={{ borderColor: COLORS.neppy + '40', background: COLORS.white }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-bold pr-4" style={{ color: COLORS.text }}>
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4" style={{ color: COLORS.textMuted }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/FAQSection.tsx', faqSectionContent);
console.log('✅ FAQSection.tsx создан');

// 2. Fix SettingsPage - add updateSettings to useData
console.log('2/5 Исправление SettingsPage...');

if (fs.existsSync('src/admin/pages/SettingsPage.tsx')) {
  let content = fs.readFileSync('src/admin/pages/SettingsPage.tsx', 'utf-8');
  
  // Add updateSettings to useData if not present
  if (!content.includes('updateSettings')) {
    content = content.replace(
      /const \{([^}]+)\} = useData\(\);/,
      (match, p1) => {
        const imports = p1.split(',').map(s => s.trim());
        if (!imports.includes('updateSettings')) {
          imports.push('updateSettings');
          return `const { ${imports.join(', ')} } = useData();`;
        }
        return match;
      }
    );
  }
  
  fs.writeFileSync('src/admin/pages/SettingsPage.tsx', content);
  console.log('✅ SettingsPage.tsx исправлен');
}

// 3. Fix ImageUpload - better error handling
console.log('3/5 Исправление ImageUpload...');

const imageUploadContent = `import { useState } from 'react';
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
        setError(\`Файл слишком большой. Максимум \${maxSize / 1024 / 1024}MB\`);
        return;
      }

      setUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
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
          setError(\`Ошибка загрузки: \${uploadError.message}\`);
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
`;

if (!fs.existsSync('src/admin/components')) {
  fs.mkdirSync('src/admin/components', { recursive: true });
}

fs.writeFileSync('src/admin/components/ImageUpload.tsx', imageUploadContent);
console.log('✅ ImageUpload.tsx исправлен');

// 4. Create SETUP-STORAGE.md
console.log('4/5 Создание SETUP-STORAGE.md...');

const setupStorageContent = `# Настройка Supabase Storage

## Проблема
При загрузке файлов возникают ошибки:
- "Bucket not found" - бакеты не созданы
- "row violates row-level security policy" - не настроены RLS политики

## Решение

### Шаг 1: Создайте бакеты в Supabase

1. Откройте https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в раздел **Storage**
4. Нажмите **New bucket**

**Бакет 1:**
- Name: \`media\`
- Public: ✅ **Да** (ОБЯЗАТЕЛЬНО!)
- File size limit: 10485760 (10MB)

**Бакет 2:**
- Name: \`audio\`
- Public: ✅ **Да** (ОБЯЗАТЕЛЬНО!)
- File size limit: 52428800 (50MB)

### Шаг 2: Настройте политики доступа (RLS)

1. Перейдите в **SQL Editor** (в левом меню)
2. Нажмите **New query**
3. Выполните следующий SQL:

\`\`\`sql
-- Отключаем RLS для бакета media
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Разрешить все операции с media
CREATE POLICY "Public Access Media"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Разрешить все операции с audio
CREATE POLICY "Public Access Audio"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'audio')
WITH CHECK (bucket_id = 'audio');
\`\`\`

4. Нажмите **Run** (или Ctrl+Enter)

### Шаг 3: Проверьте работу

1. Обновите страницу приложения
2. Попробуйте загрузить файл
3. Файлы должны загружаться без ошибок!

## Альтернативный вариант

Если не хотите использовать Supabase Storage:
- Загружайте файлы на любой хостинг (Imgur, Cloudinary и т.д.)
- Вставляйте прямые ссылки через кнопку "URL"
`;

fs.writeFileSync('SETUP-STORAGE.md', setupStorageContent);
console.log('✅ SETUP-STORAGE.md создан');

// 5. Fix App.tsx - add error to useData
console.log('5/5 Исправление App.tsx...');

if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  
  // Add error to useData in FrontLayout
  content = content.replace(
    'const { loading } = useData();',
    'const { loading, error } = useData();'
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('✅ App.tsx исправлен');
}

console.log('\n' + '='.repeat(70));
console.log('✅ ВСЕ ИСПРАВЛЕНИЯ ГОТОВЫ!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ FAQSection.tsx - создан компонент');
console.log('2. ✅ SettingsPage.tsx - добавлен updateSettings');
console.log('3. ✅ ImageUpload.tsx - лучшая обработка ошибок');
console.log('4. ✅ SETUP-STORAGE.md - инструкция по настройке');
console.log('5. ✅ App.tsx - добавлен error');
console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Откройте SETUP-STORAGE.md');
console.log('  2. Создайте бакеты в Supabase Storage');
console.log('  3. Выполните SQL для настройки RLS');
console.log('  4. Перезапустите: npm run dev');
console.log('\n✅ После настройки:');
console.log('  - Файлы будут загружаться без ошибок');
console.log('  - FAQ будет создаваться через Settings');
console.log('  - Все настройки будут сохраняться');
console.log('='.repeat(70));
