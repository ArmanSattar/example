import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getLogger } from "@solspin/logger";
import { TRANSACTIONS_TABLE_ARN } from "../foundation/runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("updateTransactionStats");

export const updateTransactionStats = async (userId: string, amount: number): Promise<void> => {
  const now = new Date().toISOString();

  const params = {
    TableName: TRANSACTIONS_TABLE_ARN,
    Key: { userId },
    UpdateExpression: "ADD amount :amount SET lastUpdated = :lastUpdated",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":lastUpdated": now,
    },
  };

  try {
    await docClient.send(new UpdateCommand(params));
    logger.info("Transaction stats updated", { userId });
  } catch (error) {
    logger.error("Failed to update transaction stats", { userId, error });
    throw error;
  }
};
