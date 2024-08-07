export enum Direction {
  HORIZONTAL,
  VERTICAL,
}

export type AnimationCalculation = {
  distance: number;
  tickerOffset: number;
};

export type Bet = {
  id: string;
  outcomeAmount: number;
  gameType: string;
  outcome: string;
  userId: string;
  createdAt: string;
  amountBet: number;
};
