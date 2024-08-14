import { z } from "zod";
import { GameOutcome, GameType } from "@solspin/types";

export const CreateBetRequestSchema = z.object({
  publisher: z.string(),
  metadata: z.object({
    requestId: z.string(),
  }),
  payload: z.object({
    requestId: z.string().uuid(),
    userId: z.string().uuid(),
    gameType: z.nativeEnum(GameType),
    amountBet: z.number().positive(),
    outcome: z.nativeEnum(GameOutcome),
    outcomeAmount: z.number(),
  }),
});

export type CreateBetEvent = z.infer<typeof CreateBetRequestSchema>;
