import React from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Page;
