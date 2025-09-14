import { EscrowTransaction, EscrowCreateRequest, EscrowStatus, EscrowApiResponse } from '@/types/escrow';

// Base configuration for Escrow.com API
const ESCROW_API_BASE = 'https://api.escrow.com/v1';

class EscrowService {
  private apiKey: string | null = null;
  private sandbox: boolean = true;

  constructor() {
    // In a real implementation, this would come from environment variables
    // For now, we'll use a placeholder approach
    this.apiKey = process.env.VITE_ESCROW_API_KEY || null;
  }

  /**
   * Initialize escrow service with API credentials
   */
  public initialize(apiKey: string, sandbox: boolean = true): void {
    this.apiKey = apiKey;
    this.sandbox = sandbox;
  }

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

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Escrow service not initialized with API key');
    }

    const url = `${ESCROW_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const escrowService = new EscrowService();
export default EscrowService;