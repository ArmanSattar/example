import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { WalletsDBObject } from "../foundation/types";
import { WALLETS_TABLE_ARN } from "../foundation/runtime";
import { DuplicateResourceError } from "@solspin/errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createWallet = async (
  userId: string,
  walletAddress: string
): Promise<WalletsDBObject> => {
  const createdAt = new Date().toISOString();

  const wallet: WalletsDBObject = {
    userId: userId,
    balance: 0,
    wagerRequirement: 0,
    walletAddress: walletAddress,
    createdAt: createdAt,
    lockedAt: "0",
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: WALLETS_TABLE_ARN,
        Item: wallet,
        ConditionExpression: "attribute_not_exists(walletAddress)",
      })
    );
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new DuplicateResourceError("Wallet already exists for this wallet address");
    }
    throw error;
  }

  return wallet;
};
