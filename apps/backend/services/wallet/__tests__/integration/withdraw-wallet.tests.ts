const IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table-arn";
const WALLETS_TABLE_ARN = "mock-wallets-table-arn";
const WITHDRAW_TREASURY_FUNCTION_ARN = "mock-withdraw-treasury-function-arn";

import { WalletFactory } from "../wallet-factory";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../src/service/api/handler/withdraw-from-wallet";
import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { getCurrentPrice } from "../../src/remote/jupiterClient";

jest.mock("../../src/foundation/runtime", () => ({
  WALLETS_TABLE_ARN: WALLETS_TABLE_ARN,
  IDEMPOTENCY_TABLE_NAME: IDEMPOTENCY_TABLE_NAME,
  WITHDRAW_TREASURY_FUNCTION_ARN: WITHDRAW_TREASURY_FUNCTION_ARN,
}));

jest.mock("aws-sdk", () => {
  const mLambda = {
    invoke: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return { Lambda: jest.fn(() => mLambda) };
});

jest.mock("../../src/remote/jupiterClient", () => ({
  getCurrentPrice: jest.fn(),
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("withdraw-from-wallet-handler", () => {
  let lambda: AWS.Lambda;

  beforeAll(() => {
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.WALLETS_TABLE_ARN = WALLETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
    jest.clearAllMocks();
    lambda = new AWS.Lambda();
  });

  it("should withdraw from wallet successfully", async () => {
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet({ wagerRequirement: 0, balance: 10000 });
    const withdrawAmount = 1; // Amount to withdraw
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        amount: withdrawAmount,
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });
      return { Item: {} };
    });

    (getCurrentPrice as jest.Mock).mockResolvedValue(100);

    dynamoMock.on(UpdateCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: mockWallet.userId },
        UpdateExpression: `SET lockedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpiredAt`,
        ExpressionAttributeValues: {
          ":now": expect.any(String),
          ":lockExpiredAt": expect.any(String),
        },
        ReturnValues: "ALL_NEW",
      });
      return { Attributes: mockWallet };
    });

    const mockPayload = {
      statusCode: 200,
      body: JSON.stringify({
        txnSignature: "mock-txn-signature",
      }),
    };

    (lambda.invoke().promise as jest.Mock).mockResolvedValue({
      StatusCode: 200,
      Payload: JSON.stringify(mockPayload),
    });

    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(2);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(2);
  });

  it("should return error when wallet not found", async () => {
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet({ wagerRequirement: 0, balance: 10000 });
    const withdrawAmount = 1; // Amount to withdraw
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        amount: withdrawAmount,
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    expect(response).toEqual({
      statusCode: 500,
      body: '{"error":"Internal server error"}',
    });

    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(0);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
  });

  it("should return error when wallet balance is insufficient", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet({ wagerRequirement: 0, balance: 100 });
    const withdrawAmount = 1000; // Amount to withdraw
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        amount: withdrawAmount,
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });
      return { Item: {} };
    });

    (getCurrentPrice as jest.Mock).mockResolvedValue(100);

    dynamoMock.on(UpdateCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: mockWallet.userId },
        UpdateExpression: `SET lockedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpiredAt`,
        ExpressionAttributeValues: {
          ":now": expect.any(String),
          ":lockExpiredAt": expect.any(String),
        },
        ReturnValues: "ALL_NEW",
      });
      return { Attributes: mockWallet };
    });

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 400,
      body: '{"error":"Insufficient balance"}',
    });

    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(2);
  });

  it("should return error when wallet has active wager requirement", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet({ wagerRequirement: 100, balance: 10000 });
    const withdrawAmount = 1; // Amount to withdraw
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        amount: withdrawAmount,
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });
      return { Item: {} };
    });

    dynamoMock.on(UpdateCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: mockWallet.userId },
        UpdateExpression: `SET lockedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpiredAt`,
        ExpressionAttributeValues: {
          ":now": expect.any(String),
          ":lockExpiredAt": expect.any(String),
        },
        ReturnValues: "ALL_NEW",
      });
      return { Attributes: mockWallet };
    });

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 400,
      body: '{"error":"You still have an active wager requirement"}',
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(2);
    expect(lambda.invoke).not.toHaveBeenCalled();
  });

  it("should return error when treasury function returns error", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet({ wagerRequirement: 0, balance: 10000 });
    const withdrawAmount = 1; // Amount to withdraw
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        amount: withdrawAmount,
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });
      return { Item: {} };
    });

    (getCurrentPrice as jest.Mock).mockResolvedValue(100);

    dynamoMock.on(UpdateCommand).callsFakeOnce((input: any) => {
      expect(input).toEqual({
        TableName: WALLETS_TABLE_ARN,
        Key: { userId: mockWallet.userId },
        UpdateExpression: `SET lockedAt = :now`,
        ConditionExpression: `lockedAt <= :lockExpiredAt`,
        ExpressionAttributeValues: {
          ":now": expect.any(String),
          ":lockExpiredAt": expect.any(String),
        },
        ReturnValues: "ALL_NEW",
      });
      return { Attributes: mockWallet };
    });

    const mockPayload = {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };

    (lambda.invoke().promise as jest.Mock).mockResolvedValue({ mockPayload });

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 500,
      body: expect.any(String),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(2);
  });
});
