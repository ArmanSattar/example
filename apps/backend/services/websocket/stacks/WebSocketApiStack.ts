import { Api, Function, StackContext, use } from "sst/constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { WebSocketHandlerAPI } from "./WebSocketHandlerStack";
export function ChatApiStack({ stack }: StackContext) {
  const { websocketChatMessagesTable } = use(WebSocketHandlerAPI);
  const api = new Api(stack, "ChatApiStack", {
    routes: {
      "GET /chats": {
        function: {
          handler: "../websocket/src/handlers/getChats.handler",
          currentVersionOptions: {
            provisionedConcurrentExecutions: 2,
          },
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:GetItem", "dynamodb:Scan"],
              resources: [websocketChatMessagesTable.tableArn],
            }),
          ],
          environment: {
            CHAT_MESSAGES_TABLE_NAME: websocketChatMessagesTable.tableName,
          },
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
