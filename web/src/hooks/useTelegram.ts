import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [initData, setInitData] = useState('');
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const w = window as any;
    if (w.Telegram?.WebApp) {
      const app = w.Telegram.WebApp;
      app.ready();
      app.expand();
      app.setHeaderColor('#0f0f1a');
      app.setBackgroundColor('#0f0f1a');
      setTg(app);
      setInitData(app.initData);
      if (app.initDataUnsafe?.user) setUser(app.initDataUnsafe.user);
    }
  }, []);

  return { tg, initData, user };
}
