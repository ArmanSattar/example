import { WebSocketApiHandler } from "sst/node/websocket-api";
import { getLogger } from "@solspin/logger";
import { broadcastMessage } from "@solspin/web-socket-message";
import { getActiveConnections } from "../data-access/statsRepository";
import { getAllConnectionIds } from "../data-access/connectionRepository";

const logger = getLogger("broadcast-active-players-handler");
const tableName = process.env.WEBSOCKET_STATS_TABLE_NAME;
const messageEndpoint = process.env.DOMAIN as string;
if (!tableName) {
  throw new Error("WEBSOCKET stats table name environment variable is not set");
}
export const handler = WebSocketApiHandler(async (_event) => {
  try {
    const TYPE = "chat";
    console.log(messageEndpoint, tableName);
    const playersConnected: number = await getActiveConnections();
    const allConnectionIds: string[] = await getAllConnectionIds();
    const broadcastedMessage = {
      "player-count": {
        count: playersConnected,
      },
    };

    broadcastMessage(messageEndpoint, broadcastedMessage, allConnectionIds, TYPE);

    logger.info("Player count broadcasted...");

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
