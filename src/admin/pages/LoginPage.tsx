import { useState, type FormEvent } from 'react';
import { Radio, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { refresh, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError || !data.session) throw new Error('Не удалось войти. Проверьте email и пароль.');
      if (!await refresh()) setError('Вход выполнен, но доступ к панели не подтверждён.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ошибка подключения. Попробуйте снова.');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#B6E0EE]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Radio className="w-14 h-14 mx-auto mb-4 text-[#685096]" />
          <h1 className="text-3xl font-bold text-[#1A2B3C]">Cosmos FM</h1>
          <p className="text-[#4A6578]">Вход в панель управления</p>
        </div>
        <form onSubmit={handleLogin} className="rounded-3xl p-8 shadow-xl bg-white space-y-5">
          <label className="block">Email
            <input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required disabled={loading} className="w-full mt-2 px-4 py-3 rounded-xl border border-[#28B9D0]" />
          </label>
          <label className="block">Пароль
            <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={loading} className="w-full mt-2 px-4 py-3 rounded-xl border border-[#28B9D0]" />
          </label>
          {(error || authError) && <p role="alert" className="text-sm text-red-700">{error || authError}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl py-3 bg-[#685096] text-white font-bold disabled:opacity-50">
            {loading ? <Loader2 aria-label="Выполняется вход" className="w-5 h-5 mx-auto animate-spin" /> : 'Войти'}
          </button>
          <p className="text-xs text-[#4A6578]">Доступ предоставляется администратором радиостанции.</p>
          <a href="#/" className="block text-sm text-[#685096] underline">Вернуться на сайт</a>
        </form>
      </div>
    </main>
  );
}
