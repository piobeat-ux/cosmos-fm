import { useState } from 'react';
import { Radio, Image, Type, Mail, Phone, MapPin, Instagram, Youtube, Music2, Save, RotateCcw, HelpCircle, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';

export function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setForm({ ...settings });
    setSaved(false);
  };

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#6366f1]" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки сайта</h1>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saved ? 'Сохранено!' : 'Сохранить'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
          Настройки успешно сохранены! Обновите главную страницу, чтобы увидеть изменения.
        </div>
      )}

      {/* Hero Section */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Image} title="Главная страница (Hero)" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Заголовок</label>
              <input
                type="text"
                value={form.hero_title || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="Голос вашего отеля"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Подзаголовок</label>
              <input
                type="text"
                value={form.hero_subtitle || ''}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="Звуки вашего космоса"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Описание</label>
            <textarea
              value={form.hero_description || ''}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none resize-none"
              placeholder="Описание на главной странице..."
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Обложка Hero (персонаж)</label>
            <ImageUpload
              value={form.hero_cover_image || ''}
              onChange={(v) => handleChange('hero_cover_image', v)}
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Фраза персонажа (облачко)</label>
            <input
              type="text"
              value={form.neppy_phrase || ''}
              onChange={(e) => handleChange('neppy_phrase', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              placeholder="ПРИВЕТ! Я НЭППИ"
            />
          </div>
        </div>
      </section>

      {/* Stream Settings */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Radio} title="Прямой эфир" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">
              Ссылка на аудиопоток <span className="text-[#6366f1]">*</span>
            </label>
            <input
              type="url"
              value={form.stream_url || ''}
              onChange={(e) => handleChange('stream_url', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              placeholder="https://stream.example.com/live.mp3"
            />
          </div>
        </div>
      </section>

      {/* General Settings */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Type} title="Общие настройки" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Название сайта</label>
              <input
                type="text"
                value={form.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Слоган</label>
              <input
                type="text"
                value={form.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Page */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Type} title="Страница «О нас»" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Заголовок</label>
            <input
              type="text"
              value={form.about_title || ''}
              onChange={(e) => handleChange('about_title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              placeholder="О Cosmos FM"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Описание</label>
            <textarea
              value={form.about_description || ''}
              onChange={(e) => handleChange('about_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none resize-none"
              placeholder="Описание страницы О нас..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Стат 1 - подпись</label>
              <input
                type="text"
                value={form.about_stat1_label || ''}
                onChange={(e) => handleChange('about_stat1_label', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Стат 2 - подпись</label>
              <input
                type="text"
                value={form.about_stat2_label || ''}
                onChange={(e) => handleChange('about_stat2_label', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Стат 3 - подпись</label>
              <input
                type="text"
                value={form.about_stat3_label || ''}
                onChange={(e) => handleChange('about_stat3_label', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Стат 4 - подпись</label>
              <input
                type="text"
                value={form.about_stat4_label || ''}
                onChange={(e) => handleChange('about_stat4_label', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Города (через •)</label>
            <input
              type="text"
              value={form.about_cities || ''}
              onChange={(e) => handleChange('about_cities', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              placeholder="Москва • Санкт-Петербург • Сочи"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={HelpCircle} title="FAQ (Часто задаваемые вопросы)" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Заголовок раздела</label>
            <input
              type="text"
              value={form.faq_title || ''}
              onChange={(e) => handleChange('faq_title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              placeholder="Часто задаваемые вопросы"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A6578] mb-2">Вопросы и ответы (JSON)</label>
            <textarea
              value={form.faq_items || '[]'}
              onChange={(e) => handleChange('faq_items', e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none resize-none font-mono text-sm"
              placeholder='[{"question": "Вопрос?", "answer": "Ответ"}]'
            />
            <p className="text-xs text-[#4A6578] mt-1">
              Формат JSON массива: &#123;"question": "Вопрос", "answer": "Ответ"&#125;
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={FileText} title="Документы (политики)" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 1 - название</label>
              <input
                type="text"
                value={form.doc1_title || ''}
                onChange={(e) => handleChange('doc1_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="Политика конфиденциальности"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 1 - URL</label>
              <input
                type="url"
                value={form.doc1_url || ''}
                onChange={(e) => handleChange('doc1_url', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 2 - название</label>
              <input
                type="text"
                value={form.doc2_title || ''}
                onChange={(e) => handleChange('doc2_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="Пользовательское соглашение"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 2 - URL</label>
              <input
                type="url"
                value={form.doc2_url || ''}
                onChange={(e) => handleChange('doc2_url', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 3 - название</label>
              <input
                type="text"
                value={form.doc3_title || ''}
                onChange={(e) => handleChange('doc3_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="Cookies"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A6578] mb-2">Документ 3 - URL</label>
              <input
                type="url"
                value={form.doc3_url || ''}
                onChange={(e) => handleChange('doc3_url', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Mail} title="Контакты и соцсети" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={form.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <Phone className="w-4 h-4" /> Телефон
              </label>
              <input
                type="text"
                value={form.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <MapPin className="w-4 h-4" /> Адрес
              </label>
              <input
                type="text"
                value={form.contact_address || ''}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <Instagram className="w-4 h-4" /> Instagram
              </label>
              <input
                type="url"
                value={form.social_instagram || ''}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <Youtube className="w-4 h-4" /> YouTube
              </label>
              <input
                type="url"
                value={form.social_youtube || ''}
                onChange={(e) => handleChange('social_youtube', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#4A6578] mb-2">
                <Music2 className="w-4 h-4" /> TikTok
              </label>
              <input
                type="url"
                value={form.social_tiktok || ''}
                onChange={(e) => handleChange('social_tiktok', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5FBFD] border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
