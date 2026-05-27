import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const initData = (window as any).Telegram?.WebApp?.initData || '';
    axios.get(`${API}/admin/me`, { headers: { 'x-telegram-init-data': initData } })
      .then(() => setOk(true))
      .catch(() => alert('❌ Доступ запрещен. Вы не в списке администраторов.'));
  }, []);

  if (!ok) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Проверка прав...</div>;
  return <>{children}</>;
}
