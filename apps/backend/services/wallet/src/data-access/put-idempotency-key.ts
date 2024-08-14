import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { IDEMPOTENCY_TABLE_NAME } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LOG = getLogger("put-idempotency-key");

export async function putIdempotencyKey(requestId: string) {
  try {
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24; // 24 hours

    const params = {
      TableName: IDEMPOTENCY_TABLE_NAME,
      Item: {
        id: requestId,
        createdAt: now,
        expiresAt,
      },
    };

    const { Attributes } = await docClient.send(new PutCommand(params));
    LOG.info(`Recorded Idempotency Key: ${requestId}`, Attributes);
    return Attributes;
  } catch (error) {
    LOG.error("Error occurred when recording Idempotency Key", { error });
    throw error;
  }
}
