"use client"
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "This platform has completely transformed how I monitor my business finances. The real-time alerts have saved us from several fraudulent transactions.",
    name: "Sarah Johnson",
    role: "CFO, TechVision Inc.",
    avatar: "SJ"
  },
  {
    quote: "The customizable rules engine is exactly what we needed. Now we can set specific parameters for different account types and get alerts that are actually relevant.",
    name: "Michael Chen",
    role: "Investment Manager",
    avatar: "MC"
  },
  {
    quote: "The multi-bank support is seamless. I can finally see all my accounts in one place with consistent monitoring across all of them.",
    name: "Emma Williams",
    role: "Small Business Owner",
    avatar: "EW"
  },
  {
    quote: "Bank-level security was our top priority when choosing a monitoring solution. WealthGuard delivers this alongside an incredibly intuitive interface.",
    name: "David Rodriguez",
    role: "Security Director",
    avatar: "DR"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted by Financial Professionals</h2>
          <p className="text-muted-foreground">
            See what our customers say about their experience with our financial monitoring platform.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full px-4">
                  <Card className="glass-card hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="pt-6 pb-8 px-6">
                      <div className="mb-6 text-xl italic">
                        "{testimonial.quote}"
                      </div>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-3 mt-8">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-3 h-3 p-0 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-muted'}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
