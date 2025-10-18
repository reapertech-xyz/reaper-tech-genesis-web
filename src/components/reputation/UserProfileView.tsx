import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReputationBadge } from './ReputationBadge';
import { Star, TrendingUp, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
}

interface UserReputation {
  total_transactions: number;
  successful_transactions: number;
  rating_average: number;
  total_rating_count: number;
  tier: string;
}

interface UserProfileViewProps {
  userId: string;
  showFullStats?: boolean;
}

export const UserProfileView = ({ userId, showFullStats = true }: UserProfileViewProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch reputation
        const { data: reputationData, error: reputationError } = await supabase
          .from('user_reputation')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (reputationError && reputationError.code !== 'PGRST116') {
          throw reputationError;
        }
        
        setReputation(reputationData || {
          total_transactions: 0,
          successful_transactions: 0,
          rating_average: 0,
          total_rating_count: 0,
          tier: 'Shadow Trader'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </Card>
    );
  }

  if (!profile || !reputation) {
    return null;
  }

  const successRate = reputation.total_transactions > 0
    ? ((reputation.successful_transactions / reputation.total_transactions) * 100).toFixed(0)
    : 0;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>
            {profile.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">
            {profile.username || 'Anonymous User'}
          </h3>

          <div className="mb-3">
            <ReputationBadge
              tier={reputation.tier}
              ratingAverage={reputation.rating_average}
              totalTransactions={reputation.total_transactions}
              showStats={true}
            />
          </div>

          {showFullStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <p className="text-2xl font-bold">
                  {reputation.rating_average.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reputation.total_rating_count} reviews
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <p className="text-2xl font-bold">{successRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {reputation.successful_transactions} of {reputation.total_transactions}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Total Trades</span>
                </div>
                <p className="text-2xl font-bold">{reputation.total_transactions}</p>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Tier</span>
                </div>
                <p className="text-sm font-semibold">{reputation.tier}</p>
                <p className="text-xs text-muted-foreground">
                  {reputation.tier === 'Digital Overlord' && 'Elite Trader'}
                  {reputation.tier === "Reaper's Mark" && 'Trusted Trader'}
                  {reputation.tier === 'Shadow Trader' && 'New Trader'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
