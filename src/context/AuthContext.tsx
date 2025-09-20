'use client';

import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('medminder-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('medminder-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (name: string) => {
    const mockUser: User = {
      uid: 'mock-user-123',
      name: name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
    };
    localStorage.setItem('medminder-user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('medminder-user');
    setUser(null);
    router.push('/');
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
