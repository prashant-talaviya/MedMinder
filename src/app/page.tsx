'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 text-center">
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto">
        <h1 className="text-5xl font-bold font-headline text-primary">
          MedMinder
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Never miss a dose again.
        </p>
        <div className="mt-8 w-full aspect-video relative">
          <Image
            src="https://picsum.photos/seed/medminder-welcome/600/400"
            alt="Person organizing pills"
            fill
            className="rounded-lg object-cover"
            data-ai-hint="health medicine"
          />
        </div>
        <div className="mt-8 w-full space-y-4">
          <Button asChild className="w-full rounded-full" size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild className="w-full rounded-full" size="lg" variant="outline">
            <Link href="/login">I Already Have an Account</Link>
          </Button>
        </div>
      </main>
      <footer className="py-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MedMinder. All rights reserved.</p>
      </footer>
    </div>
  );
}
