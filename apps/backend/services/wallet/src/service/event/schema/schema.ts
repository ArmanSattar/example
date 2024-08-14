import { z } from "zod";

export const UpdateBalanceEventSchema = z.object({
  publisher: z.string(),
  metadata: z.object({
    requestId: z.string(),
  }),
  payload: z.object({
    userId: z.string(),
    amount: z.number(),
    requestId: z.string(),
  }),
});

export const UpdateBalanceRequestSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  requestId: z.string(),
});

export const UpdateBalanceResponseSchema = z.object({
  depositAmount: z.number(),
  transactionId: z.string(),
});

export const CreateWalletEventSchema = z.object({
  publisher: z.string(),
  metadata: z.object({
    requestId: z.string(),
  }),
  payload: z.object({
    userId: z.string(),
    walletAddress: z.string(),
  }),
});

export type CreateWalletEvent = z.infer<typeof CreateWalletEventSchema>;
export type UpdateBalanceEvent = z.infer<typeof UpdateBalanceEventSchema>;
export type UpdateBalanceRequest = z.infer<typeof UpdateBalanceRequestSchema>;
