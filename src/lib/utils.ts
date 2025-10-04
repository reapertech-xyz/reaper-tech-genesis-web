
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Masks a user ID by showing only prefix and last 4 characters
 * @param userId - The full UUID to mask
 * @returns Masked ID in format: user_...xxxx
 */
export function maskUserId(userId: string): string {
  if (!userId || userId.length < 8) return 'user_...????';
  const last4 = userId.slice(-4);
  return `user_...${last4}`;
}
