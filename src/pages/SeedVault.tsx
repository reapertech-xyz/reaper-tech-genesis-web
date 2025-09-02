import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThiingsIcon from '@/components/ThiingsIcon';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Shield, MapPin, Users, MessageSquare, Calendar, Star, Lock, Coins } from 'lucide-react';

const LedgerFields = () => {
  const { user, profile } = useUnifiedAuth();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      id: 'anonymous',
      name: 'Shadow Trader',
      price: 'Free',
      description: 'Anonymous trading with basic escrow protection',
      features: [
        'Anonymous wallet-only trading',
        'Basic escrow protection (2-of-3 multi-sig)',
        'Up to $500 per transaction',
        'Standard dispute resolution',
        'Community reputation system'
      ],
      icon: 'mask3D',
      color: 'text-cyan-400',
      borderColor: 'border-cyan-400'
    },
    {
      id: 'verified',
      name: 'Reaper\'s Mark',
      price: 'KYC Verified',
      description: 'Verified identity with enhanced trust and higher limits',
      features: [
        'Identity verification badge',
        'Enhanced escrow (up to $10,000)',
        'Priority dispute resolution',
        'Advanced reputation scoring',
        'Meetup location partnerships',
        'Encrypted chat with message burn',
        'Custom marketplace profiles'
      ],
      icon: 'crown3D',
      color: 'text-orange-400',
      borderColor: 'border-orange-400',
      popular: true
    },
    {
      id: 'merchant',
      name: 'Digital Overlord',
      price: 'Business Tier',
      description: 'Professional sellers with advanced tools and analytics',
      features: [
        'Everything in Reaper\'s Mark',
        'Business verification',
        'Unlimited transaction limits',
        'Advanced analytics dashboard',
        'Bulk listing tools',
        'Custom storefront design',
        'API access for integrations',
        'Dedicated dispute mediator'
      ],
      icon: 'skull3D',
      color: 'text-purple-400',
      borderColor: 'border-purple-400'
    }
  ];

  const handleJoinTier = (tierId: string) => {
    if (!user && !profile) {
      navigate('/auth');
      return;
    }
    setSelectedTier(tierId);
    // TODO: Implement tier verification flow
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Ledger Fields" />
      
      <main className="px-6 py-16 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <ThiingsIcon name="market3D" size={64} className="mr-4 text-green-400" />
            <h1 className="text-5xl md:text-7xl font-bold font-mono text-green-400">
              Ledger Fields
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto">
            The safety first, escrow second cryptocurrency utilizing marketplace.
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
            A digital farmers market that meets Reaper Tech's shadowy, futuristic brand—a safe place to trade with grit and glow.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <Lock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Escrow First</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Multi-Sig Security</p>
            </div>
            <div className="text-center">
              <Coins className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Crypto Powered</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Community Driven</p>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-mono text-center mb-12 text-orange-400">
            Marketplace Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'lock3D',
                title: 'Escrow Wallet System',
                description: 'Multi-sig smart contracts with automatic release upon mutual confirmation and timed auto-release protection.'
              },
              {
                icon: 'crypto3D',
                title: 'Cryptocurrency Support',
                description: 'Bitcoin, Ethereum, Pi, stablecoins, and future Reaper Tech token integration for seamless transactions.'
              },
              {
                icon: 'location3D',
                title: 'Local & Online Trading',
                description: 'Location-based search for in-person exchanges plus secure online-only listings for remote trades.'
              },
              {
                icon: 'star3D',
                title: 'Reputation System',
                description: 'Ratings tied to wallet IDs with transaction history and verified seller "Reaper\'s Mark" badges.'
              },
              {
                icon: 'gavel3D',
                title: 'Dispute Resolution',
                description: 'Built-in mediation system with AI-assisted summaries and defined timelines for fair resolution.'
              },
              {
                icon: 'chat3D',
                title: 'Secure Communication',
                description: 'End-to-end encrypted chat between buyers and sellers with optional message burn after escrow closes.'
              },
              {
                icon: 'calendar3D',
                title: 'Meetup Scheduling',
                description: 'Integrated calendar with safe location partnerships and QR code payment confirmation for in-person trades.'
              },
              {
                icon: 'shield3D',
                title: 'Identity Verification',
                description: 'Tiered system from anonymous trading to verified sellers with enhanced trust and transaction limits.'
              },
              {
                icon: 'mobile3D',
                title: 'Mobile & Web Access',
                description: 'Progressive Web App with QR codes for seamless mobile trading and payment confirmation at meetups.'
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors">
                <CardHeader>
                  <ThiingsIcon name={feature.icon} size={32} className="text-green-400 mb-2" />
                  <CardTitle className="text-green-400 font-mono">{feature.title}</CardTitle>
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

        {/* Security Guidelines */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-mono text-center mb-12 text-red-400">
            Safety & Security Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-900 border-red-500 border-2">
              <CardHeader>
                <CardTitle className="text-red-400 font-mono flex items-center">
                  <Shield className="mr-2 h-6 w-6" />
                  Security Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Escrow First Rule - No transactions outside platform',
                  'Multi-Signature Escrow (2-of-3: buyer, seller, platform)',
                  'Anonymous but Accountable wallet ID tracking',
                  'AI fraud scanning and community flagging',
                  'Cold-storage reserves for escrow funds'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-yellow-500 border-2">
              <CardHeader>
                <CardTitle className="text-yellow-400 font-mono flex items-center">
                  <MapPin className="mr-2 h-6 w-6" />
                  Safe Trading Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Recommended public meeting locations',
                  'Dispute mediation with 72-hour response times',
                  'End-to-end encrypted communications',
                  'Proof of meetup QR check-in system',
                  'Educational guides on crypto safety'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trader Tiers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-mono text-center mb-12 text-orange-400">
            Choose Your Trading Tier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`bg-gray-900 ${tier.borderColor} border-2 hover:shadow-lg transition-all duration-300 relative ${
                  tier.popular ? 'scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-black font-mono">
                    MOST TRUSTED
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <ThiingsIcon name={tier.icon} size={48} className={`${tier.color} mx-auto mb-4`} />
                  <CardTitle className={`${tier.color} font-mono text-xl`}>{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-white mb-2">{tier.price}</div>
                  <CardDescription className="text-gray-300">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className={`h-5 w-5 ${tier.color} mr-3 mt-0.5 flex-shrink-0`} />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleJoinTier(tier.id)}
                    className={`w-full mt-6 ${
                      tier.id === 'anonymous' 
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-black' 
                        : tier.id === 'verified'
                        ? 'bg-orange-500 hover:bg-orange-600 text-black'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    } font-mono`}
                  >
                    {tier.id === 'anonymous' ? 'Start Trading' : tier.id === 'verified' ? 'Get Verified' : 'Go Pro'}
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supported Cryptocurrencies */}
        <div className="text-center">
          <h2 className="text-3xl font-bold font-mono mb-8 text-orange-400">
            Supported Cryptocurrencies
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Trade with confidence using major cryptocurrencies. All transactions secured through multi-signature escrow smart contracts.
          </p>
          <div className="flex flex-wrap justify-center gap-4 opacity-60">
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Pi Network (PI)', 'USDC', 'USDT', 'Reaper Token (Coming Soon)'].map((crypto) => (
              <Badge key={crypto} variant="outline" className="text-gray-400 border-gray-600 font-mono">
                {crypto}
              </Badge>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LedgerFields;