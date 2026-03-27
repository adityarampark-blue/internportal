import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/data/types';
import { login as apiLogin } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  loginAsync?: (email: string, password: string) => Promise<{ id: string; email: string; name: string; role: string; approved: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    try {
      return { success: false, message: 'Use async login via API' };
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, message: err.message };
      }
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => setUser(null);

  const loginAsync = async (email: string, password: string) => {
    const resp = await apiLogin({ email, password });
    const u: User = { id: resp.id, email: resp.email, name: resp.name, role: resp.role, approved: !!resp.approved };
    setUser(u);
    return resp;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loginAsync }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
