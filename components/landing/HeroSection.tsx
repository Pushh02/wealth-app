'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dashboardImage from '/src/assets/dashboard.png';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  return (
    <section className="relative hero-gradient pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
      <div 
        className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40"
        aria-hidden="true"
      >
        <div className="w-[40rem] h-[40rem] rounded-full bg-primary/20 animate-float blur-3xl" />
      </div>
      
      <div className="container relative z-10 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl md:mt-16 font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Smart Financial Monitoring</span>
            <br />for Modern Wealth Management
          </h1>
          <p className="text-lg md:text-xl mx-8 text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Real-time transaction alerts, automated oversight, and intelligent financial monitoring designed to protect and grow your wealth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="gap-2 text-base" onClick={() => router.push('/signup')}>
              Get Started <ArrowRight size={16} />
            </Button>
            <Button size="lg" variant="outline" className="text-base" onClick={() => router.push('/login')}>
              Watch Demo
            </Button>
          </div>
        </div>
        
        <div className="relative max-w-5xl mx-auto animate-scale-in w-[50%]" style={{ animationDelay: '0.6s' }}>
          <div className="relative bg-gradient-to-b from-primary/20 to-primary/0 rounded-2xl p-1">
            <div className="absolute inset-0 rounded-2xl backdrop-blur-sm bg-background/30 shadow-lg" />
            <img 
              src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=2620&q=80" 
              alt="Financial dashboard interface" 
              className="relative rounded-xl shadow-2xl w-full h-80 object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-card rounded-xl p-4 shadow-lg border flex gap-4 items-center glass-card">
            <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold">+</div>
            <div className="text-left">
              <div className="font-medium">Transaction Alert</div>
              <div className="text-sm text-muted-foreground">Unusual activity detected</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
