import { z } from "zod";

export const UpdateBalanceEventSchema = z.object({
  publisher: z.string(),
  metadata: z.object({
    requestId: z.string(),
  }),
  payload: z.object({
    userId: z.string(),
    amount: z.number(),
  }),
});

export const UpdateBalanceRequestSchema = z.object({
  userId: z.string(),
  amount: z.number(),
});

export type UpdateBalanceEvent = z.infer<typeof UpdateBalanceEventSchema>;
export type UpdateBalanceRequest = z.infer<typeof UpdateBalanceRequestSchema>;
