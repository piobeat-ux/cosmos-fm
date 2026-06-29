import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Navigation, Plus, Trash2, Edit, X, GripVertical } from 'lucide-react';

export function NavigationPage() {
  const { navigation, navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ label: '', url: '#/', type: 'anchor', order_index: 1, is_active: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.label) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editNavigationLink(editingItem.id, formData);
      else await addNavigationLink(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ label: '', url: '#/', type: 'anchor', order_index: 1, is_active: true }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      label: item.label || '', 
      url: item.url || '#/', 
      type: item.type || 'anchor', 
      order_index: item.order_index || 1, 
      is_active: item.is_active !== false 
    });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Navigation className="w-6 h-6 text-[#6366f1]" /> Навигация <span className="text-sm text-[#4A6578]">({(navigationLinks || navigation || []).length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ label: '', url: '#/', type: 'anchor', order_index: 1, is_active: true }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>{message}</div>}
      <div className="space-y-3">
        {(navigationLinks || navigation || []).length === 0 ? <p className="text-center py-12 text-[#4A6578]">Нет элементов навигации</p> : (navigationLinks || navigation || []).sort((a, b) => a.order_index - b.order_index).map(link => (
          <div key={link.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-[#4A6578] cursor-move" />
              <div className="flex-1">
                <h3 className="font-bold">{link.label}</h3>
                <p className="text-sm text-[#4A6578]">{link.url}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded bg-[#6366f1]/10 text-[#6366f1]">{link.type}</span>
                  <span className="text-xs px-2 py-1 rounded bg-[#22c55e]/10 text-[#22c55e]">Порядок: {link.order_index}</span>
                  {link.is_active && <span className="text-xs px-2 py-1 rounded bg-[#22c55e]/10 text-[#22c55e]">Активен</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(link)} className="py-2 px-3 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if(confirm('Удалить?')) removeNavigationLink(link.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#F5FBFD] rounded-2xl border border-[#28B9D040] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} элемент навигации</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#B6E0EE] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <input placeholder="URL (например: #/schedule)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none">
                <option value="anchor">Якорь</option>
                <option value="external">Внешняя ссылка</option>
              </select>
              <input type="number" placeholder="Порядок" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 rounded-xl bg-white border border-[#28B9D040] focus:border-[#6366f1] focus:outline-none" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">Активен</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#B6E0EE] transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
