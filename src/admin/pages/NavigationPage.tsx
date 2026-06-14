import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Link2, Trash2, Edit, X, GripVertical } from 'lucide-react';

export function NavigationPage() {
  const { navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.label || !formData.url) {
      setMessage('❌ Заполните название и URL');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editNavigationLink(editingItem.id, formData);
        setMessage('✅ Ссылка обновлена!');
      } else {
        await addNavigationLink(formData);
        setMessage('✅ Ссылка добавлена!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить ссылку?')) {
      await removeNavigationLink(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Навигация</h1>
          <span className="text-sm text-[#71717a]">({navigationLinks.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ type: 'anchor', target: '_self', is_active: true, order_index: navigationLinks.length + 1 }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {navigationLinks.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет ссылок. Добавьте первую!</p>
          </div>
        ) : (
          navigationLinks.map(link => (
            <div key={link.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-[#71717a]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{link.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    link.type === 'internal' ? 'bg-[#6366f1]/20 text-[#6366f1]' :
                    link.type === 'external' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                    'bg-[#22c55e]/20 text-[#22c55e]'
                  }`}>{link.type}</span>
                </div>
                <p className="text-sm text-[#71717a] truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(link)} className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(link.id)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} ссылка</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.label || ''} onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="Расписание" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">URL *</label>
                <input type="text" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="#/schedule" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Тип</label>
                  <select value={formData.type || 'anchor'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none">
                    <option value="anchor">Якорь</option>
                    <option value="internal">Внутренняя</option>
                    <option value="external">Внешняя</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Порядок</label>
                  <input type="number" value={formData.order_index || 0} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active || false} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 accent-[#6366f1]" />
                <span className="text-sm">Активна</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}