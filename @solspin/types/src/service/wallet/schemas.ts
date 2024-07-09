import { z } from "zod";

export const reservationsSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative(),
  reason: z.string(),
  createdAt: z.coerce.date(),
});

export const BaseWalletsSchema = z.object({
  userId: z.string().uuid(),
  balance: z.number().nonnegative(),
  wagerRequirement: z.number().nonnegative(),
  walletAddress: z.string().optional(),
  lockedAt: z.coerce.string(),
  createdAt: z.coerce.date(),
});

export const WalletTransactionSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  walletAddress: z.string().optional(),
});

// Request Schemas
export const CreateWalletRequestSchema = BaseWalletsSchema.omit({
  createdAt: true,
  lockedAt: true,
  wagerRequirement: true,
  balance: true,
});

export const GetWalletsByIdRequestSchema = BaseWalletsSchema.pick({ userId: true });
export const DepositToWalletRequestSchema = WalletTransactionSchema.omit({ amount: true }).extend({
  txnSignature: z.string(),
});
export const WithdrawFromWalletRequestSchema = WalletTransactionSchema.extend({
  walletAddress: z.string().base64(),
});
export const UpdateUserBalanceRequestSchema = WalletTransactionSchema.omit({
  walletAddress: true,
});

// Response Schemas
export const CreateWalletsResponseSchema = BaseWalletsSchema;
export const GetWalletsByIdResponseSchema = BaseWalletsSchema;
export const DepositToWalletResponseSchema = BaseWalletsSchema;
export const WithdrawFromWalletResponseSchema = BaseWalletsSchema;
export const UpdateUserBalanceResponseSchema = BaseWalletsSchema;
export const ReserveBalanceResponseSchema = BaseWalletsSchema;
export const ReleaseBalanceReservationResponseSchema = BaseWalletsSchema;

//type definitions
export type Wallet = z.infer<typeof BaseWalletsSchema>;
