import * as z from "zod";
import { EventProvider } from "../types";
import { GameOutcome } from "../../types/src";

export enum GameType {
  CASES = "CASES",
  CASE_BATTLES = "CASE_BATTLES",
}

export interface GameResultPayload {
  userId: string;
  gameType: GameType;
  amountBet: number;
  outcome: GameOutcome;
  outcomeAmount: number;
}

export const gameResultEventSchema = z.object({
  userId: z.string().uuid(),
  gameType: z.nativeEnum(GameType),
  amountBet: z.number().positive(),
  outcome: z.nativeEnum(GameOutcome),
  outcomeAmount: z.number(),
});

export type GameResultType = z.infer<typeof gameResultEventSchema>;
export const gameResultEvent: EventProvider = {
  name: "GameOutcome",
  schema: gameResultEventSchema,
};
