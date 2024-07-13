import { WebSocketApiHandler } from "sst/node/websocket-api";
import { getConnectionInfo } from "../helpers/handleConnections";
import { getLogger } from "@solspin/logger";
import { randomUUID } from "crypto";
import { broadcastMessage, sendWebSocketMessage } from "@solspin/web-socket-message";
import {
  ConnectionInfo,
  WebSocketChatMessagePayloadSchema,
  ChatMessage,
  WebSocketChatMessageResponseSchema,
} from "@solspin/websocket-types";
import {
  saveMessage,
  getOldestMessage,
  deleteMessage,
  getMessageHistory,
} from "../data-access/chatMessageRepository";
import { callGetUser } from "../helpers/getUserHelper";
import { getAllConnectionIds } from "../data-access/connectionRepository";

const logger = getLogger("chat-handler");
const MESSAGE_HISTORY_MAX_NUMBER: number = Number(process.env.MESSAGE_HISTORY_MAX_NUMBER) || 25;
const tableName = process.env.CHAT_MESSAGES_TABLE_NAME;
if (!tableName) {
  throw new Error("CHAT_MESSAGES_TABLE_NAME environment variable is not set");
}
export const handler = WebSocketApiHandler(async (event) => {
  const { stage, domainName } = event.requestContext;
  const messageEndpoint = `${domainName}/${stage}`;
  const connectionId = event.requestContext?.connectionId;

  try {
    const TYPE = "chat";
    logger.info(`Websocket chat handler invoked with connectionId: ${connectionId}`);
    if (!connectionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "connectionId is required" }),
      };
    }

    const parsedBody = JSON.parse(event.body || "{}");
    let payload = WebSocketChatMessagePayloadSchema.parse(parsedBody);
    const { message } = payload;

    const connectionInfo: ConnectionInfo | null = await getConnectionInfo(connectionId);
    if (!connectionInfo || !connectionInfo.userId) {
      throw new Error("User is not logged in");
    }

    const userId = connectionInfo.userId;
    // Get user info including username and profile picture
    const userInfo = await callGetUser(userId);

    const chatMessage: ChatMessage = {
      messageId: randomUUID(),
      message,
      timestamp: Date.now(),
      userId,
      username: userInfo.username,
      profilePicture: userInfo.profilePicture,
    };
    // Save the new message
    await saveMessage(chatMessage);

    const messageHistory = await getMessageHistory();
    if (messageHistory.length > MESSAGE_HISTORY_MAX_NUMBER) {
      const oldestMessage = await getOldestMessage();
      if (oldestMessage) {
        await deleteMessage(oldestMessage.messageId);
      }
    }

    logger.info("Message successfuly saved");

    const connectionIds: string[] = await getAllConnectionIds();

    const broadcastChatMessage = {
      messageId: chatMessage.messageId,
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
      username: chatMessage.username,
      profilePicture: chatMessage.profilePicture,
    };
    broadcastMessage(messageEndpoint, broadcastChatMessage, connectionIds, TYPE);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message processed successfully" }),
    };
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    logger.error(`Error occurred in chat handler: ${error}`);

    sendWebSocketMessage(messageEndpoint, connectionId, { message: errorMessage }, "error");
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: (error as Error).message,
      }),
    };
  }
});
