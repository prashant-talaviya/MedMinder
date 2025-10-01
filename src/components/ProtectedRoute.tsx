'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need to be logged in to access this page.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/signup')}
              className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
