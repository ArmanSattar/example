import { WebSocketApiHandler } from "sst/node/websocket-api";
import { disconnectClient } from "../helpers/disconnectClient";
import { getLogger } from "@solspin/events/utils/logger";

const logger = getLogger("close-connection-handler");

export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;
  logger.info(`Handle connection close lambda invoked with connectionId: ${connectionId}`);
  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "connectionId is required" }),
    };
  }

  try {
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;

    await disconnectClient(domain, stage, connectionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User connection closed" }),
    };
  } catch (error) {
    logger.error(
      `Error occured in connection close lambda for connectionId: ${connectionId} error: ${
        (error as Error).message
      }`
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to close connection",
        error: (error as Error).message,
      }),
    };
  }
});
