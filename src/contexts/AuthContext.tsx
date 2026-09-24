import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, LoginResponse } from '../types/auth';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialização síncrona diretamente do localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@T4English:user');
    const storedToken = localStorage.getItem('@T4English:token');
    return storedUser && storedToken ? JSON.parse(storedUser) : null;
  });

  const login = (data: LoginResponse) => {
    const userData = {
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('@T4English:token', data.token);
    localStorage.setItem('@T4English:user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('@T4English:token');
    localStorage.removeItem('@T4English:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);