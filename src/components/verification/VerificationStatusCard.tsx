import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationStatusCardProps {
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: string | null;
  verificationInitiatedAt?: string | null;
  currentTier: string;
}

export const VerificationStatusCard = ({ 
  verificationStatus, 
  verifiedAt,
  verificationInitiatedAt,
  currentTier 
}: VerificationStatusCardProps) => {
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Declined</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Not Verified</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'verified':
        return verifiedAt 
          ? `Verified ${formatDistanceToNow(new Date(verifiedAt), { addSuffix: true })}`
          : 'Your identity has been successfully verified';
      case 'pending':
        return verificationInitiatedAt
          ? `Submitted ${formatDistanceToNow(new Date(verificationInitiatedAt), { addSuffix: true })}. Review typically takes 1-2 business days.`
          : 'Your verification is being reviewed';
      case 'rejected':
        return 'Your verification was declined. Please contact support for more information.';
      default:
        return 'Complete identity verification to unlock higher transaction limits';
    }
  };

  const getBenefits = () => {
    if (verificationStatus === 'verified') {
      return [
        'Access to higher transaction limits',
        'Verified badge on your profile',
        'Faster tier progression (50% fewer transactions required)',
        'Increased trust with trading partners',
      ];
    }
    return [
      'Unlock Reaper\'s Mark tier with just 5 successful transactions',
      'Unlock Digital Overlord tier with 25 transactions instead of 50',
      'Transaction limits up to $10,000+',
      'Display verified badge to build trust',
    ];
  };

  return (
    <Card className={verificationStatus === 'verified' ? 'border-primary/20 bg-primary/5' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Verification Status
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {verificationStatus === 'verified' ? 'Benefits Unlocked:' : 'Benefits After Verification:'}
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {getBenefits().map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <ShieldCheck className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  verificationStatus === 'verified' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {verificationStatus === 'verified' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Tier:</span>
              <Badge variant="outline">{currentTier}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
