import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { WalletsDBObject } from "../foundation/types";
import { WALLETS_TABLE_ARN } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const logger = getLogger("updateWallet");

export const updateUser = async (wallet: WalletsDBObject): Promise<void> => {
  // Maybe look at using updateItem instead of putItem
  const params = {
    TableName: WALLETS_TABLE_ARN,
    Item: wallet,
  };
  await docClient.send(new PutCommand(params));
  logger.info("Wallet updated", { wallet });
};
