import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThiingsIcon from '@/components/ThiingsIcon';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Brain, TrendingUp, Shield, DollarSign } from 'lucide-react';

const SeedVault = () => {
  const { user, profile } = useUnifiedAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'SeedVault Basic',
      price: 'Free',
      description: 'Essential financial tracking and basic insights',
      features: [
        'Connect up to 2 bank accounts',
        'Basic spending categorization',
        'Monthly reports',
        'Bill reminders',
        'Basic savings goals'
      ],
      icon: 'shield3D',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-400'
    },
    {
      id: 'plus',
      name: 'SeedVault+',
      price: '$19/mo',
      description: 'Advanced financial management with automation',
      features: [
        'Unlimited account connections',
        'Advanced spending analysis',
        'Investment tracking',
        'Credit score monitoring',
        'Automated bill management',
        'Debt optimization tools',
        'Weekly AI insights'
      ],
      icon: 'gem3D',
      color: 'text-orange-400',
      borderColor: 'border-orange-400',
      popular: true
    },
    {
      id: 'grim-ai',
      name: 'SeedVault+ Grim AI',
      price: '$49/mo',
      description: 'AI-powered financial advisor with personalized strategies',
      features: [
        'Everything in SeedVault+',
        'Grim AI financial advisor',
        'Predictive spending alerts',
        'Automated investment rebalancing',
        'Tax optimization suggestions',
        'Real-time market analysis',
        'Custom financial planning',
        '24/7 AI financial chat support'
      ],
      icon: 'skull3D',
      color: 'text-purple-400',
      borderColor: 'border-purple-400'
    }
  ];

  const handleGetStarted = (planId: string) => {
    if (!user && !profile) {
      navigate('/auth');
      return;
    }
    setSelectedPlan(planId);
    // TODO: Integrate Stripe checkout
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="SeedVault" />
      
      <main className="px-6 py-16 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <ThiingsIcon name="vault3D" size={64} className="mr-4 text-cyan-400" />
            <h1 className="text-5xl md:text-7xl font-bold font-mono text-cyan-400">
              SeedVault
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Your comprehensive financial command center. Track, analyze, optimize, and grow your wealth with AI-powered insights.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Smart Analytics</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Bank-Level Security</p>
            </div>
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">AI-Powered</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Wealth Building</p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-mono text-center mb-12 text-orange-400">
            Revolutionary Financial Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'datacenter',
                title: 'Banking Analysis',
                description: 'Deep dive into spending patterns, cash flow analysis, and automated categorization of all transactions.'
              },
              {
                icon: 'creditCard3D',
                title: 'Bill Management',
                description: 'Smart bill tracking, payment automation, and optimization suggestions to reduce monthly expenses.'
              },
              {
                icon: 'trendUp3D',
                title: 'Investment Advisory',
                description: 'AI-powered portfolio recommendations for stocks, crypto, and traditional investments.'
              },
              {
                icon: 'shield3D',
                title: 'Credit Monitoring',
                description: 'Real-time credit score tracking with personalized improvement strategies and debt relief planning.'
              },
              {
                icon: 'wallet3D',
                title: 'Crypto Integration',
                description: 'Seamless crypto-to-fiat transfers with automated allowances based on spending patterns.'
              },
              {
                icon: 'robot3D',
                title: 'Grim AI Advisor',
                description: 'Your personal AI financial advisor available 24/7 for complex financial planning and advice.'
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                <CardHeader>
                  <ThiingsIcon name={feature.icon} size={32} className="text-cyan-400 mb-2" />
                  <CardTitle className="text-cyan-400 font-mono">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-mono text-center mb-12 text-orange-400">
            Choose Your Financial Future
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-gray-900 ${plan.borderColor} border-2 hover:shadow-lg transition-all duration-300 relative ${
                  plan.popular ? 'scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-black font-mono">
                    MOST POPULAR
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <ThiingsIcon name={plan.icon} size={48} className={`${plan.color} mx-auto mb-4`} />
                  <CardTitle className={`${plan.color} font-mono text-xl`}>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                  <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className={`h-5 w-5 ${plan.color} mr-3 mt-0.5 flex-shrink-0`} />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleGetStarted(plan.id)}
                    className={`w-full mt-6 ${
                      plan.id === 'basic' 
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-black' 
                        : plan.id === 'plus'
                        ? 'bg-orange-500 hover:bg-orange-600 text-black'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    } font-mono`}
                  >
                    {plan.id === 'basic' ? 'Start Free' : 'Start Trial'}
                    {plan.id !== 'basic' && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Showcase */}
        <div className="text-center">
          <h2 className="text-3xl font-bold font-mono mb-8 text-orange-400">
            Seamless Integrations
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with 11,000+ banks and financial institutions through secure APIs. 
            Your data is encrypted and never stored permanently.
          </p>
          <div className="flex flex-wrap justify-center gap-4 opacity-60">
            {['Plaid', 'Stripe', 'OpenAI', 'Alpha Vantage', 'Experian', 'Polygon'].map((integration) => (
              <Badge key={integration} variant="outline" className="text-gray-400 border-gray-600 font-mono">
                {integration}
              </Badge>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SeedVault;