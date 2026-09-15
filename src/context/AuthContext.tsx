import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthState {
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<(AuthState & {
  refresh: () => Promise<boolean>;
  signOut: () => Promise<void>;
}) | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: true, isAdmin: false, error: null });
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        if (request === generation.current) setState({ loading: false, isAdmin: false, error: null });
        return false;
      }
      // The RPC derives identity from the verified JWT; browser flags have no authority.
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      const isAdmin = data === true;
      if (request === generation.current) setState({ loading: false, isAdmin, error: isAdmin ? null : 'У аккаунта нет прав администратора.' });
      return isAdmin;
    } catch {
      if (request === generation.current) setState({ loading: false, isAdmin: false, error: 'Не удалось проверить права доступа. Попробуйте снова.' });
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Avoid awaiting Supabase operations inside its auth lock.
      queueMicrotask(() => { if (active) void refresh(); });
    });
    void refresh();
    const invalidate = () => { generation.current++; };
    return () => { active = false; invalidate(); subscription.unsubscribe(); };
  }, [refresh]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Не удалось выйти из аккаунта. Повторите попытку.');
    generation.current++;
    setState({ loading: false, isAdmin: false, error: null });
    localStorage.removeItem('cosmos_fm_admin');
    localStorage.removeItem('cosmos_fm_admin_email');
  }, []);

  return <AuthContext.Provider value={{ ...state, refresh, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
