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

export const getMessageHistory = async (limit: number = 50): Promise<ChatMessage[]> => {
  const params = {
    TableName: tableName,
    Limit: limit,
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    // Ensure we return an array, even if data.Items is undefined or null
    const items = data.Items
      ? data.Items.map((item) => ({
          messageId: item.messageId?.S || "",
          message: item.message?.S || "",
          timestamp: item.timestamp ? Number(item.timestamp.N) : 0,
          userId: item.userId?.S || "",
          username: item.username?.S || "",
          profilePicture: item.profilePicture?.S || "",
        }))
      : [];
    return items as ChatMessage[];
  } catch (error) {
    throw new Error(`Failed to get message history: ${error}`);
  }
};

export const updateMessage = async (
  messageId: string,
  updates: Partial<ChatMessage>
): Promise<void> => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: { [key: string]: string } = {};
  const expressionAttributeValues: { [key: string]: any } = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== "messageId") {
      // Don't update the key attribute
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = value;
    }
  });

  const params = {
    TableName: tableName,
    Key: {
      messageId,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  try {
    await ddbDocClient.send(new UpdateCommand(params));
  } catch (error) {
    throw new Error(`Failed to update message: ${error}`);
  }
};

export const getOldestMessage = async (userId: string): Promise<ChatMessage | null> => {
  const params = {
    TableName: process.env.CHAT_MESSAGES_TABLE_NAME,
    IndexName: "UserIdTimestampIndex",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    Limit: 1,
    ScanIndexForward: true,
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return data.Items && data.Items.length > 0 ? (data.Items[0] as ChatMessage) : null;
  } catch (error) {
    throw new Error(`Failed to get oldest message: ${error}`);
  }
};

export const incrementMessageCount = async (userId: string): Promise<number> => {
  const params = {
    TableName: tableName,
    Key: {
      userId,
    },
    UpdateExpression: "SET messageCount = if_not_exists(messageCount, :zero) + :one",
    ExpressionAttributeValues: {
      ":zero": 0,
      ":one": 1,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes?.messageCount as number;
  } catch (error) {
    throw new Error(`Failed to increment message count: ${error}`);
  }
};
