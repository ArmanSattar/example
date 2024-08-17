import { z } from "zod";
import { GameOutcome, GameType } from "@solspin/types";

export const CreateBetPayloadSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  gameType: z.nativeEnum(GameType),
  amountBet: z.number().positive(),
  outcome: z.nativeEnum(GameOutcome),
  outcomeAmount: z.number(),
});

export const CreateBetRequestSchema = z.object({
  publisher: z.string(),
  metadata: z.object({
    requestId: z.string(),
  }),
  payload: CreateBetPayloadSchema,
});

export type CreateBetEvent = z.infer<typeof CreateBetRequestSchema>;
export type CreateBetPayload = z.infer<typeof CreateBetPayloadSchema>;
export { GameType };
