import { Config, Cron, Function, StackContext, use, WebSocketApi } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { WebSocketHandlerAPI } from "./WebSocketHandlerStack";
import * as cdk from "aws-cdk-lib";

export function WebSocketGateway({ stack }: StackContext) {
  const { websocketTable } = use(WebSocketHandlerAPI);
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

  const eventBusPolicy = new PolicyStatement({
    actions: ["events:PutEvents"],
    resources: [eventBusArn],
  });

  const api = new WebSocketApi(stack, "WebSocketGatewayApi", {
    defaults: {
      function: {
        timeout: 20,
        environment: {
          WEBSOCKET_CONNECTIONS_TABLE_NAME: websocketTable.tableName,
          GET_CASE_FUNCTION_NAME: getCaseFunction.functionName,
          PERFORM_SPIN_FUNCTION_NAME: performSpinFunction.functionName,
          EVENT_BUS_ARN: eventBusArn,
          BET_TRANSACTION_FUNCTION_NAME: betTransactionFunction.functionName,
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
              resources: [websocketTable.tableArn],
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
              resources: [websocketTable.tableArn],
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
              resources: [websocketTable.tableArn],
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
              resources: [websocketTable.tableArn],
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
              resources: [websocketTable.tableArn, callAuthorizerFunction.functionArn],
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
              resources: [websocketTable.tableArn],
            }),
          ],
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
                websocketTable.tableArn,
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
          WEBSOCKET_CONNECTIONS_TABLE_NAME: websocketTable.tableName,
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

  pruneConnectionCRON.bind([websocketTable]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
