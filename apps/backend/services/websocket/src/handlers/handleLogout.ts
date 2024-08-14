import { WebSocketApiHandler } from "sst/node/websocket-api";
import { handleLogout } from "../helpers/handleConnections";
import { getLogger } from "@solspin/events/utils/logger";

const logger = getLogger("handle-logout-handler");
export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;
  logger.info(`Handle logout lambda invoked with connectionId: ${connectionId}`);
  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "connectionId is required" }),
    };
  }

  try {
    await handleLogout(connectionId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User logged out" }),
    };
  } catch (error) {
    logger.error(`Error occured in handle logout lambda: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to logout user", error: (error as Error).message }),
    };
  }
});
