import { ApiGatewayManagementApi } from "aws-sdk";

export async function sendWebSocketMessage(
  endpoint: string,
  connectionId: string,
  message: object,
  type: string
) {
  const formattedMessage = {
    type,
    message,
  };
  const apiG = new ApiGatewayManagementApi({
    endpoint,
  });

  await apiG
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(formattedMessage),
    })
    .promise();
}

export async function broadcastMessage(
  endpoint: string,
  message: any,
  connectionIds: string[],
  type: string
) {
  try {
    console.log(message);
    const sendMessages = connectionIds.map((connectionId) =>
      sendWebSocketMessage(endpoint, connectionId, message, type)
    );

    await Promise.all(sendMessages);
  } catch (error) {
    throw new Error(`Failed to broadcast message: ${error}`);
  }
}
