import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { GameOutcome } from "@solspin/types";
import { BetDBObject } from "../foundation/types";
import { BETS_TABLE_ARN } from "../foundation/runtime";
import { GameType } from "../service/events/schemas/schema";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const recordBet = async (
  userId: string,
  gameType: GameType,
  amountBet: number,
  outcome: GameOutcome,
  outcomeAmount: number
): Promise<BetDBObject> => {
  const id = uuid();
  const createdAt = new Date().toISOString();

  const bet: BetDBObject = {
    id,
    userId,
    gameType,
    amountBet,
    outcome,
    outcomeAmount,
    createdAt,
  };

  await docClient.send(
    new PutCommand({
      TableName: BETS_TABLE_ARN,
      Item: bet,
    })
  );

  return {
    id,
    userId,
    gameType,
    amountBet,
    outcome,
    outcomeAmount,
    createdAt,
  };
};
