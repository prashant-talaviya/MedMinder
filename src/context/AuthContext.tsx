'use client';

import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Award } from 'lucide-react';

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // For this demo, we'll keep using a simplified user object stored in localStorage
        // to retain the name, as anonymous auth doesn't have display names by default.
        const storedUser = localStorage.getItem('medminder-user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if(parsedUser.uid === firebaseUser.uid) {
            setUser(parsedUser);
          } else {
            // If the UID doesn't match, something is wrong. Clear it.
             localStorage.removeItem('medminder-user');
             // We'll handle this case as a new user in the login function
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const login = (name: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        // This should not happen if anonymous sign-in worked.
        console.error("No firebase user found");
        return;
    }

    const mockUser: User = {
      uid: firebaseUser.uid,
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
    auth.signOut();
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
