import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CryptoBalance {
  balance: string;
  currency: string;
  walletAddress: string;
}

interface CryptoConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: string;
}

export const useCryptoEscrow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBalance = useCallback(async (
    walletAddress: string,
    currency: string
  ): Promise<CryptoBalance | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crypto-escrow', {
        body: {
          action: 'check-balance',
          walletAddress,
          currency,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to check balance');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check balance';
      setError(errorMessage);
      console.error('Balance check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeposit = useCallback(async (
    transactionId: string,
    walletAddress: string,
    amount: number,
    currency: string
  ): Promise<{ escrowWalletAddress: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crypto-escrow', {
        body: {
          action: 'create-deposit',
          transactionId,
          walletAddress,
          amount,
          currency,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create deposit');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deposit';
      setError(errorMessage);
      console.error('Create deposit error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyDeposit = useCallback(async (
    transactionId: string,
    txHash: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crypto-escrow', {
        body: {
          action: 'verify-deposit',
          transactionId,
          txHash,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify deposit');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify deposit';
      setError(errorMessage);
      console.error('Verify deposit error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const releaseFunds = useCallback(async (transactionId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crypto-escrow', {
        body: {
          action: 'release-funds',
          transactionId,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to release funds');
      }

      return data.data.txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release funds';
      setError(errorMessage);
      console.error('Release funds error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversion = useCallback(async (
    from: string,
    to: string,
    amount: number
  ): Promise<CryptoConversion | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crypto-escrow', {
        body: {
          action: 'get-conversion',
          from,
          to,
          amount,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get conversion');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get conversion';
      setError(errorMessage);
      console.error('Conversion error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    checkBalance,
    createDeposit,
    verifyDeposit,
    releaseFunds,
    getConversion,
  };
};
