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
  walletAddress: z.string(),
  lockedAt: z.coerce.string(),
  createdAt: z.coerce.date(),
});

export const WalletTransactionSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  walletAddress: z.string(),
});

export const WalletTransactionStatsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  lastUpdated: z.coerce.date(),
});

// Request Schemas
export const CreateWalletRequestSchema = BaseWalletsSchema.omit({
  createdAt: true,
  lockedAt: true,
  balance: true,
  wagerRequirement: true,
}).extend({
  requestId: z.string().uuid(),
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

export const WalletTransactionStatsRequestSchema = z.object({
  userId: z.string().uuid(),
});

// Response Schemas
export const CreateWalletsResponseSchema = BaseWalletsSchema;
export const GetWalletsByIdResponseSchema = BaseWalletsSchema;
export const DepositToWalletResponseSchema = BaseWalletsSchema;
export const WithdrawFromWalletResponseSchema = BaseWalletsSchema;
export const UpdateUserBalanceResponseSchema = BaseWalletsSchema;
export const GatewayResponseSchema = z.object({
  statusCode: z.number(),
  body: z.string(),
});
export const WalletTransactionStatsResponseSchema = WalletTransactionStatsSchema.omit({
  lastUpdated: true,
});

//type definitions
export type Wallet = z.infer<typeof BaseWalletsSchema>;
export type GatewayResponse = z.infer<typeof GatewayResponseSchema>;
export type WalletTransactionStats = z.infer<typeof WalletTransactionStatsResponseSchema>;
