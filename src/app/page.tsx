
'use client';

import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">AchieveIT</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-headline text-primary mb-4">
            Your Personal Goal Tracker
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Set, track, and achieve your goals with AchieveIT. Your companion for a more organized, productive, and fulfilling life.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-6 border-t text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-center gap-4">
            <div className="flex flex-col items-center">
                <Image
                    src="/gtu-logo.png"
                    alt="GTU Logo"
                    width={60}
                    height={60}
                    data-ai-hint="university logo"
                    className="rounded-full"
                />
                <p className="text-xs mt-2">Gujarat Technological University</p>
            </div>
            <div className="text-center text-xs md:text-sm">
                <p className="font-semibold text-foreground">A Design Engineering Project</p>
                <p>Khan Saood Ahemd, Varude Dhiraj, Patil Aratiben, Chaudhary Abdullah, &amp; Jibhai Mahmad Salim</p>
                <p className="mt-2 text-xs">Guided by Prof. Mrs. Tanvi Patel | Prime Institute of Engineering and Technology | 2024-2025</p>
            </div>
            <div className="flex flex-col items-center">
                 <Image
                    src="/prime-logo.png"
                    alt="Prime College Logo"
                    width={60}
                    height={60}
                    data-ai-hint="college logo"
                    className="rounded-full"
                />
                <p className="text-xs mt-2">Prime Institute of Engineering and Technology</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
