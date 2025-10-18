import { useState } from "react";
import { EscrowTransaction, EscrowStatus } from "@/types/escrow";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useEscrow } from "@/hooks/useEscrow";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import DisputeForm from "./DisputeForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EscrowTransactionDetailProps {
  transaction: EscrowTransaction;
  onClose: () => void;
}

const EscrowTransactionDetail = ({ transaction, onClose }: EscrowTransactionDetailProps) => {
  const { user, profile } = useUnifiedAuth();
  const { releaseFunds, initiateDispute, loading } = useEscrow();
  const { toast } = useToast();
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const userId = user?.id || profile?.id;
  const isBuyer = userId === transaction.buyerId;
  const isSeller = userId === transaction.sellerId;

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.COMPLETED:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case EscrowStatus.DISPUTED:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case EscrowStatus.CANCELLED:
      case EscrowStatus.REFUNDED:
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-blue-500" />;
    }
  };

  const handleReleaseFunds = async () => {
    const success = await releaseFunds(transaction.id);
    if (success) {
      setShowReleaseConfirm(false);
      
      // Update listing status if this is linked to a listing
      if (transaction.listing_id) {
        await supabase
          .from('marketplace_listings')
          .update({ status: 'sold' })
          .eq('id', transaction.listing_id);
      }

      // Notify seller (in production, this would trigger an email/notification)
      toast({
        title: "Funds Released",
        description: "The seller has been notified and funds will be transferred shortly",
      });
      
      onClose();
    }
  };

  const handleSubmitDispute = async (reason: string, category: string, evidence: File[]) => {
    // Upload evidence files to storage
    const evidenceUrls: string[] = [];
    
    for (const file of evidence) {
      const fileName = `${transaction.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('dispute-evidence')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('dispute-evidence')
          .getPublicUrl(fileName);
        evidenceUrls.push(publicUrl);
      }
    }

    const fullReason = `Category: ${category}\n\n${reason}\n\nEvidence: ${evidenceUrls.length} file(s) uploaded`;
    
    const success = await initiateDispute(transaction.id, fullReason);
    if (success) {
      setShowDisputeDialog(false);
      
      // In production, trigger notification to mediators
      toast({
        title: "Dispute Filed",
        description: "A mediator will review your case within 24-48 hours",
      });
      
      onClose();
    }
  };

  const canRelease = isBuyer && [
    EscrowStatus.FUNDED,
    EscrowStatus.IN_PROGRESS
  ].includes(transaction.status);

  const canDispute = (isBuyer || isSeller) && [
    EscrowStatus.FUNDED,
    EscrowStatus.IN_PROGRESS
  ].includes(transaction.status);

  const canCancel = (isBuyer || isSeller) && [
    EscrowStatus.INITIATED
  ].includes(transaction.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(transaction.status)}
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{transaction.description}</h2>
            <p className="text-sm text-gray-400 mt-1">Transaction ID: {transaction.id}</p>
          </div>
        </div>
        <Badge
          variant={
            transaction.status === EscrowStatus.COMPLETED ? "default" :
            transaction.status === EscrowStatus.DISPUTED ? "destructive" :
            "outline"
          }
          className="text-sm"
        >
          {transaction.status}
        </Badge>
      </div>

      <Separator className="bg-gray-700" />

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-gray-400">Amount</Label>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {transaction.amount} {transaction.currency}
          </p>
        </div>
        <div>
          <Label className="text-gray-400">Payment Method</Label>
          <p className="text-lg text-gray-100 mt-1">
            {transaction.crypto_currency || "Traditional Currency"}
          </p>
        </div>
        <div>
          <Label className="text-gray-400">Created</Label>
          <p className="text-gray-100 mt-1">
            {new Date(transaction.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="text-gray-400">Last Updated</Label>
          <p className="text-gray-100 mt-1">
            {new Date(transaction.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-gray-400">Buyer</Label>
          <p className="text-gray-100 mt-1 font-mono text-sm">
            {transaction.buyerId.slice(0, 8)}...{transaction.buyerId.slice(-6)}
            {isBuyer && <Badge className="ml-2 bg-cyan-500/20 text-cyan-400">You</Badge>}
          </p>
        </div>
        <div>
          <Label className="text-gray-400">Seller</Label>
          <p className="text-gray-100 mt-1 font-mono text-sm">
            {transaction.sellerId.slice(0, 8)}...{transaction.sellerId.slice(-6)}
            {isSeller && <Badge className="ml-2 bg-cyan-500/20 text-cyan-400">You</Badge>}
          </p>
        </div>
      </div>

      {/* Release Conditions */}
      {transaction.releaseConditions && transaction.releaseConditions.length > 0 && (
        <>
          <Separator className="bg-gray-700" />
          <div>
            <Label className="text-gray-400">Release Conditions</Label>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
              {transaction.releaseConditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Dispute Reason */}
      {transaction.disputeReason && (
        <>
          <Separator className="bg-gray-700" />
          <div>
            <Label className="text-gray-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Dispute Reason
            </Label>
            <p className="mt-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200">
              {transaction.disputeReason}
            </p>
          </div>
        </>
      )}

      <Separator className="bg-gray-700" />

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {canRelease && (
          <Button
            onClick={() => setShowReleaseConfirm(true)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Release Funds
          </Button>
        )}

        {canDispute && (
          <Button
            onClick={() => setShowDisputeDialog(true)}
            disabled={loading}
            variant="destructive"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Initiate Dispute
          </Button>
        )}

        {canCancel && (
          <Button
            onClick={() => setShowCancelConfirm(true)}
            disabled={loading}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Transaction
          </Button>
        )}

        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      {/* Release Funds Confirmation */}
      <AlertDialog open={showReleaseConfirm} onOpenChange={setShowReleaseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Funds to Seller?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will release {transaction.amount} {transaction.currency} to the seller.
              This cannot be undone once completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReleaseFunds}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Release
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File a Dispute</DialogTitle>
            <DialogDescription>
              Provide detailed information about the issue with this transaction
            </DialogDescription>
          </DialogHeader>
          <DisputeForm
            transactionId={transaction.id}
            onSubmit={handleSubmitDispute}
            onCancel={() => setShowDisputeDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel the escrow transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Transaction</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Cancel Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EscrowTransactionDetail;
