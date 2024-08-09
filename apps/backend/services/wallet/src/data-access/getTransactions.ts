import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getLogger } from "@solspin/logger";
import { TRANSACTIONS_TABLE_ARN } from "../foundation/runtime";
import { WalletTransactionStats } from "@solspin/types";
import { ResourceNotFoundError } from "@solspin/errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("getTransactionStats");

export const getTransactionStats = async (userId: string): Promise<WalletTransactionStats> => {
  const params = {
    TableName: TRANSACTIONS_TABLE_ARN,
    Key: { userId },
  };

  try {
    const response = await docClient.send(new GetCommand(params));
    logger.info("Transaction stats retrieved", { userId });

    if (!response.Item) {
      throw new ResourceNotFoundError("Transaction stats not found");
    }
    console.log(response.Item);
    return { userId: response.Item.userId, amount: response.Item.amount } as WalletTransactionStats;
  } catch (error) {
    logger.error("Failed to retrieve transaction stats", { userId, error });
    throw error;
  }
};
