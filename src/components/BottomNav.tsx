
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, History, Stethoscope, Pill, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/medicines', icon: Pill, label: 'Medicines' },
  { href: '/add-medicine', icon: PlusCircle, label: 'Add' },
  { href: '/lookup', icon: Stethoscope, label: 'Checker' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/80 backdrop-blur-sm md:hidden">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors w-1/4',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
