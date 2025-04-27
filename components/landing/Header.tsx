"use client"
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 py-4",
        isScrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-sm dark:bg-slate-900/80" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600"></div>
          <span className="font-bold text-xl">SmartWealth</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <a href="#features" className="font-medium hover:text-primary transition-colors">Features</a>
            <a href="#benefits" className="font-medium hover:text-primary transition-colors">Benefits</a>
            <a href="#testimonials" className="font-medium hover:text-primary transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/login')}>Log In</Button>
            <Button onClick={() => router.push('/signup')}>Get Started</Button>
          </div>
        </div>
        
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white dark:bg-slate-900 z-40 p-4">
          <nav className="flex flex-col gap-4">
            <a 
              href="#features" 
              className="font-medium text-lg p-2 hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#benefits" 
              className="font-medium text-lg p-2 hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefits
            </a>
            <a 
              href="#testimonials" 
              className="font-medium text-lg p-2 hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>Log In</Button>
              <Button className="w-full" onClick={() => router.push('/signup')}>Get Started</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
