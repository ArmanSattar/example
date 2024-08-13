import { WebSocketApiHandler } from "sst/node/websocket-api";
import { getLogger } from "@solspin/logger";
import { broadcastMessage, sendWebSocketMessage } from "@solspin/web-socket-message";
import { getAllConnectionIds } from "../data-access/connectionRepository";

const logger = getLogger("broadcast-active-players-handler");
const tableName = process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME;
if (!tableName) {
  throw new Error("WEBSOCKET connections table name environment variable is not set");
}
export const handler = WebSocketApiHandler(async (event) => {
  try {
    const TYPE = "chat";
    const playersConnected = await getAllConnectionIds();
    const numPlayersConnected = playersConnected.length;
    const connectionId = event.requestContext?.connectionId;
    const { stage, domainName } = event.requestContext;
    const messageEndpoint = `${domainName}/${stage}`;
    const message = {
      "player-count": {
        count: numPlayersConnected,
      },
    };

    await sendWebSocketMessage(messageEndpoint, connectionId, message, TYPE);

    logger.info(`Player count sent to connection id ${connectionId}...`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message processed successfully" }),
    };
  } catch (error) {
    logger.error(`Error occurred in chat handler: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: (error as Error).message,
      }),
    };
  }
});
