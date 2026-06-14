import { useState } from 'react';
import { Radio, Image, Type, Mail, Phone, MapPin, Instagram, Youtube, Music2, Save, RotateCcw } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';

export function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
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

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
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
              <label className="block text-sm text-[#a1a1aa] mb-2">Заголовок</label>
              <input
                type="text"
                value={form.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="Голос вашего отеля"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Подзаголовок</label>
              <input
                type="text"
                value={form.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="Звуки вашего космоса"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-2">Описание</label>
            <textarea
              value={form.hero_description}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none resize-none"
              placeholder="Описание на главной странице..."
            />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-2">Обложка Hero</label>
            <ImageUpload
              value={form.hero_cover_image}
              onChange={(v) => handleChange('hero_cover_image', v)}
              previewSize="lg"
            />
          </div>
        </div>
      </section>

      {/* Stream Settings */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Radio} title="Прямой эфир" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-2">
              Ссылка на аудиопоток <span className="text-[#6366f1]">*</span>
            </label>
            <input
              type="url"
              value={form.stream_url}
              onChange={(e) => handleChange('stream_url', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              placeholder="https://stream.example.com/live.mp3"
            />
            <p className="text-xs text-[#71717a] mt-1">
              Вставьте прямую ссылку на аудиопоток (MP3, AAC, OGG). Например: https://stream.cosmosfm.ru/live
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Название текущего шоу</label>
              <input
                type="text"
                value={form.current_show_title}
                onChange={(e) => handleChange('current_show_title', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="Утренний кофе"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Ведущий</label>
              <input
                type="text"
                value={form.current_show_host}
                onChange={(e) => handleChange('current_show_host', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="Анна Петрова"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-2">Обложка текущего шоу</label>
            <ImageUpload
              value={form.current_show_cover}
              onChange={(v) => handleChange('current_show_cover', v)}
              previewSize="md"
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
              <label className="block text-sm text-[#a1a1aa] mb-2">Название сайта</label>
              <input
                type="text"
                value={form.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Слоган</label>
              <input
                type="text"
                value={form.site_tagline}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-2">Текст "О нас"</label>
            <textarea
              value={form.about_text}
              onChange={(e) => handleChange('about_text', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="glass-card rounded-2xl p-6">
        <SectionTitle icon={Mail} title="Контакты и соцсети" />
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <Phone className="w-4 h-4" /> Телефон
              </label>
              <input
                type="text"
                value={form.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <MapPin className="w-4 h-4" /> Адрес
              </label>
              <input
                type="text"
                value={form.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <Instagram className="w-4 h-4" /> Instagram
              </label>
              <input
                type="url"
                value={form.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <Youtube className="w-4 h-4" /> YouTube
              </label>
              <input
                type="url"
                value={form.social_youtube}
                onChange={(e) => handleChange('social_youtube', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
                <Music2 className="w-4 h-4" /> TikTok
              </label>
              <input
                type="url"
                value={form.social_tiktok}
                onChange={(e) => handleChange('social_tiktok', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
