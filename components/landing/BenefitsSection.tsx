
import React from 'react';
import { Check } from 'lucide-react';

const benefits = [
  "Instant transaction alerts for unusual activity",
  "Customizable threshold rules for different account types",
  "Multi-bank account support across major institutions",
  "Bank-level security and data encryption",
  "Smart automated approval system for transactions",
  "Detailed transaction history with powerful search"
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-secondary/50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Choose WealthGuard?</h2>
            <p className="text-muted-foreground mb-8">
              Our platform combines advanced technology with intuitive design to give you the most comprehensive financial monitoring solution available.
            </p>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-primary/20 p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl opacity-30"></div>
            <div className="relative bg-card rounded-xl overflow-hidden border shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium">Transaction Overview</h3>
                  <div className="text-sm text-muted-foreground">Last 30 days</div>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/20 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full bg-primary/70" />
                        </div>
                        <div>
                          <div className="font-medium">Online Purchase</div>
                          <div className="text-sm text-muted-foreground">Amazon.com</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">$142.58</div>
                        <div className="text-sm text-muted-foreground">Apr 15, 2025</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center gap-x-2">
                    <div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap truncate">Monthly Spending</div>
                      <div className="text-2xl font-bold">$2,854.43</div>
                    </div>
                    <div className="p-2 rounded-full bg-green-500/20 text-green-600 font-medium text-sm whitespace-nowrap truncate">
                      -12% from last month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
