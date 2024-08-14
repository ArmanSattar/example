import { GameOutcome, GameType } from "@solspin/types";

export interface BetDBObject {
  id: string;
  userId: string;
  gameType: GameType;
  amountBet: number;
  outcome: GameOutcome;
  outcomeAmount: number;
  createdAt: string;
}
