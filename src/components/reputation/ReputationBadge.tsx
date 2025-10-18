import { Shield, Star, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReputationBadgeProps {
  tier: string;
  ratingAverage?: number;
  totalTransactions?: number;
  showStats?: boolean;
}

export const ReputationBadge = ({ 
  tier, 
  ratingAverage = 0, 
  totalTransactions = 0,
  showStats = true 
}: ReputationBadgeProps) => {
  const getTierConfig = (tierName: string) => {
    switch (tierName) {
      case 'Digital Overlord':
        return {
          icon: Crown,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          textColor: 'text-white',
          borderColor: 'border-purple-500'
        };
      case "Reaper's Mark":
        return {
          icon: Shield,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-white',
          borderColor: 'border-blue-500'
        };
      default: // Shadow Trader
        return {
          icon: Star,
          color: 'bg-gradient-to-r from-gray-600 to-gray-700',
          textColor: 'text-white',
          borderColor: 'border-gray-600'
        };
    }
  };

  const config = getTierConfig(tier);
  const Icon = config.icon;

  const getVerifiedBadge = () => {
    if (totalTransactions >= 5 && ratingAverage >= 4.0) {
      return (
        <Badge variant="secondary" className="text-xs ml-2">
          ✓ Verified Escrow User
        </Badge>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.color} ${config.textColor} font-semibold text-sm`}>
              <Icon className="w-4 h-4" />
              {tier}
            </div>
            {showStats && getVerifiedBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{tier}</p>
            {showStats && (
              <>
                <p className="text-sm">
                  Rating: {ratingAverage.toFixed(1)} ★
                </p>
                <p className="text-sm">
                  Transactions: {totalTransactions}
                </p>
                {tier === 'Digital Overlord' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Elite trader with 50+ successful transactions
                  </p>
                )}
                {tier === "Reaper's Mark" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Trusted trader with 10+ successful transactions
                  </p>
                )}
                {tier === 'Shadow Trader' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Building reputation in the marketplace
                  </p>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
