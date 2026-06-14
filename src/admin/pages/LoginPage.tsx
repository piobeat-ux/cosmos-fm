import { useState } from 'react';
import { Radio, Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { signIn, signUp, supabase } from '@/lib/supabase';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase не подключен. Проверьте .env файл');
      }

      // Пробуем войти
      try {
        await signIn(email, password);
        localStorage.setItem('cosmos_fm_admin', 'true');
        onLogin();
        return;
      } catch (signInErr: any) {
        // Если пользователь не найден - регистрируем
        if (signInErr.message.includes('Invalid login') || 
            signInErr.message.includes('not found') ||
            signInErr.message.includes('credentials')) {
          try {
            await signUp(email, password);
            setMessage('✅ Аккаунт создан! Первый пользователь получает роль admin.');
            await signIn(email, password);
            localStorage.setItem('cosmos_fm_admin', 'true');
            onLogin();
            return;
          } catch (signUpErr: any) {
            throw signUpErr;
          }
        }
        throw signInErr;
      }
    } catch (err: any) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4">
            <Radio className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Cosmos FM</h1>
          <p className="text-[#71717a]">Административная панель</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors"
                  placeholder="admin@cosmosfm.ru"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#a1a1aa] mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none transition-colors"
                  placeholder="Минимум 6 символов"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                <p className="text-sm text-[#ef4444]">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                <p className="text-sm text-[#22c55e]">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Загрузка...' : 'Войти / Создать админа'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20">
            <p className="text-sm text-[#a1a1aa]">
              💡 Первый вход автоматически создаст администратора
            </p>
          </div>
        </div>

        <button
          onClick={() => { window.location.hash = ''; }}
          className="w-full text-center mt-4 text-sm text-[#71717a] hover:text-white transition-colors"
        >
          ← Вернуться на сайт
        </button>
      </div>
    </div>
  );
}