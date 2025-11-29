/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    await authService.login(credentials);
    await fetchUser();
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    // After registration, automatically log them in
    await login({ username: data.username, password: data.password });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Re-export useAuth for backward compatibility
export { useAuth } from '../hooks/useAuth';
