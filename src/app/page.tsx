'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Camera, History, BellRing } from 'lucide-react';

const features = [
  {
    icon: BellRing,
    title: 'Smart Reminders',
    description: 'Never miss a dose with intelligent and timely notifications.',
  },
  {
    icon: Camera,
    title: 'AI-Powered Setup',
    description: 'Snap a photo of your medicine, and let our AI fill in the details.',
  },
  {
    icon: Award,
    title: 'Track Your Progress',
    description: 'Monitor your adherence and earn points for consistency.',
  },
  {
    icon: History,
    title: 'View Your History',
    description: 'Keep a log of all your medication intake for you and your doctor.',
  },
];


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
      <main className="flex flex-col items-center flex-1 w-full max-w-2xl mx-auto py-12">
        <h1 className="text-5xl font-bold font-headline text-primary">
          MedMinder
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Never miss a dose again.
        </p>
        <div className="mt-8 w-full aspect-video relative">
          <Image
            src="https://picsum.photos/seed/medication-stress/600/400"
            alt="A person looking overwhelmed by different medications"
            fill
            className="rounded-lg object-cover"
            data-ai-hint="medication stress"
          />
        </div>

        <div className="mt-12 w-full text-left">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-12 w-full max-w-md space-y-4">
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
