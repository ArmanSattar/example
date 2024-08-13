export enum GameOutcome {
  WIN = "WIN",
  LOSE = "LOSE",
  NEUTRAL = "NEUTRAL",
}

export type Bet = {
  userId: string; //primary key
  betId: string; // sort key
  amountBet: number; // how much they bet
  outcome: GameOutcome; // WIN || LOSE
  outcomeAmount: number; // how much they won from the bet
  timestamp: string;
  gameId: string; // which game they played
};
