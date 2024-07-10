import { Api, Config, Function, StackContext, Table } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function UserManagementHandlerAPI({ stack }: StackContext) {
  const removeOnDelete = stack.stage !== "prod";
  const userTable = new Table(stack, "users", {
    fields: {
      userId: "string",
      discord: "string",
      createdAt: "string",
      updatedAt: "string",
      level: "number",
      walletAddress: "string",
      muteAllSounds: "binary",
    },
    primaryIndex: { partitionKey: "userId" },
    globalIndexes: {
      walletAddressIndex: {
        partitionKey: "walletAddress",
      },
    },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  const nonceTable = new Table(stack, "nonces", {
    fields: {
      walletAddress: "string",
      nonce: "string",
      createdAt: "string",
      expiresAt: "string",
    },
    primaryIndex: { partitionKey: "walletAddress" },
    cdk: {
      table: {
        removalPolicy: removeOnDelete ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        timeToLiveAttribute: "expiresAt",
      },
    },
  });

  const TEST_SECRET = new Config.Secret(stack, "TEST_SECRET");
  const callAuthorizerFunction = new Function(stack, "authorizerFunction", {
    functionName: `${stack.stackName}-authorizer`,
    handler: "../user-management/src/handlers/authorize.handler",
    bind: [TEST_SECRET],
    environment: { TABLE_NAME: userTable.tableName },
  });
  callAuthorizerFunction.attachPermissions(["lambda:InvokeFunction"]);

  const createWalletFunction = Function.fromFunctionName(
    stack,
    "CreateWalletFunction",
    "dev-wallet-ApiStack-createWallet"
  );

  const api = new Api(stack, "UserManagementApi", {
    authorizers: {
      CustomAuthorizer: {
        type: "lambda",
        function: callAuthorizerFunction,
      },
    },
    defaults: {
      function: {
        timeout: 20,
      },
    },
    routes: {
      "POST /authorize": {
        function: {
          handler: "src/handlers/authorize.handler",
          bind: [TEST_SECRET],
          environment: { TABLE_NAME: userTable.tableName },
        },
      },
      "POST /user": {
        function: {
          handler: "../user-management/src/handlers/createUser.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:PutItem"],
              resources: [userTable.tableArn],
            }),
          ],
          bind: [userTable, TEST_SECRET],
          environment: { TABLE_NAME: userTable.tableName },
        },
      },
      "GET /user": {
        function: {
          handler: "../user-management/src/handlers/getUser.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:GetItem"],
              resources: [userTable.tableArn],
            }),
          ],
          bind: [userTable],
          environment: { TABLE_NAME: userTable.tableName },
        },
        authorizer: "CustomAuthorizer",
      },
      "PUT /user": {
        function: {
          handler: "../user-management/src/handlers/updateUser.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:UpdateItem"],
              resources: [userTable.tableArn],
            }),
          ],
          bind: [userTable],
          environment: { TABLE_NAME: userTable.tableName },
        },
        authorizer: "CustomAuthorizer",
      },
      "DELETE /user": {
        function: {
          handler: "../user-management/src/handlers/deleteUser.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:DeleteItem"],
              resources: [userTable.tableArn],
            }),
          ],
          bind: [userTable],
          environment: { TABLE_NAME: userTable.tableName },
        },
      },
      "POST /auth/connect": {
        function: {
          handler: "../user-management/src/handlers/walletConnect.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:GetItem", "dyamodb:PutItem", "dynamodb:DeleteItem"],
              resources: [userTable.tableArn, nonceTable.tableArn],
            }),
            new PolicyStatement({
              actions: ["dyamodb:PutItem", "lambda:InvokeFunction"],
              resources: [createWalletFunction.functionArn],
            }),
          ],
          bind: [userTable, nonceTable, TEST_SECRET],
          environment: {
            TABLE_NAME: userTable.tableName,
            NONCE_TABLE_NAME: nonceTable.tableName,
            CREATE_WALLET_FUNCTION_NAME: createWalletFunction.functionName,
          },
        },
      },
      "POST /auth/disconnect": {
        function: {
          handler: "../user-management/src/handlers/walletDisconnect.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:GetItem", "dyamodb:PutItem"],
              resources: [userTable.tableArn],
            }),
          ],
          bind: [userTable, TEST_SECRET],
          environment: { TABLE_NAME: userTable.tableName },
        },
      },
      "POST /auth/nonce": {
        function: {
          handler: "../user-management/src/handlers/nonce.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:GetItem", "dyamodb:PutItem", "dyamodb:DeleteItem"],
              resources: [nonceTable.tableArn],
            }),
          ],
          bind: [nonceTable],
          environment: { NONCE_TABLE_NAME: nonceTable.tableName },
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    authorizerFunctionName: callAuthorizerFunction.functionName,
  });
}
