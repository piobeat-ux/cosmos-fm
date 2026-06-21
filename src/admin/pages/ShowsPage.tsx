import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, Radio, Trash2, Edit, X } from 'lucide-react';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const CATS = ['Музыка', 'Новости', 'Развлечения', 'Обучение', 'Истории', 'Утреннее шоу', 'Разговорное'];

export function ShowsPage() {
  const { shows, addShow, editShow, removeShow } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', host_name: '', time: '12:00', duration: '1ч',
    category: '', day_of_week: 'Пн', is_live: false, cover_url: '', audio_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.title) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editShow(editingItem.id, formData);
      else await addShow(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ title: '', description: '', host_name: '', time: '12:00', duration: '1ч', category: '', day_of_week: 'Пн', is_live: false, cover_url: '', audio_url: '' }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '', description: item.description || '', host_name: item.host_name || '',
      time: item.time || '12:00', duration: item.duration || '1ч', category: item.category || '',
      day_of_week: item.day_of_week || 'Пн', is_live: !!item.is_live, cover_url: item.cover_url || '', audio_url: item.audio_url || ''
    });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="w-6 h-6 text-[#6366f1]" /> Передачи <span className="text-sm text-[#4A6578]">({shows.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', host_name: '', time: '12:00', duration: '1ч', category: '', day_of_week: 'Пн', is_live: false, cover_url: '', audio_url: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{message}</div>}
      <div className="space-y-3">
        {shows.length === 0 ? <p className="text-center py-12 text-[#4A6578]">Нет передач</p> : shows.map(s => (
          <div key={s.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
            {s.cover_url ? <img src={s.cover_url} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center"><Radio className="w-8 h-8 text-[#1A2B3C]" /></div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-bold truncate">{s.title}</h3>{s.is_live && <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">LIVE</span>}</div>
              <p className="text-sm text-[#4A6578] truncate">{s.description || 'Нет описания'}</p>
              <div className="flex gap-3 mt-1 text-xs text-[#4A6578]"><span>{s.day_of_week} {s.time}</span><span>•</span><span>{s.host_name || 'Ведущий не указан'}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(s)} className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg"><Edit className="w-5 h-5" /></button>
              <button onClick={() => { if(confirm('Удалить?')) removeShow(s.id); }} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#F5FBFD] rounded-2xl border border-[#28B9D040] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} передачу</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none">{DAYS.map(d => <option key={d}>{d}</option>)}</select>
                <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Ведущий" value={formData.host_name} onChange={e => setFormData({...formData, host_name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
                <input placeholder="Длительность" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none"><option value="">Категория</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
              <ImageUpload value={formData.cover_url} onChange={v => setFormData({...formData, cover_url: v})} type="image" label="Обложка" />
              <ImageUpload value={formData.audio_url} onChange={v => setFormData({...formData, audio_url: v})} type="audio" label="Аудио / Поток" />
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_live} onChange={e => setFormData({...formData, is_live: e.target.checked})} className="w-5 h-5 accent-[#6366f1]" /><span className="text-sm">Прямой эфир (LIVE)</span></label>
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