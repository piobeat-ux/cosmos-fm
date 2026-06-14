import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Building2, Trash2, Edit, X } from 'lucide-react';

export function HotelsPage() {
  const { hotels, addHotel, editHotel, removeHotel } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.city) {
      setMessage('❌ Заполните название и город');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editHotel(editingItem.id, formData);
        setMessage('✅ Отель обновлён!');
      } else {
        await addHotel(formData);
        setMessage('✅ Отель добавлен!');
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
    if (confirm('Удалить отель?')) {
      await removeHotel(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Отели</h1>
          <span className="text-sm text-[#71717a]">({hotels.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl ${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#71717a]">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет отелей. Добавьте первый!</p>
          </div>
        ) : (
          hotels.map(hotel => (
            <div key={hotel.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{hotel.name}</h3>
                  <p className="text-sm text-[#6366f1]">{hotel.city}</p>
                  {hotel.address && <p className="text-xs text-[#71717a] mt-1 truncate">{hotel.address}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(hotel)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm">
                  <Edit className="w-4 h-4 inline mr-1" /> Изменить
                </button>
                <button onClick={() => handleDelete(hotel.id)} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} отель</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Город *</label>
                <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Адрес</label>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
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