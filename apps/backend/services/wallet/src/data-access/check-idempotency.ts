import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { IDEMPOTENCY_TABLE_NAME } from "../foundation/runtime";
import { DuplicateResourceError } from "@solspin/errors";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function checkIdempotencyAndThrow(idempotencyId: string) {
  try {
    const getParams: GetCommandInput = {
      TableName: IDEMPOTENCY_TABLE_NAME,
      Key: { id: idempotencyId },
    };

    const { Item } = await docClient.send(new GetCommand(getParams));

    if (Item !== undefined) {
      console.log("Idempotency key found:", Item);
      throw new DuplicateResourceError("Request already processed");
    } else {
      console.log("Idempotency key not found", Item);
      return;
    }
  } catch (error) {
    console.error("Error checking idempotency", error);
    console.log(IDEMPOTENCY_TABLE_NAME);
    throw error;
  }
}
