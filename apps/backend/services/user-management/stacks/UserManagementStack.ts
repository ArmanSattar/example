import { Api, Config, Function, StackContext, Table, use } from "sst/constructs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib/core";
import { S3Stack } from "./S3Stack";
import * as cdk from "aws-cdk-lib";

export function UserManagementHandlerAPI({ stack }: StackContext) {
  const { profileImagesBucket, profileImagesDistribution } = use(S3Stack);
  const removeOnDelete = true;
  const eventBusArn = cdk.Fn.importValue(`EventBusArn--${stack.stage}`);
  const existingEventBus = cdk.aws_events.EventBus.fromEventBusArn(
    stack,
    "solspin-event-bus",
    eventBusArn
  );

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
  const getUserFunction = new Function(stack, "getUserFunction", {
    functionName: `${stack.stackName}-getUser`,
    handler: "../user-management/src/handlers/getUser.handler",
    environment: { USERS_TABLE_NAME: userTable.tableName },
    permissions: [
      new PolicyStatement({
        actions: ["dynamodb:GetItem"],
        resources: [userTable.tableArn],
      }),
    ],
  });

  getUserFunction.attachPermissions(["lambda:InvokeFunction"]);

  const callAuthorizerFunction = new Function(stack, "authorizerFunction", {
    functionName: `${stack.stackName}-authorizer`,
    handler: "../user-management/src/handlers/authorize.handler",
    bind: [TEST_SECRET],
    environment: { USERS_TABLE_NAME: userTable.tableName },
  });

  callAuthorizerFunction.attachPermissions(["lambda:InvokeFunction"]);

  const createWalletFunction = Function.fromFunctionName(
    stack,
    "CreateWalletFunction",
    `${stack.stage}-wallet-ApiStack-createWallet`
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
      "POST /user/upload-image": {
        function: {
          handler: "../user-management/src/handlers/uploadImage.handler",
          permissions: [
            new PolicyStatement({
              actions: ["dynamodb:PutItem", "s3:PutObject"],
              resources: [userTable.tableArn, profileImagesBucket.bucketArn],
            }),
          ],
          bind: [userTable],
          environment: {
            USERS_TABLE_NAME: userTable.tableName,
            PROFILE_BUCKET_NAME: profileImagesBucket.bucketName,
          },
        },
        authorizer: "CustomAuthorizer",
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
          environment: { USERS_TABLE_NAME: userTable.tableName },
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
          environment: { USERS_TABLE_NAME: userTable.tableName },
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
          environment: { USERS_TABLE_NAME: userTable.tableName },
        },
        authorizer: "CustomAuthorizer",
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
            new PolicyStatement({
              actions: ["events:PutEvents"],
              resources: [eventBusArn],
            }),
          ],
          bind: [userTable, nonceTable, TEST_SECRET],
          environment: {
            USERS_TABLE_NAME: userTable.tableName,
            NONCE_TABLE_NAME: nonceTable.tableName,
            CREATE_WALLET_FUNCTION_NAME: createWalletFunction.functionName,
            EVENT_BUS_ARN: existingEventBus.eventBusArn,
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
          environment: { USERS_TABLE_NAME: userTable.tableName },
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
