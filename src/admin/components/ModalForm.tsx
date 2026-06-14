import { X } from 'lucide-react';
import { useEffect } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'time';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FormField[];
  initialData?: any;
}

export function ModalForm({ isOpen, onClose, onSubmit, title, fields, initialData }: ModalFormProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        data[field.name] = formData.get(field.name) === 'on';
      } else if (field.type === 'number') {
        data[field.name] = Number(formData.get(field.name));
      } else {
        data[field.name] = formData.get(field.name);
      }
    });
    if (initialData?.id) {
      data.id = initialData.id;
    }
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27273a]">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#13131f] transition-colors">
            <X className="w-5 h-5 text-[#71717a]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-[#a1a1aa] mb-2">
                {field.label}
                {field.required && <span className="text-[#ef4444] ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  defaultValue={initialData?.[field.name] || ''}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors resize-none"
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  defaultValue={initialData?.[field.name] || ''}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors"
                >
                  <option value="">Выберите...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={initialData?.[field.name] || false}
                    className="w-5 h-5 rounded border-[#27273a] bg-[#13131f] text-[#6366f1] focus:ring-[#6366f1]"
                  />
                  <span className="text-sm text-[#a1a1aa]">Включено</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  defaultValue={initialData?.[field.name] || ''}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors"
                />
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#27273a]">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">
              Отмена
            </button>
            <button type="submit" className="flex-1 btn-primary py-3">
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
