import { Config, Cron, Function, StackContext, use, WebSocketApi } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { WebSocketHandlerAPI } from "./WebSocketHandlerStack";
import * as cdk from "aws-cdk-lib";

export function WebSocketGateway({ stack }: StackContext) {
  const { websocketConnectionsTable, websocketChatMessagesTable } = use(WebSocketHandlerAPI);
  const eventBusArn = cdk.Fn.importValue(`EventBusArn--${stack.stage}`);

  const TEST_SECRET = new Config.Secret(stack, "TEST_SECRET");

  const callAuthorizerFunction = Function.fromFunctionName(
    stack,
    "CallAuthorizerFunction",
    `${stack.stage}-user-management-UserManagementHandlerAPI-authorizer`
  );

  const getCaseFunction = Function.fromFunctionName(
    stack,
    "GetCaseFunction",
    `${stack.stage}-game-engine-GameEngineHandlerAPI-getCaseFunction`
  );

  const performSpinFunction = Function.fromFunctionName(
    stack,
    "PerformSpinFunction",
    `${stack.stage}-game-engine-GameEngineHandlerAPI-performSpinFunction`
  );

  const betTransactionFunction = Function.fromFunctionName(
    stack,
    "UpdateBalanceFunction",
    `${stack.stage}-wallet-ApiStack-update-balance`
  );

  const getUserFunction = Function.fromFunctionName(
    stack,
    "GetUserFunction",
    `${stack.stage}-user-management-UserManagementHandlerAPI-getUser`
  );

  const api = new WebSocketApi(stack, "WebSocketGatewayApi", {
    defaults: {
      function: {
        timeout: 20,
        environment: {
          WEBSOCKET_CONNECTIONS_TABLE_NAME: websocketConnectionsTable.tableName,
          GET_CASE_FUNCTION_NAME: getCaseFunction.functionName,
          PERFORM_SPIN_FUNCTION_NAME: performSpinFunction.functionName,
          EVENT_BUS_ARN: eventBusArn,
          BET_TRANSACTION_FUNCTION_NAME: betTransactionFunction.functionName,
          GET_USER_FUNCTION_NAME: getUserFunction.functionName,
        },
      },
    },
    routes: {
      $connect: {
        function: {
          handler: "src/handlers/handleNewConnection.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:PutItem", "dynamodb:DeleteItem"],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
        },
      },
      $default: {
        function: {
          handler: "src/handlers/closeConnection.handler",
          timeout: 10,
        },
      },
      $disconnect: {
        function: {
          handler: "src/handlers/handleConnectionClose.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:DeleteItem"],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
        },
      },
      logout: {
        function: {
          handler: "src/handlers/handleLogout.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
        },
      },
      "generate-seed": {
        function: {
          handler: "src/handlers/generateServerSeed.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
        },
      },
      authenticate: {
        function: {
          handler: "src/handlers/authenticateUser.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "lambda:InvokeFunction",
                "dynamodb:UpdateItem",
              ],
              resources: [websocketConnectionsTable.tableArn, callAuthorizerFunction.functionArn],
            }),
          ],
          environment: {
            AUTHORIZER_FUNCTION_NAME: callAuthorizerFunction.functionName,
          },
          bind: [TEST_SECRET],
        },
      },
      unauthenticate: {
        function: {
          handler: "src/handlers/unauthenticateUser.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "lambda:InvokeFunction",
                "dynamodb:UpdateItem",
              ],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
        },
      },
      chat: {
        function: {
          handler: "src/handlers/chat.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: [
                "dynamodb:PutItem",
                "lambda:InvokeFunction",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
              ],
              resources: [websocketConnectionsTable.tableArn, getUserFunction.functionArn],
            }),
            new PolicyStatement({
              actions: ["dynamodb:Scan", "dynamodb:Query"],
              resources: [`${websocketChatMessagesTable.tableArn}/*`],
            }),
            new PolicyStatement({
              actions: [
                "dynamodb:PutItem",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:Query",
              ],
              resources: [websocketChatMessagesTable.tableArn],
            }),
          ],
          environment: {
            CHAT_MESSAGES_TABLE_NAME: websocketChatMessagesTable.tableName,
          },
        },
      },
      "case-spin": {
        function: {
          handler: "src/handlers/case-orchestration.handler",
          timeout: 10,
          permissions: [
            new PolicyStatement({
              actions: [
                "lambda:InvokeFunction",
                "dynamodb:GetItem",
                "events:PutEvents",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
              ],
              resources: [
                getCaseFunction.functionArn,
                performSpinFunction.functionArn,
                eventBusArn,
                websocketConnectionsTable.tableArn,
                betTransactionFunction.functionArn,
              ],
            }),
          ],
          environment: {
            EVENT_BUS_ARN: eventBusArn,
          },
        },
      },
      "player-count": {
        function: {
          handler: "src/handlers/sendPlayersOnline.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:Scan"],
              resources: [websocketConnectionsTable.tableArn],
            }),
          ],
          timeout: 10,
        },
      },
    },
  });

  // TODO - Find the handler that needs permision to invoke betTransactionFunction and add it to it and remove this
  api.attachPermissions([
    new PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: [
        getCaseFunction.functionArn,
        performSpinFunction.functionArn,
        betTransactionFunction.functionArn,
      ],
    }),
  ]);

  const matches = api.url.match(/^wss?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  const domainName = `${matches && matches[1]}/${stack.stage}`;

  const broadcastPlayersOnlineCRON = new Cron(stack, "BroadcastPlayersOnlineCRON", {
    schedule: "rate(1 minute)",
    job: {
      function: {
        handler: "src/handlers/broadcastPlayersOnline.handler",
        permissions: ["dynamodb:Scan", "execute-api:ManageConnections"],
        environment: {
          WEBSOCKET_CONNECTIONS_TABLE_NAME: websocketConnectionsTable.tableName,
          DOMAIN: domainName,
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
