import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function DemoWarning() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-2xl p-4 shadow-2xl border-2 border-white/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Демо режим</h3>
            <p className="text-sm text-white/90 mb-2">
              Supabase недоступен. Показаны демонстрационные данные.
            </p>
            <p className="text-xs text-white/70">
              Проверьте подключение к базе данных в настройках проекта.
            </p>
          </div>
          <button 
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
