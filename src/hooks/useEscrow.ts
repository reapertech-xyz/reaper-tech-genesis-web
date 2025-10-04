import { useState, useCallback } from 'react';
import { escrowService } from '@/services/escrowService';
import { EscrowTransaction, EscrowCreateRequest, EscrowApiResponse } from '@/types/escrow';
import { useToast } from '@/hooks/use-toast';

export const useEscrow = () => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createTransaction = useCallback(async (request: EscrowCreateRequest): Promise<EscrowTransaction | null> => {
    setLoading(true);
    setError(null);

    try {
      const response: EscrowApiResponse<EscrowTransaction> = await escrowService.createTransaction(request);
      
      if (response.success && response.data) {
        setTransactions(prev => [...prev, response.data!]);
        toast({
          title: "Escrow Created",
          description: response.message || "Escrow transaction created successfully",
        });
        return response.data;
      } else {
        setError(response.error || 'Failed to create escrow transaction');
        toast({
          title: "Error",
          description: response.error || 'Failed to create escrow transaction',
          variant: "destructive"
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const releaseFunds = useCallback(async (transactionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await escrowService.releaseFunds(transactionId);
      
      if (response.success) {
        // Update local transaction status
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'completed' as any, updatedAt: new Date().toISOString() }
              : tx
          )
        );
        toast({
          title: "Funds Released",
          description: response.message || "Funds have been released to the seller",
        });
        return true;
      } else {
        setError(response.error || 'Failed to release funds');
        toast({
          title: "Error",
          description: response.error || 'Failed to release funds',
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const initiateDispute = useCallback(async (transactionId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await escrowService.initiateDispute(transactionId, reason);
      
      if (response.success) {
        // Update local transaction status
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'disputed' as any, disputeReason: reason, updatedAt: new Date().toISOString() }
              : tx
          )
        );
        toast({
          title: "Dispute Initiated",
          description: response.message || "Dispute has been initiated for this transaction",
        });
        return true;
      } else {
        setError(response.error || 'Failed to initiate dispute');
        toast({
          title: "Error",
          description: response.error || 'Failed to initiate dispute',
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadUserTransactions = useCallback(async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await escrowService.getUserTransactions(userId);
      
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setError(response.error || 'Failed to load transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    releaseFunds,
    initiateDispute,
    loadUserTransactions
  };
};