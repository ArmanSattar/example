import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { LOCK_DURATION, WalletsDBObject } from "../foundation/types";
import { WALLETS_TABLE_ARN } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("updateWalletBalance");

export const updateWalletBalance = async (
  userId: string,
  amount: number
): Promise<WalletsDBObject> => {
  const now = Date.now();
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: userId },
        UpdateExpression: `SET balance = balance + :amount, updatedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpired AND attribute_exists(userId) AND balance >= :negativeAmount`,
        ExpressionAttributeValues: {
          ":amount": amount,
          ":now": now.toString(),
          ":lockExpired": (now - LOCK_DURATION).toString(),
          ":negativeAmount": amount >= 0 ? 0 : -amount,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    logger.info("Balance updated successfully", { userId, amount });

    return result.Attributes as WalletsDBObject;
  } catch (error: unknown) {
    if (error instanceof ConditionalCheckFailedException) {
      logger.info("Error updating wallet balance:", { userId, amount, error });
      logger.error(`Error updating wallet balance for ${userId}`, { error });
      throw new Error(`Error updating wallet balance for ${userId}.`);
    }
    logger.info("Error updating wallet balance:", { userId, amount, error });
    logger.error("Error updating wallet balance:", { userId, amount, error });
    throw error;
  }
};
