import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { DataTable } from '@/admin/components/DataTable';
import { ModalForm } from '@/admin/components/ModalForm';
import type { Host } from '@/types/database';

const HOTELS = ['Cosmos Moscow', 'Cosmos St. Petersburg', 'Cosmos Sochi', 'Cosmos Collection'];
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

export function HostsPage() {
  const { hosts, addHost, editHost, removeHost } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | undefined>();

  const handleAdd = () => {
    setEditingHost(undefined);
    setModalOpen(true);
  };

  const handleEdit = (host: Host) => {
    setEditingHost(host);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    // Generate initials from name
    const nameParts = data.name.split(' ');
    data.initials = nameParts.map((p: string) => p[0]).join('').toUpperCase();
    
    if (editingHost) {
      await editHost(editingHost.id, data);
    } else {
      await addHost(data);
    }
    setModalOpen(false);
  };

  const formFields = [
    { name: 'name', label: 'Имя', type: 'text' as const, required: true, placeholder: 'Анна Петрова' },
    { name: 'role', label: 'Должность', type: 'text' as const, required: true, placeholder: 'Ведущая утреннего шоу' },
    { name: 'hotel', label: 'Отель', type: 'select' as const, required: true, options: HOTELS },
    { name: 'bio', label: 'Биография', type: 'textarea' as const, placeholder: 'Краткая биография' },
    { name: 'schedule', label: 'Расписание', type: 'text' as const, placeholder: 'Пн, Ср, Пт 07:00' },
    { name: 'color', label: 'Цвет аватара', type: 'select' as const, options: GRADIENT_OPTIONS },
  ];

  const columns = [
    { key: 'name', header: 'Имя', render: (h: Host) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${h.color} flex items-center justify-center`}>
          <span className="text-xs font-bold text-white">{h.initials}</span>
        </div>
        <span className="font-medium">{h.name}</span>
      </div>
    )},
    { key: 'role', header: 'Должность' },
    { key: 'hotel', header: 'Отель' },
    { key: 'schedule', header: 'Расписание' },
  ];

  return (
    <div>
      <DataTable
        title="Ведущие"
        items={hosts}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={removeHost}
        searchFields={['name', 'role', 'hotel']}
      />
      <ModalForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingHost ? 'Редактировать ведущего' : 'Новый ведущий'}
        fields={formFields}
        initialData={editingHost}
      />
    </div>
  );
}
