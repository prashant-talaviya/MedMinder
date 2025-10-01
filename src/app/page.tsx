'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  Camera, 
  History, 
  BellRing, 
  Shield, 
  Clock, 
  TrendingUp, 
  Heart, 
  CheckCircle, 
  Smartphone,
  Users,
  Star,
  Zap,
  Pill,
  Stethoscope,
  Calendar,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: BellRing,
    title: 'Smart Alarms',
    description: 'Intelligent reminders that never let you miss a dose. Get notified exactly when you need to take your medicine.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Medicine Safety',
    description: 'Check drug interactions, side effects, and get detailed information about your medications.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your health journey with detailed analytics, adherence rates, and achievement levels.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Calendar,
    title: 'Schedule Management',
    description: 'Organize multiple medications with flexible scheduling and automatic dose calculations.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Heart,
    title: 'Health Insights',
    description: 'Get personalized health recommendations and track your wellness journey over time.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Designed for your phone with offline support and instant notifications wherever you are.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
];

const stats = [
  { number: '99.2%', label: 'Adherence Rate' },
  { number: '50K+', label: 'Happy Users' },
  { number: '1M+', label: 'Doses Tracked' },
  { number: '4.9★', label: 'User Rating' },
];

const testimonials = [
  {
    name: 'Saran Kishan',
    role: 'Diabetes Patient',
    content: 'MedMinder has completely transformed how I manage my medication. I never miss a dose anymore!',
    rating: 5,
  },
  {
    name: 'Michael R',
    role: 'Elderly Care',
    content: 'The smart reminders and easy interface make it perfect for my daily medication routine.Very Useful App!',
    rating: 5,
  },
  {
    name: 'Dr. Rajat T',
    role: 'Family Physician',
    content: 'I recommend MedMinder to all my patients. The adherence tracking helps improve health outcomes.',
    rating: 5,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Left gradient */}
        <div className="absolute left-0 top-0 w-96 h-full bg-gradient-to-r from-blue-100/30 to-transparent pointer-events-none"></div>
        {/* Right gradient */}
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-purple-100/30 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Trusted by 50,000+ Users
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold font-headline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              MedMinder
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your personal medication companion. Never miss a dose again with intelligent reminders, 
              medicine safety checks, and comprehensive health tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full">
                <Link href="/signup" className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-3 rounded-full border-2">
                <Link href="/login" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  I Already Have an Account
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline mb-4">
              Everything You Need for Medication Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From smart reminders to safety checks, we've got all the tools you need to stay healthy and on track.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline mb-4">
              Loved by Patients & Healthcare Providers
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their MedMinder experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold font-headline text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who never miss a dose again. Start your health journey today with MedMinder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full">
              <Link href="/signup" className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full">
              <Link href="/login" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
     {/* Footer */}
<footer className="py-12 bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="flex items-center justify-center gap-2 mb-4">
      <Pill className="h-6 w-6" />
      <span className="text-xl font-bold">MedMinder</span>
    </div>
    <p className="text-gray-400 mb-4">
      Your trusted medication management companion
    </p>
    <p className="text-sm text-gray-500">
      &copy; {new Date().getFullYear()} MedMinder. All rights reserved.
    </p>

    <div className="flex justify-center items-center gap-3 mt-4">
      <p className="text-sm text-gray-500">
        Developed by <a href="https://prashanttalaviya.netlify.app/" target="_blank" rel="noopener noreferrer">Prashant Talaviya</a>
      </p>
      
      <a href="https://github.com/prashant-talaviya" target="_blank" rel="noopener noreferrer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-gray-400 hover:text-white transition-colors"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>

      <a href="https://www.linkedin.com/in/prashant-talaviya/" target="_blank" rel="noopener noreferrer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-gray-400 hover:text-white transition-colors"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>
    </div>

  </div>
</footer>
    </div>
  );
}
