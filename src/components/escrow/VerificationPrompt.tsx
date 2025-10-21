import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { PersonaVerificationFlow } from "@/components/verification/PersonaVerificationFlow";

interface VerificationPromptProps {
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  currentTier: string;
  onStartVerification?: () => void;
}

export const VerificationPrompt = ({ 
  verificationStatus, 
  currentTier,
  onStartVerification 
}: VerificationPromptProps) => {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const handleStartVerification = () => {
    setShowVerificationDialog(true);
  };

  const handleVerificationComplete = () => {
    setShowVerificationDialog(false);
    onStartVerification?.();
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Unverified</Badge>;
    }
  };

  if (verificationStatus === 'verified') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Identity Verified
            </CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Your identity has been verified. You have access to higher transaction limits.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify Your Identity
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Unlock higher transaction limits and build trust with the community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">Benefits of verification:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Increase transaction limits up to $10,000+ per transaction</li>
            <li>Unlock "Digital Overlord" tier for unlimited transactions</li>
            <li>Display verified badge on your profile</li>
            <li>Build trust with buyers and sellers</li>
          </ul>
        </div>

        {verificationStatus === 'pending' ? (
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p>Your verification is being reviewed. This typically takes 1-2 business days.</p>
          </div>
        ) : verificationStatus === 'rejected' ? (
          <div className="bg-destructive/10 p-3 rounded-lg text-sm">
            <p>Your verification was rejected. Please contact support for more information.</p>
          </div>
        ) : (
          <Button 
            onClick={handleStartVerification}
            className="w-full"
            disabled={currentTier === 'Digital Overlord'}
          >
            Start Verification Process
          </Button>
        )}
      </CardContent>

      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Identity Verification</DialogTitle>
          </DialogHeader>
          <PersonaVerificationFlow
            onComplete={handleVerificationComplete}
            onCancel={() => setShowVerificationDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
