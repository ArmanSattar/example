import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { LOCK_DURATION, WalletsDBObject } from "../foundation/types";
import { WALLETS_TABLE_ARN } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("lockWallet");

export const lockWallet = async (userId: string): Promise<WalletsDBObject> => {
  const now = Date.now();

  try {
    /*
      Attempt to lock the wallet by setting lockedAt to the current time.
      The wallet will be locked for the specified duration.
      If the wallet is already locked, the lock will only be acquired if the lock has expired.
      */
    const result = await docClient.send(
      new UpdateCommand({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: userId },
        UpdateExpression: `SET lockedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpiredAt`,
        ExpressionAttributeValues: {
          ":now": now.toString(),
          ":lockExpiredAt": (now - LOCK_DURATION).toString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    // Lock acquired successfully
    logger.info("Lock acquired", { result, userId });

    return result.Attributes as WalletsDBObject;
  } catch (error: unknown) {
    // Log and throw an error
    if (error instanceof ConditionalCheckFailedException) {
      logger.error("Wallet is already locked", { userId, error });
      throw new Error("Wallet is already locked or it doesn't exist");
    }
    logger.error("Error locking the wallet:", { userId, error });
    throw error;
  }
};
