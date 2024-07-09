import { Transaction } from "@solana/web3.js";
import { z } from "zod";

export type BuildTransactionResponse = {
  signedTransaction: Transaction;
  blockhash: string;
  lastValidBlockHeight: number;
};

export const BaseTreasurySchema = z.object({
  userId: z.string().uuid(),
  walletAddress: z.string(),
});

// Request Schemas
export const WithdrawRequestSchema = BaseTreasurySchema.extend({
  amount: z.number().positive(),
});

export const DepositRequestSchema = BaseTreasurySchema.extend({
  base64Transaction: z.string(),
});

// Response Schemas
export const DepositResponseSchema = z.object({
  message: z.string(),
  txnId: z.string(),
  depositAmount: z.number(),
});

export const WithdrawResponseSchema = z.object({
  message: z.string(),
  txnId: z.string(),
});

export type DepositRequest = z.infer<typeof DepositRequestSchema>;
export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;
export type DepositResponse = z.infer<typeof DepositResponseSchema>;
export type WithdrawResponse = z.infer<typeof WithdrawResponseSchema>;
