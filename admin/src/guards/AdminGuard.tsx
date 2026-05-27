import { useEffect, useState } from 'react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Временно пропускаем всех для теста
    setOk(true);
  }, []);

  if (!ok) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Загрузка...</div>;
  return <>{children}</>;
}