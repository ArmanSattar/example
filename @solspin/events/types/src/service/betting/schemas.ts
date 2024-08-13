import { z } from "zod";

export enum GameOutcome {
  WIN = "WIN",
  LOSE = "LOSE",
  MOCK = "MOCK",
}

export enum GameType {
  CASES = "CASES",
  CASE_BATTLES = "CASE_BATTLES",
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

// Infer types from schemas
export type Bet = z.infer<typeof BaseBetSchema>;
export type CreateBetRequest = z.infer<typeof CreateBetRequestSchema>;
export type CreateBetResponse = z.infer<typeof CreateBetResponseSchema>;
export type GetBetByIdRequest = z.infer<typeof GetBetByIdRequestSchema>;
export type GetBetByIdResponse = z.infer<typeof GetBetByIdResponseSchema>;
export type GetBetsByUserIdRequest = z.infer<typeof GetBetsByUserIdRequestSchema>;
export type GetBetsByUserIdResponse = z.infer<typeof GetBetsByUserIdResponseSchema>;
export type GetBetsByGameIdRequest = z.infer<typeof GetBetsByGameIdRequestSchema>;
export type GetBetsByGameIdResponse = z.infer<typeof GetBetsByGameIdResponseSchema>;
export type BetQuery = z.infer<typeof BetQuerySchema>;
