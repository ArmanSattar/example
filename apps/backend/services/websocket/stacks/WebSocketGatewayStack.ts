import { Config, Cron, Function, StackContext, use, WebSocketApi } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { WebSocketHandlerAPI } from "./WebSocketHandlerStack";
import * as cdk from "aws-cdk-lib";

export function WebSocketGateway({ stack }: StackContext) {
  const { websocketConnectionsTable, websocketChatMessagesTable } = use(WebSocketHandlerAPI);
  const eventBusArn = cdk.Fn.importValue(`EventBusArn--${stack.stage}`);
  const existingEventBus = cdk.aws_events.EventBus.fromEventBusArn(
    stack,
    "solspin-event-bus",
    eventBusArn
  );
  new cdk.aws_events.Rule(stack, "GameOutcomeRule", {
    eventBus: existingEventBus,
    eventPattern: {
      source: ["orchestration_service.GameOutcome"],
      detailType: ["event"],
    },
  });

  const TEST_SECRET = new Config.Secret(stack, "TEST_SECRET");

  const callAuthorizerFunction = Function.fromFunctionName(
    stack,
    "CallAuthorizerFunction",
    "dev-user-management-UserManagementHandlerAPI-authorizer"
  );

  const getCaseFunction = Function.fromFunctionName(
    stack,
    "GetCaseFunction",
    "dev-game-engine-GameEngineHandlerAPI-getCaseFunction"
  );

  const performSpinFunction = Function.fromFunctionName(
    stack,
    "PerformSpinFunction",
    "dev-game-engine-GameEngineHandlerAPI-performSpinFunction"
  );

  const betTransactionFunction = Function.fromFunctionName(
    stack,
    "UpdateBalanceFunction",
    "dev-wallet-ApiStack-update-balance"
  );

  const getUserFunction = Function.fromFunctionName(
    stack,
    "GetUserFunction",
    "dev-user-management-UserManagementHandlerAPI-getUser"
  );

  const eventBusPolicy = new PolicyStatement({
    actions: ["events:PutEvents"],
    resources: [eventBusArn],
  });

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
              actions: ["dynamodb:PutItem", "dynamodb:GetItem"],
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
              actions: ["dynamodb:PutItem", "dynamodb:GetItem"],
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
              actions: ["dynamodb:PutItem", "dynamodb:GetItem", "lambda:InvokeFunction"],
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
              actions: ["dynamodb:PutItem", "dynamodb:GetItem", "lambda:InvokeFunction"],
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
              actions: ["dynamodb:Query"],
              resources: [`${websocketChatMessagesTable.tableArn}/*`],
            }),
            new PolicyStatement({
              actions: ["dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:GetItem"],
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

  const pruneConnectionCRON = new Cron(stack, "PruneConnectionsCron", {
    schedule: "rate(1 minute)",
    job: {
      function: {
        handler: "src/handlers/pruneConnections.handler",
        permissions: ["dynamodb:Scan", "dynamodb:DeleteItem", "execute-api:ManageConnections"],
        environment: {
          WEBSOCKET_CONNECTIONS_TABLE_NAME: websocketConnectionsTable.tableName,
          DOMAIN: domainName,
        },
      },
    },
  });

  pruneConnectionCRON.attachPermissions([
    "dynamodb:Scan",
    "dynamodb:DeleteItem",
    "execute-api:ManageConnections",
  ]);

  pruneConnectionCRON.bind([websocketConnectionsTable]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
