import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  EnvironmentVariableError,
  SaveUserError,
  GetUserError,
  DeleteUserError,
  UpdateUserError,
} from "@solspin/errors";
import { User } from "@solspin/user-management-types";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.USERS_TABLE_NAME;
const walletAddressIndexName = "walletAddressIndex";

if (!tableName) {
  throw new EnvironmentVariableError("TABLE_NAME");
}

export const walletAddressExists = async (walletAddress: string): Promise<boolean> => {
  const params = {
    TableName: tableName,
    IndexName: walletAddressIndexName,
    KeyConditionExpression: "walletAddress = :walletAddress",
    ExpressionAttributeValues: {
      ":walletAddress": walletAddress,
    },
  };

  const result = await ddbDocClient.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0;
};

export const getUserByWalletAddress = async (walletAddress: string): Promise<User | null> => {
  const params = {
    TableName: tableName,
    IndexName: walletAddressIndexName,
    KeyConditionExpression: "walletAddress = :walletAddress",
    ExpressionAttributeValues: {
      ":walletAddress": walletAddress,
    },
  };

  const result = await ddbDocClient.send(new QueryCommand(params));

  if (result.Items && result.Items.length > 0) {
    return result.Items[0] as User;
  }

  return null;
};

export const buildUpdateExpression = (updateFields: Record<string, any>) => {
  let UpdateExpression = "set";
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, any> = {};

  for (const [key, value] of Object.entries(updateFields)) {
    UpdateExpression += ` #${key} = :${key},`;
    ExpressionAttributeNames[`#${key}`] = key;
    ExpressionAttributeValues[`:${key}`] = value;
  }

  UpdateExpression = UpdateExpression.slice(0, -1);

  return {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};

export const createUser = async (user: User): Promise<void> => {
  const exists = await walletAddressExists(user.walletAddress);

  if (exists) {
    throw new Error(`User with walletAddress ${user.walletAddress} already exists.`);
  }

  const params = {
    TableName: tableName,
    Item: user,
    ConditionExpression: "attribute_not_exists(userId)", // Ensure userId is unique
  };

  await ddbDocClient.send(new PutCommand(params));
};

export const updateUser = async (
  userId: string,
  updateFields: Record<string, any>
): Promise<any> => {
  const key = { userId };

  const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
    buildUpdateExpression(updateFields);

  const updateParams = {
    TableName: tableName,
    Key: key,
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW" as const,
  };

  const result = await ddbDocClient.send(new UpdateCommand(updateParams));
  return result.Attributes;
};

export const getUser = async (userId: string): Promise<any> => {
  const params = {
    TableName: tableName,
    Key: { userId },
  };

  const data = await ddbDocClient.send(new GetCommand(params));
  return data.Item;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const params = {
    TableName: tableName,
    Key: { userId },
  };

  await ddbDocClient.send(new DeleteCommand(params));
};
