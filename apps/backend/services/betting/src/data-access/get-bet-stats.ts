import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { BET_STATS_TABLE_NAME } from "../foundation/runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getBetStats(userId: string) {
  try {
    const getParams: GetCommandInput = {
      TableName: BET_STATS_TABLE_NAME,
      Key: { userId },
    };

    const { Item } = await docClient.send(new GetCommand(getParams));

    if (Item) {
      console.log("Retrieved bet stats:", Item);
      return Item;
    } else {
      console.log("No bet stats found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching bet stats:", error);
    throw error;
  }
}
