import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, User, Trash2, Edit, X } from 'lucide-react';

const COLORS = ['from-[#f59e0b] to-[#f97316]','from-[#8b5cf6] to-[#6366f1]','from-[#22c55e] to-[#14b8a6]','from-[#ef4444] to-[#f97316]','from-[#3b82f6] to-[#06b6d4]','from-[#ec4899] to-[#8b5cf6]'];

export function HostsPage() {
  const { hosts, hotels, addHost, editHost, removeHost } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', hotel: '', bio: '', photo_url: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) { setMessage('❌ Укажите имя'); return; }
    setSaving(true);
    try {
      if (editingItem) await editHost(editingItem.id, formData);
      else await addHost(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ name: '', role: '', hotel: '', bio: '', photo_url: '', color: COLORS[0] }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name||'', role: item.role||'', hotel: item.hotel||'', bio: item.bio||'', photo_url: item.photo_url||'', color: item.color||COLORS[0] });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-[#6366f1]" /> Ведущие <span className="text-sm text-[#71717a]">({hosts.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', role: '', hotel: '', bio: '', photo_url: '', color: COLORS[0] }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hosts.length === 0 ? <p className="col-span-full text-center py-12 text-[#71717a]">Нет ведущих</p> : hosts.map(h => (
          <div key={h.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3">
              {h.photo_url ? <img src={h.photo_url} className="w-16 h-16 rounded-full object-cover border-2 border-[#27273a]" /> : <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${h.color||COLORS[0]} flex items-center justify-center text-white font-bold`}>{h.initials||h.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{h.name}</h3>
                <p className="text-sm text-[#6366f1]">{h.role||'Ведущий'}</p>
                <p className="text-xs text-[#71717a] mt-1">{h.hotel||'Отель не указан'}</p>
              </div>
            </div>
            {h.bio && <p className="text-sm text-[#a1a1aa] mt-3 line-clamp-2">{h.bio}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(h)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm"><Edit className="w-4 h-4 inline mr-1" /> Изменить</button>
              <button onClick={() => { if(confirm('Удалить?')) removeHost(h.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} ведущий</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Имя *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              <input placeholder="Роль" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              <select value={formData.hotel} onChange={e => setFormData({...formData, hotel: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"><option value="">Отель</option>{hotels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}</select>
              <textarea placeholder="Биография" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={3} />
              <ImageUpload value={formData.photo_url} onChange={v => setFormData({...formData, photo_url: v})} type="image" label="Фото" />
              <div className="flex gap-2 flex-wrap">{COLORS.map(c => <button key={c} onClick={() => setFormData({...formData, color: c})} className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c} ${formData.color===c?'ring-2 ring-white ring-offset-2 ring-offset-[#13131f]':''}`} />)}</div>
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