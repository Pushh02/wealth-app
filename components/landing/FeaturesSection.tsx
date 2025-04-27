
import React from 'react';
import { Activity, Bell, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <Activity className="h-10 w-10 text-blue-500" />,
    title: "Real-time Transaction Monitoring",
    description: "Track all financial activities across your accounts with instant visibility into every transaction as it happens."
  },
  {
    icon: <Bell className="h-10 w-10 text-purple-500" />,
    title: "Customizable Alert Rules",
    description: "Create personalized thresholds and criteria for notifications, ensuring you only get alerts for what matters to you."
  },
  {
    icon: <Shield className="h-10 w-10 text-green-500" />,
    title: "Secure Bank Integration",
    description: "Connect securely to thousands of financial institutions through Plaid's trusted API and bank-level encryption."
  },
  {
    icon: <Clock className="h-10 w-10 text-orange-500" />,
    title: "Automated Approval Workflow",
    description: "Streamline transaction reviews with intelligent routing and automated approvals based on your custom rules."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Financial Monitoring Features</h2>
          <p className="text-muted-foreground">
            Our comprehensive toolset gives you complete visibility and control over your financial ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="gradient-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
