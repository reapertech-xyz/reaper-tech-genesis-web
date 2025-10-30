import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Wallet, Globe, Shield, CheckCircle, XCircle, Clock, Trash2, Home, CreditCard } from 'lucide-react';
import { loginWithUnstoppableDomains } from '@/lib/unstoppable-domains';
import { ConnectWallet, useAddress, useConnectionStatus } from '@thirdweb-dev/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Profile() {
  const { user, profile, loading, linkWalletToProfile } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [linkedDomains, setLinkedDomains] = useState<string[]>([]);
  const [linkedWallets, setLinkedWallets] = useState<string[]>([]);
  const [isLinkingDomain, setIsLinkingDomain] = useState(false);
  const walletAddress = useAddress();
  const walletConnectionStatus = useConnectionStatus();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setLinkedDomains(profile.linked_domains || []);
      setLinkedWallets(profile.linked_wallets || []);
    }
  }, [profile]);

  const handleLinkEmail = async () => {
    if (!email || !user) return;

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        email 
      });
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('User already registered')) {
          toast({
            title: 'Email Already In Use',
            description: 'This email is already linked to another account. Please use a different email or remove it from the other account first.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Verification email sent',
          description: 'Please check your email to verify your new address.',
        });
        setEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleLinkDomain = async () => {
    if (!user) return;

    setIsLinkingDomain(true);
    try {
      const { domain, wallet } = await loginWithUnstoppableDomains();
      
      // Check if domain is already linked to another user
      const { data: existingDomainProfiles, error: domainCheckError } = await supabase
        .from('profiles')
        .select('id, username')
        .contains('linked_domains', [domain]);

      if (domainCheckError) throw domainCheckError;

      const otherDomainUsers = existingDomainProfiles?.filter(p => p.id !== user.id) || [];

      if (otherDomainUsers.length > 0) {
        toast({
          title: 'Domain Already Linked',
          description: 'This domain is already linked to another account. It must be removed from that account before you can link it here.',
          variant: 'destructive',
        });
        setIsLinkingDomain(false);
        return;
      }

      // Check if wallet is already linked to another user (if wallet exists)
      if (wallet) {
        const { data: existingWalletProfiles, error: walletCheckError } = await supabase
          .from('profiles')
          .select('id, username')
          .contains('linked_wallets', [wallet]);

        if (walletCheckError) throw walletCheckError;

        const otherWalletUsers = existingWalletProfiles?.filter(p => p.id !== user.id) || [];

        if (otherWalletUsers.length > 0) {
          toast({
            title: 'Wallet Already Linked',
            description: 'The wallet associated with this domain is already linked to another account. It must be removed from that account first.',
            variant: 'destructive',
          });
          setIsLinkingDomain(false);
          return;
        }
      }

      const { error } = await supabase.rpc('add_domain_to_profile', {
        _user_id: user.id,
        _domain: domain
      });

      if (error) throw error;

      if (wallet && !linkedWallets.includes(wallet)) {
        await supabase.rpc('add_wallet_to_profile', {
          _user_id: user.id,
          _wallet: wallet
        });
      }

      setLinkedDomains([...linkedDomains, domain]);
      if (wallet && !linkedWallets.includes(wallet)) {
        setLinkedWallets([...linkedWallets, wallet]);
      }

      toast({
        title: 'Domain linked',
        description: `Successfully linked ${domain}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link domain',
        variant: 'destructive',
      });
    } finally {
      setIsLinkingDomain(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!walletAddress || !user) return;

    try {
      // Check if wallet is already linked to another user
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .contains('linked_wallets', [walletAddress]);

      if (checkError) throw checkError;

      // Filter out the current user's profile
      const otherUsers = existingProfiles?.filter(p => p.id !== user.id) || [];

      if (otherUsers.length > 0) {
        toast({
          title: 'Wallet Already Linked',
          description: 'This wallet address is already linked to another account. It must be removed from that account before you can link it here.',
          variant: 'destructive',
        });
        return;
      }

      await linkWalletToProfile(walletAddress);
      
      await supabase.rpc('add_wallet_to_profile', {
        _user_id: user.id,
        _wallet: walletAddress
      });

      if (!linkedWallets.includes(walletAddress)) {
        setLinkedWallets([...linkedWallets, walletAddress]);
      }

      toast({
        title: 'Wallet linked',
        description: 'Successfully linked your wallet',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!user) return;

    try {
      const updatedDomains = linkedDomains.filter(d => d !== domain);
      const { error } = await supabase
        .from('profiles')
        .update({ linked_domains: updatedDomains })
        .eq('id', user.id);

      if (error) throw error;

      setLinkedDomains(updatedDomains);
      toast({
        title: 'Domain removed',
        description: `Removed ${domain}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveWallet = async (wallet: string) => {
    if (!user) return;

    try {
      const updatedWallets = linkedWallets.filter(w => w !== wallet);
      const { error } = await supabase
        .from('profiles')
        .update({ linked_wallets: updatedWallets })
        .eq('id', user.id);

      if (error) throw error;

      setLinkedWallets(updatedWallets);
      toast({
        title: 'Wallet removed',
        description: 'Wallet unlinked successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getVerificationIcon = () => {
    if (!profile) return null;
    
    switch (profile.verification_status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Profile" />
      
      <main className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-cyan-400">Profile Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account connections and verification status</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>

        {/* Verification Status */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getVerificationIcon()}
              <div>
                <p className="font-medium capitalize text-white">
                  {profile?.verification_status || 'unverified'}
                </p>
                {profile?.verified_at && (
                  <p className="text-sm text-gray-400">
                    Verified on {new Date(profile.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Management */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
              <Mail className="h-5 w-5" />
              Email Address
            </CardTitle>
            <CardDescription className="text-gray-400">
              Link or update your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Current Email</Label>
              <Input
                id="current-email"
                type="email"
                value={user?.email || 'No email linked'}
                disabled
                className="bg-gray-800 border-gray-600 text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">New Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter new email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button 
                  onClick={handleLinkEmail}
                  disabled={isUpdatingEmail || !email}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                  {isUpdatingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Management */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
              <CreditCard className="h-5 w-5" />
              Billing & Payments
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your billing and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              asChild
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
            >
              <a 
                href={`https://billing.stripe.com/p/login/7sYeVcaan8jg0LJ2Xu43S00${user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Billing
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Unstoppable Domains */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
              <Globe className="h-5 w-5" />
              Unstoppable Domains
            </CardTitle>
            <CardDescription className="text-gray-400">
              Link your Web3 domains for easy login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLinkDomain}
              disabled={isLinkingDomain}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
            >
              {isLinkingDomain ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Linking...
                </>
              ) : (
                'Link Unstoppable Domain'
              )}
            </Button>
            
            {linkedDomains.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-300">Linked Domains</Label>
                {linkedDomains.map((domain) => (
                  <div key={domain} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
                    <span className="font-mono text-sm text-white">{domain}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crypto Wallets */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400 font-mono">
              <Wallet className="h-5 w-5" />
              Crypto Wallets
            </CardTitle>
            <CardDescription className="text-gray-400">
              Connect your crypto wallets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletConnectionStatus === 'connected' && walletAddress ? (
              <div className="flex gap-2">
                <Input
                  value={walletAddress}
                  disabled
                  className="font-mono text-sm bg-gray-800 border-gray-600 text-gray-400"
                />
                <Button 
                  onClick={handleLinkWallet}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                  Link Wallet
                </Button>
              </div>
            ) : (
              <ConnectWallet />
            )}

            {linkedWallets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-300">Linked Wallets</Label>
                {linkedWallets.map((wallet) => (
                  <div key={wallet} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
                    <span className="font-mono text-sm truncate flex-1 text-white">{wallet}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveWallet(wallet)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
