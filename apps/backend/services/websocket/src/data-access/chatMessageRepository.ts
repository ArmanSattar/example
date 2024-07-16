import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ChatMessage } from "@solspin/websocket-types";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.CHAT_MESSAGES_TABLE_NAME;

if (!tableName) {
  throw new Error("CHAT_MESSAGES_TABLE_NAME environment variable is not set");
}

export const saveMessage = async (message: ChatMessage): Promise<void> => {
  const params = {
    TableName: tableName,
    Item: message,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (error) {
    throw new Error(`Failed to save message: ${error}`);
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const params = {
    TableName: tableName,
    Key: {
      messageId,
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
  } catch (error) {
    throw new Error(`Failed to delete message: ${error}`);
  }
};

export const getMessageHistory = async (limit: number = 10): Promise<ChatMessage[]> => {
  const CHANNEL = "GENERAL";

  const params = {
    TableName: tableName,
    IndexName: "bySentAt",
    KeyConditionExpression: "channel = :pkValue AND sentAt > :minSentAt",
    ExpressionAttributeValues: {
      ":pkValue": CHANNEL,
      ":minSentAt": 0,
    },
    ScanIndexForward: false,
    Limit: limit,
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));

    const items = data.Items
      ? data.Items.map((item) => ({
          messageId: item.messageId || "",
          message: item.message || "",
          sentAt: item.sentAt || 0,
          userId: item.userId || "",
          username: item.username || "",
          profilePicture: item.profilePicture || "",
        }))
      : [];

    return items.reverse() as ChatMessage[];
  } catch (error) {
    console.error("Error fetching message history:", error);
    throw new Error(`Failed to get message history: ${error}`);
  }
};
