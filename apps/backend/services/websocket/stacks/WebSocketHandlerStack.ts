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
      timestamp: "number",
      userId: "string",
      username: "string",
      profilePicture: "string",
    },
    primaryIndex: { partitionKey: "messageId", sortKey: "timestamp" },
    globalIndexes: {
      TimestampIndex: {
        partitionKey: "timestamp",
      },
    },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  return {
    websocketConnectionsTable: websocketConnectionsTable,
    websocketChatMessagesTable: websocketChatMessagesTable,
  };
}
