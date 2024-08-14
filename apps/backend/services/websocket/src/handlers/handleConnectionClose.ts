import { WebSocketApiHandler } from "sst/node/websocket-api";
import { handleConnectionClose } from "../helpers/handleConnections";
import { getLogger } from "@solspin/events/utils/logger";

const logger = getLogger("handle-connection-close-handler");
export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;
  logger.info(`Handle disconnect lambda invoked with connectionId: ${connectionId}`);
  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "connectionId is required" }),
    };
  }

  try {
    await handleConnectionClose(connectionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connection closed" }),
    };
  } catch (error) {
    logger.error(`Error occured in handle disconnect lambda: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to close connection",
        error: (error as Error).message,
      }),
    };
  }
});
