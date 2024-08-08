import { RemovalPolicy } from "aws-cdk-lib/core";
import { Function, StackContext, Table } from "sst/constructs";

export function WebSocketHandlerAPI({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";
  const websocketConnectionsTable = new Table(stack, "connections", {
    fields: {
      connectionId: "string",
      userId: "string",
      serverSeed: "string",
      isAuthorized: "binary",
      caseId: "string",
    },
    primaryIndex: { partitionKey: "connectionId" },
    stream: true,
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  const websocketChatMessagesTable = new Table(stack, "messages", {
    fields: {
      messageId: "string",
      message: "string",
      sentAt: "number",
      userId: "string",
      username: "string",
      profileImageUrl: "string",
      channel: "string",
      expirationTime: "number",
    },
    primaryIndex: { partitionKey: "messageId" },
    globalIndexes: {
      bySentAt: {
        partitionKey: "channel",
        sortKey: "sentAt",
      },
    },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        timeToLiveAttribute: "expirationTime",
      },
    },
  });

  return {
    websocketConnectionsTable: websocketConnectionsTable,
    websocketChatMessagesTable: websocketChatMessagesTable,
  };
}
