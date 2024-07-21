import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
  GetCommand,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.WEBSOCKET_STATS_TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error("Table name not found in environment variables");
}

export async function updateActiveConnections(increment: boolean): Promise<number> {
  try {
    const updateParams: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: { id: "activeConnections" },
      UpdateExpression: "SET #count = if_not_exists(#count, :zero) + :inc",
      ExpressionAttributeNames: {
        "#count": "count",
      },
      ExpressionAttributeValues: {
        ":inc": increment ? 1 : -1,
        ":zero": 0,
      },
      ReturnValues: "UPDATED_NEW",
    };

    const { Attributes } = await docClient.send(new UpdateCommand(updateParams));
    console.log("Updated active connections:", Attributes);
    return Attributes?.count as number;
  } catch (error) {
    console.error("Error updating active connections:", error);
    throw error;
  }
}

export async function getActiveConnections(): Promise<number> {
  try {
    const getParams: GetCommandInput = {
      TableName: TABLE_NAME,
      Key: { id: "activeConnections" },
    };

    const { Item } = await docClient.send(new GetCommand(getParams));
    return (Item?.count as number) || 0;
  } catch (error) {
    console.error("Error getting active connections:", error);
    throw error;
  }
}
