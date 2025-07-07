import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAddress, useConnectionStatus } from '@thirdweb-dev/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
}

interface UnifiedAuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  walletAddress: string | undefined;
  isConnected: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  linkWalletToProfile: (walletAddress: string) => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const walletAddress = useAddress();
  const walletConnectionStatus = useConnectionStatus();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isConnected = walletConnectionStatus === 'connected' && !!walletAddress;

  // Load profile when user changes or wallet connects
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        // Load profile for authenticated user
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data && !error) {
          setProfile(data);
        }
      } else if (isConnected && walletAddress) {
        // First check if this wallet is already linked to an existing profile
        const { data: existingProfile, error: existingError } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .maybeSingle();

        if (existingProfile && !existingError) {
          // Use the existing linked profile
          setProfile(existingProfile);
        } else {
          // Create a new wallet-only profile
          const { data, error } = await supabase
            .rpc('get_or_create_wallet_profile', { _wallet_address: walletAddress });

          if (!error && data) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data)
              .single();

            if (profileData) {
              setProfile(profileData);
            }
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, walletAddress, isConnected, authLoading]);

  const linkWalletToProfile = async (walletAddr: string) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddr })
        .eq('id', user.id);

      if (!error) {
        setProfile({ ...profile, wallet_address: walletAddr });
      }
    } catch (error) {
      console.error('Error linking wallet to profile:', error);
    }
  };

  return (
    <UnifiedAuthContext.Provider value={{
      user,
      profile,
      session,
      walletAddress,
      isConnected,
      loading: authLoading || loading,
      signIn,
      signUp,
      signOut,
      linkWalletToProfile
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};