import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { EnvironmentVariableError } from "@solspin/errors";

interface Nonce {
  walletAddress: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
}

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.NONCE_TABLE_NAME;
const walletAddressIndexName = "walletAddressIndex";

if (!tableName) {
  throw new EnvironmentVariableError("NONCE_TABLE_NAME");
}

export const createNonce = async (nonce: Nonce): Promise<void> => {
  try {
    const params = {
      TableName: tableName,
      Item: nonce,
    };

    await ddbDocClient.send(new PutCommand(params));
  } catch (error) {
    throw new Error(`Failed to save nonce for wallet ${nonce.walletAddress}`, error);
  }
};

export const getNonceByWalletAddress = async (walletAddress: string): Promise<Nonce | null> => {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "walletAddress = :walletAddress",
      ExpressionAttributeValues: {
        ":walletAddress": walletAddress,
      },
    };

    const result = await ddbDocClient.send(new QueryCommand(params));

    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as Nonce;
    }

    return null;
  } catch (error) {
    throw new Error(`Failed to get nonce for wallet ${walletAddress}`, error);
  }
};

export const deleteNonce = async (walletAddress: string): Promise<void> => {
  try {
    const params = {
      TableName: tableName,
      Key: { walletAddress },
    };

    await ddbDocClient.send(new DeleteCommand(params));
  } catch (error) {
    throw new Error(`Failed to delete nonce for wallet ${walletAddress}`, error);
  }
};

export const nonceExists = async (walletAddress: string): Promise<boolean> => {
  try {
    const nonce = await getNonceByWalletAddress(walletAddress);
    return nonce !== null;
  } catch (error) {
    throw new Error(`Failed to check nonce existence for wallet ${walletAddress}`, error);
  }
};

export const isNonceValid = async (walletAddress: string, nonce: string): Promise<boolean> => {
  try {
    const storedNonce = await getNonceByWalletAddress(walletAddress);
    if (!storedNonce) return false;

    const now = new Date();
    const createdAt = new Date(storedNonce.createdAt);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    return storedNonce.nonce === nonce && now.getTime() - createdAt.getTime() < fiveMinutes;
  } catch (error) {
    throw new Error(`Failed to validate nonce for wallet ${walletAddress}`, error);
  }
};
