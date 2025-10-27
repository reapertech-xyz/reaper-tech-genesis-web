import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Wallet, Globe, Shield, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { loginWithUnstoppableDomains } from '@/lib/unstoppable-domains';
import { ConnectWallet, useAddress, useConnectionStatus } from '@thirdweb-dev/react';

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
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;

      toast({
        title: 'Verification email sent',
        description: 'Please check your email to verify your new address.',
      });
      setEmail('');
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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account connections and verification status</p>
      </div>

      {/* Verification Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {getVerificationIcon()}
            <div>
              <p className="font-medium capitalize">
                {profile?.verification_status || 'unverified'}
              </p>
              {profile?.verified_at && (
                <p className="text-sm text-muted-foreground">
                  Verified on {new Date(profile.verified_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
          <CardDescription>
            Link or update your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={user?.email || 'No email linked'}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">New Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter new email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleLinkEmail}
                disabled={isUpdatingEmail || !email}
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

      {/* Unstoppable Domains */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Unstoppable Domains
          </CardTitle>
          <CardDescription>
            Link your Web3 domains for easy login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLinkDomain}
            disabled={isLinkingDomain}
            className="w-full"
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
              <Label>Linked Domains</Label>
              {linkedDomains.map((domain) => (
                <div key={domain} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-mono text-sm">{domain}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDomain(domain)}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Crypto Wallets
          </CardTitle>
          <CardDescription>
            Connect your crypto wallets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {walletConnectionStatus === 'connected' && walletAddress ? (
            <div className="flex gap-2">
              <Input
                value={walletAddress}
                disabled
                className="font-mono text-sm"
              />
              <Button onClick={handleLinkWallet}>
                Link Wallet
              </Button>
            </div>
          ) : (
            <ConnectWallet />
          )}

          {linkedWallets.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Wallets</Label>
              {linkedWallets.map((wallet) => (
                <div key={wallet} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-mono text-sm truncate flex-1">{wallet}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWallet(wallet)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
