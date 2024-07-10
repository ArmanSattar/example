import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ConnectionInfo } from "@solspin/websocket-types";
import {
  EnvironmentVariableError,
  SaveConnectionInfoError,
  DeleteConnectionInfoError,
  GetConnectionInfoError,
} from "@solspin/errors";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME;

if (!tableName) {
  throw new EnvironmentVariableError("TABLE_NAME");
}

export const saveConnectionInfo = async (
  connectionId: string,
  info: ConnectionInfo
): Promise<void> => {
  const params = {
    TableName: tableName,
    Item: {
      connectionId: connectionId,
      isAuthenticated: info.isAuthenticated,
      userId: info.userId,
      serverSeed: info.serverSeed,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (error) {
    throw new SaveConnectionInfoError(error as string);
  }
};

export const deleteConnectionInfo = async (connectionId: string): Promise<void> => {
  const params = {
    TableName: tableName,
    Key: {
      connectionId: connectionId,
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
  } catch (error) {
    throw new DeleteConnectionInfoError(error as string);
  }
};

export const getConnectionInfoFromDB = async (
  connectionId: string
): Promise<ConnectionInfo | null> => {
  const params = {
    TableName: tableName,
    Key: {
      connectionId: connectionId,
    },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    return data.Item as ConnectionInfo | null;
  } catch (error) {
    throw new GetConnectionInfoError(error as string);
  }
};

export const updateConnectionInfo = async (
  connectionId: string,
  updates: Partial<ConnectionInfo>
): Promise<void> => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: { [key: string]: string } = {};
  const expressionAttributeValues: { [key: string]: any } = {};

  Object.entries(updates).forEach(([key, value], index) => {
    updateExpressions.push(`#field${index} = :value${index}`);
    expressionAttributeNames[`#field${index}`] = key;
    expressionAttributeValues[`:value${index}`] = value;
  });

  const params = {
    TableName: tableName,
    Key: {
      connectionId: connectionId,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  await ddbDocClient.send(new UpdateCommand(params));
};
