import { Api, Function, StackContext, use } from "sst/constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "./Database";

export function ApiStack({ stack }: StackContext) {
  const { betsTableArn, betStatsTableArn, betStatsTableName } = use(DatabaseStack);
  const eventBusArn = cdk.Fn.importValue(`EventBusArn--${stack.stage}`);

  const existingEventBus = cdk.aws_events.EventBus.fromEventBusArn(
    stack,
    "solspin-event-bus",
    eventBusArn
  );

  const createBetHandler = new Function(stack, "CreateBetHandler", {
    functionName: `${stack.stackName}-createBet`,
    handler: "src/service/events/handler/create-bet.handler",
    environment: {
      BETS_TABLE_ARN: betsTableArn,
      EVENT_BUS_ARN: eventBusArn,
      BET_STATS_TABLE_NAME: betStatsTableName,
    },
    permissions: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [betsTableArn],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["events:PutEvents"],
        resources: [eventBusArn],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:UpdateItem", "dynamodb:PutItem"],
        resources: [betStatsTableArn],
      }),
    ],
  });

  new cdk.aws_events.Rule(stack, "GameOutcomeRule", {
    eventBus: existingEventBus,
    eventPattern: {
      source: ["orchestration_service.GameOutcome"],
      detailType: ["event"],
    },
    targets: [new cdk.aws_events_targets.LambdaFunction(createBetHandler)],
  });

  const api = new Api(stack, "api", {
    routes: {
      "GET /bets/{id}": {
        function: {
          handler: "src/service/api/handler/get-bet-by-id.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:GetItem"],
              resources: [betsTableArn],
            }),
          ],
        },
      },
      "GET /bets/user/{userId}": {
        function: {
          handler: "src/service/api/handler/list-bets-by-user-id.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:Query"],
              resources: [betsTableArn, `${betsTableArn}/*`],
            }),
          ],
        },
      },
      "GET /bets/stats/{userId}": {
        function: {
          handler: "src/service/api/handler/get-bet-stats.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:GetItem"],
              resources: [betStatsTableArn],
            }),
          ],
        },
      },
      "GET /bets/game/{gameId}": {
        function: {
          handler: "src/service/api/handler/list-bets-by-game-id.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:Query"],
              resources: [betsTableArn, `${betsTableArn}/*`],
            }),
          ],
        },
      },
    },
    defaults: {
      function: {
        environment: {
          BETS_TABLE_ARN: betsTableArn,
          EVENT_BUS_ARN: eventBusArn,
          BET_STATS_TABLE_NAME: betStatsTableName,
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
