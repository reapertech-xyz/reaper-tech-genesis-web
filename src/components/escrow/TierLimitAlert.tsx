import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";

interface TierLimitAlertProps {
  currentTier: string;
  tierLimit: number;
  requestedAmount: number;
  onUpgrade?: () => void;
}

export const TierLimitAlert = ({ 
  currentTier, 
  tierLimit, 
  requestedAmount,
  onUpgrade 
}: TierLimitAlertProps) => {
  const nextTier = currentTier === 'Shadow Trader' 
    ? 'Reaper\'s Mark' 
    : currentTier === 'Reaper\'s Mark' 
      ? 'Digital Overlord' 
      : null;

  const nextTierLimit = currentTier === 'Shadow Trader' 
    ? 10000 
    : currentTier === 'Reaper\'s Mark' 
      ? 999999999 
      : null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Transaction Limit Exceeded
        <ReputationBadge tier={currentTier} />
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Your current tier limit is <strong>${tierLimit.toLocaleString()}</strong>, 
          but you're attempting a transaction of <strong>${requestedAmount.toLocaleString()}</strong>.
        </p>
        
        {nextTier && (
          <div className="bg-background/50 p-3 rounded-lg space-y-2">
            <p className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Upgrade to <ReputationBadge tier={nextTier} /> 
              for transactions up to <strong>${nextTierLimit?.toLocaleString()}</strong>
            </p>
            
            <div className="text-sm text-muted-foreground">
              {currentTier === 'Shadow Trader' && (
                <p>Complete 10+ successful transactions with a 4.0+ rating to unlock Reaper's Mark</p>
              )}
              {currentTier === 'Reaper\'s Mark' && (
                <p>Complete 50+ successful transactions with a 4.5+ rating to unlock Digital Overlord</p>
              )}
            </div>
            
            {onUpgrade && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onUpgrade}
                className="w-full mt-2"
              >
                Learn About Verification
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
