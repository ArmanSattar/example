import { Function, StackContext, use } from "sst/constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DatabaseStack } from "./Database";

export function LambdaStack({ stack }: StackContext) {
  const { transactionsTableArn, transactionsTableName } = use(DatabaseStack);

  // Create the Solana layer
  const solanaLayer = new lambda.LayerVersion(stack, "solana-web3-layer", {
    code: lambda.Code.fromAsset("layers/solana/nodejs"),
    description: "Lambda layer for @solana/web3.js",
    compatibleRuntimes: [lambda.Runtime.NODEJS_16_X, lambda.Runtime.NODEJS_18_X],
    compatibleArchitectures: [lambda.Architecture.X86_64, lambda.Architecture.ARM_64],
  });

  // Common function properties
  const commonFunctionProps = {
    enableLiveDev: stack.stage === "dev",
    environment: {
      TRANSACTIONS_TABLE_NAME: transactionsTableName,
      SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "",
      HOUSE_WALLET_ADDRESS: process.env.HOUSE_WALLET_ADDRESS || "",
      HOUSE_SECRET_KEY: process.env.HOUSE_SECRET_KEY || "",
      FEE: process.env.TRANSACTION_FEE || "5000",
      COMMITMENT_LEVEL: process.env.COMMITMENT_LEVEL || "finalized",
    },
    nodejs: {
      esbuild: {
        external: ["@solana/web3.js"],
      },
    },
    layers: [solanaLayer],
    permissions: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [transactionsTableArn],
      }),
    ],
  };

  // Create deposit Lambda function
  const depositFunction = new Function(stack, "DepositFunction", {
    ...commonFunctionProps,
    functionName: `${stack.stackName}-deposit-to-wallet`,
    handler: "src/service/api/handler/deposit-to-wallet.handler",
    timeout: 30,
  });

  // Create withdraw Lambda function
  const withdrawFunction = new Function(stack, "WithdrawFunction", {
    ...commonFunctionProps,
    functionName: `${stack.stackName}-withdraw-from-wallet`,
    handler: "src/service/api/handler/withdraw-from-wallet.handler",
    timeout: 30,
  });

  stack.addOutputs({
    DepositLambdaArn: depositFunction.functionArn,
    WithdrawLambdaArn: withdrawFunction.functionArn,
  });

  return {
    depositLambdaName: depositFunction.functionName,
    withdrawLambdaName: withdrawFunction.functionName,
  };
}
