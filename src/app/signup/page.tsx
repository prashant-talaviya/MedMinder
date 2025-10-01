'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import BGImage from '../../../src/img/background.png';
import Header from '@/components/Header';

export default function SignupPage() {
  const { signup, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      setIsLoading(true);
      const result = await signup(name, email, password);
      setIsLoading(false);
      
      if (!result.success) {
        toast({
          title: "Signup Failed",
          description: result.error || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${BGImage.src})` }}>
      <Header />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Start your journey to better health management.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
