import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../api/client';
import type { UserInfo } from '../api/client';

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    location?: string;
    pincode?: string;
    company_name?: string;
  }) => Promise<void>;
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
    const validateSession = async () => {
      if (!authAPI.isLoggedIn()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authAPI.me();
        setUser(me);
      } catch {
        // Session is invalid (expired, user deleted, etc.)
        // Force-clear everything so fresh login works
        console.warn('[C0 Auth] Stale session detected — clearing tokens');
        localStorage.removeItem('c0_access_token');
        localStorage.removeItem('c0_refresh_token');
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
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

  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    location?: string;
    pincode?: string;
    company_name?: string;
  }) => {
    setError(null);
    try {
      await authAPI.register(payload);
      // Auto-login after registration
      await login(payload.username, payload.password);
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
