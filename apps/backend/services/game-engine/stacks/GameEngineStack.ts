import { Api, Function, StackContext, Table } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function GameEngineHandlerAPI({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";
  const casesTable = new Table(stack, "cases", {
    fields: {
      id: "string",
      type: "string",
      name: "string",
      price: "number",
      imagePath: "string",
      items: "string",
      itemPrefixSums: "string",
      highestPrice: "number",
      lowestPrice: "number",
      rarity: "string",
      tag: "string",
    },
    primaryIndex: { partitionKey: "id" },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });
  const getCaseFunction = new Function(stack, "getCaseFunction", {
    handler: "../game-engine/src/handlers/getCase.handler",
    environment: {
      TABLE_NAME: casesTable.tableName,
    },
  });
  getCaseFunction.attachPermissions("*");

  const performSpinFunction = new Function(stack, "performSpinFunction", {
    handler: "../game-engine/src/handlers/spin.handler",
    environment: {
      TABLE_NAME: casesTable.tableName,
    },
  });
  performSpinFunction.attachPermissions("*");
  const api = new Api(stack, "GameEngineApi", {
    defaults: {
      function: {
        environment: {
          TABLE_NAME: casesTable.tableName,
        },
        bind: [casesTable],
        permissions: [
          new PolicyStatement({
            actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
            resources: [casesTable.tableArn],
          }),
        ],
      },
    },

    routes: {
      "GET /case": "src/handlers/getCase.handler",
      "GET /cases": "../game-engine/src/handlers/getAllCases.handler",
      "GET /initialize": "../game-engine/src/handlers/initializeDatabase.handler",
      "POST /spin": "../game-engine/src/handlers/spin.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    TableName: casesTable.tableName,
    test: getCaseFunction.functionName,
  });
  return {
    getCaseFunction,
    casesTable,
    performSpinFunction,
  };
}
