import { useState } from 'react';
import { Radio, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { signInAdmin, signUpAdmin } from '@/lib/supabase';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'idle' | 'signing' | 'creating' | 'done'>('idle');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log(' Login attempt:', email);

    if (!email || !password) {
      setError('Введите email и пароль');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      // Шаг 1: Пробуем войти
      setStep('signing');
      console.log('📡 Attempting sign in...');
      
      try {
        const signInResult = await signInAdmin(email, password);
        
        if (signInResult.user) {
          console.log('✅ Login successful!');
          setSuccess('Вход выполнен успешно!');
          setStep('done');
          
          setTimeout(() => {
            localStorage.setItem('cosmos_fm_admin', 'true');
            localStorage.setItem('cosmos_fm_user', JSON.stringify(signInResult.user));
            onLogin();
          }, 1000);
          
          return;
        }
      } catch (signInError) {
        console.warn('⚠️  Sign in failed:', signInError.message);
        
        // Если пользователь не найден - создаем
        if (signInError.message?.includes('Invalid login credentials') || 
            signInError.message?.includes('not found')) {
          
          setStep('creating');
          console.log('📝 Creating new admin...');
          
          try {
            const signUpResult = await signUpAdmin(email, password);
            
            if (signUpResult.user) {
              console.log('✅ Admin created!');
              setSuccess('Администратор создан! Выполняется вход...');
              setStep('done');
              
              // Сразу входим после создания
              setTimeout(async () => {
                try {
                  const signInResult = await signInAdmin(email, password);
                  if (signInResult.user) {
                    localStorage.setItem('cosmos_fm_admin', 'true');
                    localStorage.setItem('cosmos_fm_user', JSON.stringify(signInResult.user));
                    onLogin();
                  }
                } catch (err) {
                  console.error('Auto sign-in failed:', err);
                  setError('Админ создан, но вход не удался. Попробуйте войти вручную.');
                  setLoading(false);
                  setStep('idle');
                }
              }, 2000);
              
              return;
            }
          } catch (signUpError) {
            console.error('❌ Sign up failed:', signUpError);
            
            if (signUpError.message?.includes('rate limit')) {
              setError('Слишком много попыток. Подождите минуту и попробуйте снова.');
            } else if (signUpError.message?.includes('already registered')) {
              setError('Пользователь уже существует. Попробуйте войти.');
            } else {
              setError('Ошибка создания: ' + signUpError.message);
            }
            
            setLoading(false);
            setStep('idle');
            return;
          }
        } else {
          throw signInError;
        }
      }
    } catch (err) {
      console.error(' Login error:', err);
      setError('Ошибка: ' + err.message);
      setLoading(false);
      setStep('idle');
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'signing': return 'Подключение...';
      case 'creating': return 'Создание администратора...';
      case 'done': return 'Готово!';
      default: return 'Войти / Создать админа';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${COLORS.bg} 0%, #E0F4F8 100%)` }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ 
            background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`
          }}>
            <Radio className="w-10 h-10" style={{ color: COLORS.white }} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.text }}>Cosmos FM Admin</h1>
          <p style={{ color: COLORS.textMuted }}>Панель управления</p>
        </div>

        <div className="backdrop-blur-xl rounded-3xl border-2 p-8 shadow-2xl" style={{ 
          background: COLORS.white + 'F0',
          borderColor: COLORS.neppy + '40'
        }}>
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ 
              background: '#EF444415',
              border: '1px solid #EF444430'
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ 
              background: '#22C55E15',
              border: '1px solid #22C55E30'
            }}>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
              <p className="text-sm" style={{ color: '#22C55E' }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textMuted }}>
                  <span className="text-lg"></span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cosmosfm.ru"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition"
                  style={{ 
                    background: COLORS.white,
                    borderColor: COLORS.neppy + '40',
                    color: COLORS.text,
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>Пароль</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textMuted }}>
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition"
                  style={{ 
                    background: COLORS.white,
                    borderColor: COLORS.neppy + '40',
                    color: COLORS.text,
                  }}
                  disabled={loading}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                Минимум 6 символов
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})`,
                color: COLORS.white,
                boxShadow: `0 4px 15px ${COLORS.purple}40`
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{getStepText()}</span>
                </>
              ) : (
                <span>Войти / Создать админа</span>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border" style={{ 
            background: COLORS.neppy + '10',
            borderColor: COLORS.neppy + '30'
          }}>
            <p className="text-xs flex items-start gap-2" style={{ color: COLORS.text }}>
              <span>💡</span>
              <span>
                <strong>Первый вход</strong> автоматически создаст администратора в Supabase. 
                Используйте тот же email и пароль для последующих входов.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
