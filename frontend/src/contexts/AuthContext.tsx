/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '../types';

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

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    await authService.login(credentials);
    await fetchUser();
  }, [fetchUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
    // After registration, automatically log them in
    await login({ username: data.username, password: data.password });
  }, [login]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refetchUser: fetchUser,
    }),
    [user, isLoading, login, register, logout, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Re-export useAuth for backward compatibility
export { useAuth } from '../hooks/useAuth';
