import { StackContext, Api, Table, Function } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib/core";
export function GameEngineHandlerAPI({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";
  const casesTable = new Table(stack, "cases", {
    fields: {
      caseId: "string",
      caseType: "string",
      caseName: "string",
      casePrice: "number",
      image_url: "string",
      caseHash: "string",
      items: "string",
      item_prefix_sums: "string",
    },
    primaryIndex: { partitionKey: "caseId" },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });
  const getCaseFunction = new Function(stack, "getCaseFunction", {
    functionName: `${stack.stackName}-getCase`,
    handler: "../game-engine/src/handlers/getCase.handler",
    environment: {
      TABLE_NAME: casesTable.tableName,
    },
  });
  getCaseFunction.attachPermissions("*");

  const performSpinFunction = new Function(stack, "performSpinFunction", {
    functionName: `${stack.stackName}-performSpin`,
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
      "GET /case": "../game-engine/src/handlers/getCase.handler",
      "GET /cases": "../game-engine/src/handlers/getAllCases.handler",
      "GET /initialize": "../game-engine/src/handlers/initializeDatabase.handler",
      "POST /spin": "../game-engine/src/handlers/spin.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    TableName: casesTable.tableName,
    getCaseFunctionName: getCaseFunction.functionName,
    performSpinFunctionName: performSpinFunction.functionName,
  });
}
