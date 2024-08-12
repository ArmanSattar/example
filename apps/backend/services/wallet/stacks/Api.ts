import { Api, Function, StackContext, use } from "sst/constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "./Database";

export function ApiStack({ stack }: StackContext) {
  const { walletsTableArn, walletsTableName, transactionsTableName, transactionsTableArn } =
    use(DatabaseStack);
  const eventBusArn = cdk.Fn.importValue(`EventBusArn--${stack.stage}`);

  const existingEventBus = cdk.aws_events.EventBus.fromEventBusArn(
    stack,
    "solspin-event-bus",
    eventBusArn
  );

  const depositTreasuryFunction = Function.fromFunctionName(
    stack,
    "DepositTreasuryFunction",
    `${stack.stage}-treasury-ApiStack-deposit-to-wallet`
  );

  const createWalletFunction = new Function(stack, "CreateWalletFunction", {
    functionName: `${stack.stackName}-createWallet`,
    handler: "../wallet/src/service/event/handler/create-wallet.handler",
    environment: {
      WALLETS_TABLE_ARN: walletsTableName,
    },
    permissions: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [walletsTableArn],
      }),
    ],
  });

  const withdrawTreasuryFunction = Function.fromFunctionName(
    stack,
    "WithdrawTreasuryFunction",
    `${stack.stage}-treasury-ApiStack-withdraw-from-wallet`
  );

  const betTransactionHandler = new Function(stack, "BetTransactionHandler", {
    functionName: `${stack.stackName}-update-balance`,
    handler: "../wallet/src/service/event/handler/update-balance.handler",
    environment: {
      WALLETS_TABLE_ARN: walletsTableName,
    },
    permissions: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:UpdateItem"],
        resources: [walletsTableArn],
      }),
    ],
  });

  new cdk.aws_events.Rule(stack, "BetTransactionRule", {
    eventBus: existingEventBus,
    eventPattern: {
      source: ["betting_service.BetTransaction"],
      detailType: ["event"],
    },
    targets: [new cdk.aws_events_targets.LambdaFunction(betTransactionHandler)],
  });

  new cdk.aws_events.Rule(stack, "CreateWalletRule", {
    eventBus: existingEventBus,
    eventPattern: {
      source: ["user_service.CreateWallet"],
      detailType: ["event"],
    },
    targets: [new cdk.aws_events_targets.LambdaFunction(createWalletFunction)],
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        enableLiveDev: stack.stage === "dev",
        environment: {
          WALLETS_TABLE_ARN: walletsTableName,
          DEPOSIT_TREASURY_FUNCTION_ARN: depositTreasuryFunction.functionArn,
          WITHDRAW_TREASURY_FUNCTION_ARN: withdrawTreasuryFunction.functionArn,
          TRANSACTIONS_TABLE_ARN: transactionsTableName,
        },
      },
    },
    routes: {
      "POST /wallets": {
        function: {
          handler: "src/service/event/handler/create-wallet.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:PutItem"],
              resources: [walletsTableArn],
            }),
          ],
        },
      },
      "GET /wallets/{userId}": {
        function: {
          handler: "src/service/api/handler/get-wallet-by-userid.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:GetItem"],
              resources: [walletsTableArn],
            }),
          ],
        },
      },
      "GET /wallets/{userId}/transactions": {
        function: {
          handler: "src/service/api/handler/get-wallet-transactions.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:GetItem"],
              resources: [transactionsTableArn],
            }),
          ],
        },
      },
      "POST /wallets/deposit": {
        function: {
          handler: "src/service/api/handler/deposit-to-wallet.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:UpdateItem", "dynamodb:PutItem"],
              resources: [walletsTableArn, transactionsTableArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [depositTreasuryFunction.functionArn],
            }),
          ],
          timeout: 90,
        },
      },
      "POST /wallets/withdraw": {
        function: {
          handler: "src/service/api/handler/withdraw-from-wallet.handler",
          permissions: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["dynamodb:UpdateItem", "dynamodb:PutItem"],
              resources: [walletsTableArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [withdrawTreasuryFunction.functionArn],
            }),
          ],
          timeout: 90,
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    createWalletFunctionName: createWalletFunction.functionName,
  });

  return {
    betTransactionHandler,
  };
}
