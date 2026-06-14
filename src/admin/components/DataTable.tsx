import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  items: T[];
  columns: Column<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  searchFields?: string[];
}

export function DataTable<T extends { id: string }>({
  title, items, columns, onAdd, onEdit, onDelete, searchFields = ['title', 'name']
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = items.filter((item: any) => {
    if (!search) return true;
    return searchFields.some(field => 
      item[field]?.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Поиск..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27273a]">
                {columns.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-sm text-[#a1a1aa] font-medium">{col.header}</th>
                ))}
                <th className="text-right px-4 py-3 text-sm text-[#a1a1aa] font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-8 text-[#71717a]">
                    {search ? 'Ничего не найдено' : 'Нет записей'}
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="border-b border-[#27273a]/50 hover:bg-[#13131f]/50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg hover:bg-[#6366f1]/20 text-[#6366f1] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 rounded-lg bg-[#ef4444] text-white text-sm hover:bg-[#dc2626] transition-colors"
                            >
                              Да
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 rounded-lg bg-[#27273a] text-sm hover:bg-[#1e1e2e] transition-colors"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 rounded-lg hover:bg-[#ef4444]/20 text-[#ef4444] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#71717a]">
            Показано {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} из {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#13131f] border border-[#27273a] disabled:opacity-50 hover:border-[#6366f1]/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#a1a1aa]">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#13131f] border border-[#27273a] disabled:opacity-50 hover:border-[#6366f1]/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
