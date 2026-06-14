import { useState } from 'react';
import { Tag, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DataTable } from '@/admin/components/DataTable';
import { ModalForm } from '@/admin/components/ModalForm';
import type { Category } from '@/types/database';

const GRADIENT_OPTIONS = [
  'from-[#f59e0b] to-[#f97316]',
  'from-[#8b5cf6] to-[#6366f1]',
  'from-[#22c55e] to-[#14b8a6]',
  'from-[#3b82f6] to-[#06b6d4]',
  'from-[#ef4444] to-[#f97316]',
  'from-[#ec4899] to-[#8b5cf6]',
  'from-[#6366f1] to-[#8b5cf6]',
  'from-[#14b8a6] to-[#06b6d4]',
];

export function CategoriesPage() {
  const { categories, addCategory, editCategory, removeCategory } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleAdd = () => {
    setEditingCategory(undefined);
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    data.count = Number(data.count) || 0;
    
    if (editingCategory) {
      await editCategory(editingCategory.id, data);
    } else {
      await addCategory(data);
    }
    setModalOpen(false);
  };

  const formFields = [
    { name: 'name', label: 'Название', type: 'text' as const, required: true, placeholder: 'Например: Музыка' },
    { name: 'count', label: 'Кол-во передач', type: 'number' as const, required: true, placeholder: '156' },
    { name: 'color', label: 'Цвет', type: 'select' as const, options: GRADIENT_OPTIONS },
  ];

  const columns = [
    { key: 'name', header: 'Название', render: (c: Category) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
          <Tag className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium">{c.name}</span>
      </div>
    )},
    { key: 'count', header: 'Передач', render: (c: Category) => (
      <div className="flex items-center gap-1 text-sm text-[#71717a]">
        <Headphones className="w-3 h-3" /> {c.count}
      </div>
    )},
  ];

  return (
    <div>
      <DataTable
        title="Категории"
        items={categories}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={removeCategory}
        searchFields={['name']}
      />
      <ModalForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
        fields={formFields}
        initialData={editingCategory}
      />
    </div>
  );
}
