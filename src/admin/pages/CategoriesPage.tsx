import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Tag, Plus, Trash2, Edit, X } from 'lucide-react';

export function CategoriesPage() {
  const { categories, addCategory, editCategory, removeCategory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🎵', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editCategory(editingItem.id, formData);
      else await addCategory(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ name: '', icon: '🎵', description: '' }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name||'', icon: item.icon||'🎵', description: item.description||'' });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6 text-[#6366f1]" /> Категории <span className="text-sm text-[#4A6578]">({categories.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', icon: '🎵', description: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? <p className="col-span-full text-center py-12 text-[#4A6578]">Нет категорий</p> : categories.map(c => (
          <div key={c.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 text-2xl">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{c.name}</h3>
                {c.description && <p className="text-sm text-[#4A6578] truncate">{c.description}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(c)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm"><Edit className="w-4 h-4 inline mr-1" /> Изменить</button>
              <button onClick={() => { if(confirm('Удалить?')) removeCategory(c.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#F5FBFD] rounded-2xl border border-[#28B9D040] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} категория</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <div className="flex gap-2">
                <input placeholder="Иконка" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-[#28B9D040] text-2xl">{formData.icon}</div>
              </div>
              <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" rows={2} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#B6E0EE] hover:bg-[#A0D4E8] text-[#1A2B3C] transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
