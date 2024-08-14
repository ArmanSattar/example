import { WebSocketApiHandler } from "sst/node/websocket-api";
import { generateServerSeed } from "../helpers/handleConnections";
import { hashString } from "@solspin/hash";
import { sendWebSocketMessage } from "@solspin/events/utils/sendWebSocketMessage";
import { getLogger } from "@solspin/events/utils/logger";

const logger = getLogger("generate-server-seed-handler");

export const handler = WebSocketApiHandler(async (event) => {
  const connectionId = event.requestContext?.connectionId;
  const { stage, domainName } = event.requestContext;
  logger.info(`Generate seed lambda invoked with connectionId: ${connectionId}`);
  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "connectionId is required" }),
    };
  }

  try {
    const serverSeed = await generateServerSeed(connectionId);
    logger.info(`Generated server seed: ${serverSeed}`);
    const hashedServerSeed = hashString(serverSeed);

    const messageEndpoint = `${domainName}/${stage}`;
    const webSocketMessage = {
      "server-seed-hash": hashedServerSeed,
    };
    await sendWebSocketMessage(messageEndpoint, connectionId, webSocketMessage, "case");
    return {
      statusCode: 200,
      body: JSON.stringify({ serverSeed }),
    };
  } catch (error) {
    logger.error(`Error occured in generate seed lambda: ${(error as Error).message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to generate server seed",
        error: (error as Error).message,
      }),
    };
  }
});
