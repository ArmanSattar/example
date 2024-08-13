import { z } from "zod";
import { GameType } from "../../registry/gameResultEventSchema";

export enum GameOutcome {
  WIN = "WIN",
  LOSE = "LOSE",
  MOCK = "MOCK",
}

export const BaseBetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  gameType: z.nativeEnum(GameType),
  amountBet: z.number().positive(),
  outcome: z.nativeEnum(GameOutcome),
  outcomeAmount: z.number().positive(),
  createdAt: z.coerce.date(),
});

// Request Schemas
export const CreateBetRequestSchema = BaseBetSchema.omit({ id: true, createdAt: true });
export const GetBetByIdRequestSchema = BaseBetSchema.pick({ id: true });
export const GetBetStatsRequestSchema = BaseBetSchema.pick({ userId: true });
export const GetBetsByUserIdRequestSchema = BaseBetSchema.pick({ userId: true });
export const GetBetsByGameIdRequestSchema = BaseBetSchema.pick({ gameType: true });

// Query Schemas
export const BetQuerySchema = z.object({
  gameOutcome: z.nativeEnum(GameOutcome).optional(),
  outcomeAmount: z.number().positive().optional(),
  betAmount: z.number().positive().optional(),
});

// Response Schemas
export const CreateBetResponseSchema = BaseBetSchema;
export const GetBetByIdResponseSchema = BaseBetSchema;
export const GetBetsByUserIdResponseSchema = z.array(BaseBetSchema);
export const GetBetsByGameIdResponseSchema = z.array(BaseBetSchema);
export const GetBetStatsResponseSchema = z.object({
  totalBet: z.number(),
  totalProfit: z.number(),
});

// Types
export type Bet = z.infer<typeof BaseBetSchema>;
export type BetStats = z.infer<typeof GetBetStatsResponseSchema>;
