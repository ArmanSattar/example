import { WebSocketApiHandler } from "sst/node/websocket-api";
import { authenticateUser } from "../helpers/handleConnections";
import { getLogger } from "@solspin/logger";
import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";

const logger = getLogger("authenticate-user-handler");

export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;

  logger.info(`Authenticate user lambda handler invoked with connectionId: ${connectionId}`);
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
    const decodedToken = jwt.verify(token, Config.TEST_SECRET) as { sub: string };

    const userId = decodedToken.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "UserId not found in token payload" }),
      };
    }

    await authenticateUser(connectionId, userId);
    logger.info(`Authenticated user successfully`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User has been marked as authenticated" }),
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error(`JWT verification failed: ${error.message}`);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token" }),
      };
    }
    logger.error(`Error in authenticate user lambda: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to mark user as authenticated",
        error: (error as Error).message,
      }),
    };
  }
});
