import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { TransactionsDBObject, TransactionType } from "../foundation/types";
import { getLogger } from "@solspin/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("record-transaction");

export const recordTransaction = async (
  id: string,
  userId: string,
  amount: number,
  walletAddress: string,
  txnId: string,
  type: TransactionType
): Promise<void> => {
  try {
    const createdAt = new Date().toISOString();

    const transaction: TransactionsDBObject = {
      id: id,
      userId: userId,
      amount: amount,
      createdAt: createdAt,
      walletAddress: walletAddress,
      txnId: txnId,
      type: type,
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.TRANSACTIONS_TABLE_NAME,
        Item: transaction,
      })
    );

    logger.info("Transaction recorded successfully", { transaction });
  } catch (error) {
    logger.error("Error in recordTransaction", { error });
    throw error;
  }
};
