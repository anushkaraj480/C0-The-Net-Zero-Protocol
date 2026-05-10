import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/client';
import type { UserInfo } from '../api/client';

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    if (authAPI.isLoggedIn()) {
      authAPI.me()
        .then(setUser)
        .catch(() => {
          authAPI.logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      await authAPI.login(username, password);
      const me = await authAPI.me();
      setUser(me);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid credentials';
      setError(msg);
      throw err;
    }
  };

  const register = async (username: string, email: string, password: string, role = 'farmer') => {
    setError(null);
    try {
      await authAPI.register({ username, email, password, role });
      // Auto-login after registration
      await login(username, password);
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        const firstError = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
        setError(`${firstKey}: ${firstError}`);
      } else {
        setError('Registration failed');
      }
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      register,
      logout,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
