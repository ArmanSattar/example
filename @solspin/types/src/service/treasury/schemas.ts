import { Transaction } from "@solana/web3.js";
import { z } from "zod";

export type BuildTransactionResponse = {
  transactionSignature: Transaction;
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

export type DepositRequest = z.infer<typeof DepositRequestSchema>;
