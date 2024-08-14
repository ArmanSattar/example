import { WebSocketApiHandler } from "sst/node/websocket-api";
import { unauthenticateUser } from "../helpers/handleConnections";
import { getLogger } from "@solspin/events/utils/logger";

const logger = getLogger("unauthenticate-user-handler");

export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;

  logger.info(`Unauthenticate user lambda handler invoked with connectionId: ${connectionId}`);
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is missing" }),
    };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const token: string = parsedBody?.token;

  logger.info(`Received token: ${token} || connectionId: ${connectionId} from event body`);
  if (!connectionId || !token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "connectionId and token are required" }),
    };
  }

  try {
    await unauthenticateUser(connectionId);
    logger.info(`Connection with id: ${connectionId} marked as unauthenticated`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User has been marked as unauthenticated" }),
    };
  } catch (error) {
    logger.error(`Error in unauthenticate user lambda: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to mark user as unauthenticated",
        error: (error as Error).message,
      }),
    };
  }
});
