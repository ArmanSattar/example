import { StackContext, Table } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export function DatabaseStack({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";

  const betsTable = new Table(stack, "Bets", {
    fields: {
      id: "string",
      userId: "string",
      gameId: "string",
      amountBet: "number",
      outcome: "string",
      outcomeAmount: "number",
      createdAt: "string",
    },
    primaryIndex: { partitionKey: "id" },
    globalIndexes: {
      byUser: { partitionKey: "userId", sortKey: "createdAt" },
      byGame: { partitionKey: "gameId", sortKey: "createdAt" },
      byOutcome: { partitionKey: "outcome", sortKey: "createdAt" },
      byOutcomeAmount: { partitionKey: "outcomeAmount", sortKey: "createdAt" },
      byAmountBet: { partitionKey: "amountBet", sortKey: "createdAt" },
    },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  const betStatsTable = new Table(stack, "BetStats", {
    fields: {
      userId: "string",
      totalBet: "number",
      totalProfit: "string",
    },
    primaryIndex: { partitionKey: "userId" },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  const idempotencyTable = new Table(stack, "Idempotency", {
    fields: {
      id: "string",
      createdAt: "string",
      expiresAt: "number",
    },
    primaryIndex: { partitionKey: "id" },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
    timeToLiveAttribute: "expiresAt",
  });

  return {
    betsTableArn: betsTable.tableArn,
    betsTableName: betsTable.tableName,
    betStatsTableArn: betStatsTable.tableArn,
    betStatsTableName: betStatsTable.tableName,
    idempotencyTableArn: idempotencyTable.tableArn,
    idempotencyTableName: idempotencyTable.tableName,
  };
}
