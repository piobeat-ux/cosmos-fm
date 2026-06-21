import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, Music, Trash2, Edit, X } from 'lucide-react';

export function PodcastsPage() {
  const { podcasts, addPodcast, editPodcast, removePodcast } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', host_name: '', episodes: 0, duration: '30 мин', category: '', color: 'from-[#6366f1] to-[#8b5cf6]', cover_url: '', audio_url: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.title) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editPodcast(editingItem.id, formData);
      else await addPodcast(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ title: '', description: '', host_name: '', episodes: 0, duration: '30 мин', category: '', color: 'from-[#6366f1] to-[#8b5cf6]', cover_url: '', audio_url: '' }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title||'', description: item.description||'', host_name: item.host_name||'', episodes: item.episodes||0, duration: item.duration||'30 мин', category: item.category||'', color: item.color||'from-[#6366f1] to-[#8b5cf6]', cover_url: item.cover_url||'', audio_url: item.audio_url||'' });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
            
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Music className="w-6 h-6 text-[#6366f1]" /> Подкасты <span className="text-sm text-[#4A6578]">({podcasts.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', host_name: '', episodes: 0, duration: '30 мин', category: '', color: 'from-[#6366f1] to-[#8b5cf6]', cover_url: '', audio_url: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {podcasts.length === 0 ? <p className="col-span-full text-center py-12 text-[#4A6578]">Нет подкастов</p> : podcasts.map(p => (
          <div key={p.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3">
              {p.cover_url ? <img src={p.cover_url} className="w-16 h-16 rounded-lg object-cover" /> : <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${p.color||'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center`}><Music className="w-8 h-8 text-[#1A2B3C]" /></div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{p.title}</h3>
                <p className="text-sm text-[#4A6578] truncate">{p.description||'Нет описания'}</p>
                <p className="text-xs text-[#4A6578] mt-1">{p.host_name||'Автор не указан'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(p)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm"><Edit className="w-4 h-4 inline mr-1" /> Изменить</button>
              <button onClick={() => { if(confirm('Удалить?')) removePodcast(p.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#F5FBFD] rounded-2xl border border-[#28B9D040] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} подкаст</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Автор" value={formData.host_name} onChange={e => setFormData({...formData, host_name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
                <input placeholder="Категория" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Эпизодов" value={formData.episodes} onChange={e => setFormData({...formData, episodes: parseInt(e.target.value)||0})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
                <input placeholder="Длительность" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <ImageUpload value={formData.cover_url} onChange={v => setFormData({...formData, cover_url: v})} type="image" label="Обложка" />
              <ImageUpload value={formData.audio_url} onChange={v => setFormData({...formData, audio_url: v})} type="audio" label="Аудио" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}