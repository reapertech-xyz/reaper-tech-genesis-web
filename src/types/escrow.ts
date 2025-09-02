export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  description: string;
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  releaseConditions?: string[];
  disputeReason?: string;
  mediatorId?: string;
}

export enum EscrowStatus {
  INITIATED = 'initiated',
  FUNDED = 'funded',
  IN_PROGRESS = 'in_progress',
  DISPUTED = 'disputed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface EscrowCreateRequest {
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  description: string;
  releaseConditions?: string[];
}

export interface EscrowApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}