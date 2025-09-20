'use client';

import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hashing function for a mock user ID
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'user_' + Math.abs(hash).toString(16);
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
        const storedUser = localStorage.getItem('medminder-user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('medminder-user');
    }
    setLoading(false);
  }, []);


  const login = (name: string, email: string) => {
    const mockUser: User = {
      uid: simpleHash(email), // Create a consistent mock UID from the email
      name: name,
      email: email,
      avatarUrl: `https://i.pravatar.cc/150?u=${simpleHash(email)}`,
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
