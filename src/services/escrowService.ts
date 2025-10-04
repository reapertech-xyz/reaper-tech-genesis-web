import { EscrowTransaction, EscrowCreateRequest, EscrowStatus, EscrowApiResponse } from '@/types/escrow';

class EscrowService {
  // All API calls are proxied through the escrow-api edge function
  // which securely handles API keys stored in Supabase secrets

  /**
   * Create a new escrow transaction
   */
  public async createTransaction(request: EscrowCreateRequest): Promise<EscrowApiResponse<EscrowTransaction>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'create',
          ...request
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow transaction'
      };
    }
  }

  /**
   * Get transaction by ID
   */
  public async getTransaction(transactionId: string): Promise<EscrowApiResponse<EscrowTransaction>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'get',
          transactionId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction'
      };
    }
  }

  /**
   * Release funds to seller (buyer confirmation)
   */
  public async releaseFunds(transactionId: string): Promise<EscrowApiResponse<EscrowTransaction>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'release',
          transactionId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release funds'
      };
    }
  }

  /**
   * Initiate dispute for a transaction
   */
  public async initiateDispute(transactionId: string, reason: string): Promise<EscrowApiResponse<EscrowTransaction>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'dispute',
          transactionId,
          reason
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate dispute'
      };
    }
  }

  /**
   * Cancel transaction (if not yet funded)
   */
  public async cancelTransaction(transactionId: string): Promise<EscrowApiResponse<EscrowTransaction>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'cancel',
          transactionId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel transaction'
      };
    }
  }

  /**
   * Get user's transaction history
   */
  public async getUserTransactions(userId: string): Promise<EscrowApiResponse<EscrowTransaction[]>> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('escrow-api', {
        body: {
          action: 'user-transactions',
          userId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user transactions'
      };
    }
  }

}

// Export singleton instance
export const escrowService = new EscrowService();
export default EscrowService;