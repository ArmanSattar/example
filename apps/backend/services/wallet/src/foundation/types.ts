export interface WalletsDBObject {
  userId: string;
  balance: number; // Available balance in the wallet.
  wagerRequirement: number; // Amount that needs to be wagered before the user can withdraw.
  walletAddress: string; // Wallet address of the user.
  createdAt: string; // timestamp when the wallet was updated.
  lockedAt: string;
}

export const LOCK_DURATION = 15000; // 30 seconds, for example
