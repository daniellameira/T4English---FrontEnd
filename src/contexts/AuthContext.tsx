import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LoginResponse, User } from '../types/auth';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'PROFESSOR' || user.role === 'STUDENT')
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@T4English:user');
    const storedToken = localStorage.getItem('@T4English:token');

    if (!storedUser || !storedToken) {
      return null;
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUser);
      return isUser(parsedUser) ? parsedUser : null;
    } catch {
      localStorage.removeItem('@T4English:token');
      localStorage.removeItem('@T4English:user');
      return null;
    }
  });

  const login = (data: LoginResponse) => {
    localStorage.setItem('@T4English:token', data.token);
    localStorage.setItem('@T4English:user', JSON.stringify(data.user));
    setUser(data.user);
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