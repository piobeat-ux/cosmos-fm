import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Показываем промпт через 5 секунд после загрузки
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-28 z-40 max-w-sm">
      <div className="glass-card rounded-2xl p-4 border border-[#6366f1]/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">Установить Cosmos FM</h3>
            <p className="text-xs text-[#a1a1aa] mb-3">
              Добавьте приложение на главный экран для быстрого доступа
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#8b5cf6] transition"
              >
                Установить
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 rounded-lg bg-[#27273a] text-[#a1a1aa] text-sm hover:bg-[#3f3f5a] transition"
              >
                Позже
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 text-[#71717a] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
