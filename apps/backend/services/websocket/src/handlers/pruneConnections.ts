import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { handleConnectionClose } from "../helpers/handleConnections";
import { ApiHandler } from "sst/node/api";
import { sendWebSocketMessage } from "@solspin/web-socket-message";
import { getLogger } from "@solspin/logger";

const logger = getLogger("prune-connections-handler");
const dynamoDbClient = new DynamoDBClient({});
const TABLE_NAME = process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME;
const messageEndpoint = process.env.DOMAIN as string;
export const handler = ApiHandler(async (event) => {
  try {
    const scanParams = {
      TableName: TABLE_NAME,
      ProjectionExpression: "connectionId",
    };

    const scanResult = await dynamoDbClient.send(new ScanCommand(scanParams));
    const connections = scanResult.Items || [];

    for (const connection of connections) {
      const connectionId = connection.connectionId.S;
      if (!connectionId) continue;
      try {
        const message = {
          type: "ping",
        };
        await sendWebSocketMessage(messageEndpoint, connectionId, message, "health-check");
      } catch (error) {
        if ((error as Error).name === "GoneException") {
          // Connection is closed, delete it from the table
          logger.info(`Connection ${connectionId} is closed. Deleting from table.`);
          await handleConnectionClose(connectionId);
        } else {
          logger.error(
            `Failed to send ping to connection ${connectionId}: ${(error as Error).message}`
          );
        }
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Finished pruning closed connections",
      }),
    };
  } catch (error) {
    logger.error(`Error pruning connections: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to close connection",
        error: (error as Error).message,
      }),
    };
  }
});
