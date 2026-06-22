import { useState } from 'react';
import { Radio, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { signInAdmin, signUpAdmin } from '@/lib/supabase';

const COLORS = {
  bg: '#B6E0EE',
  primary: '#28B9D0',
  secondary: '#685096',
  text: '#1A2B3C',
  textMuted: '#4A6578',
  success: '#22c55e',
  error: '#ef4444',
};

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signInAdmin(email, password);

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        
        // Save to localStorage
        localStorage.setItem('cosmos_fm_admin', 'true');
        localStorage.setItem('cosmos_fm_admin_email', data.user.email);
        
        // Show success briefly
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // Call onLogin callback
          if (onLogin) {
            onLogin();
          } else {
            // Fallback: redirect to admin dashboard
            window.location.hash = '#/admin';
            window.location.reload();
          }
        }, 500);
      } else {
        setError('Неверные учетные данные');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('Ошибка подключения. Попробуйте снова.');
      setLoading(false);
    }
  };

  const handleAutoCreate = async () => {
    if (!email || !password) {
      setError('Введите email и пароль для создания аккаунта');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await signUpAdmin(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem('cosmos_fm_admin', 'true');
        localStorage.setItem('cosmos_fm_admin_email', data.user.email);
        
        if (onLogin) {
          onLogin();
        } else {
          window.location.hash = '#/admin';
          window.location.reload();
        }
      }
    } catch (err) {
      setError('Ошибка создания аккаунта');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.bg }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
            <Radio className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>Cosmos FM Admin</h1>
          <p style={{ color: COLORS.textMuted }}>Панель управления</p>
        </div>

        <div className="rounded-3xl p-8 shadow-xl" style={{ background: 'white' }}>
          {showSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.success }} />
              <p className="text-lg font-bold" style={{ color: COLORS.text }}>Успешный вход!</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#28B9D040] focus:border-[#28B9D0] focus:outline-none transition-colors"
                  placeholder="admin@cosmosfm.ru"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Пароль</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.textMuted }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#28B9D040] focus:border-[#28B9D0] focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Минимум 6 символов</p>
              </div>

              {error && (
                <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: '#fee2e2' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.error }} />
                  <p className="text-sm" style={{ color: COLORS.error }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Подключение...
                  </>
                ) : (
                  'Войти'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#28B9D040' }}>
            <p className="text-sm text-center mb-3" style={{ color: COLORS.textMuted }}>
              Первый вход автоматически создаст администратора в Supabase
            </p>
            <button
              onClick={handleAutoCreate}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'transparent',
                border: '2px solid #28B9D0',
                color: COLORS.primary
              }}
            >
              Создать аккаунт и войти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
