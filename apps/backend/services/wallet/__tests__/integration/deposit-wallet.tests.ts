const IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table-arn";
const WALLETS_TABLE_ARN = "mock-wallets-table-arn";
const DEPOSIT_TREASURY_FUNCTION_ARN = "mock-deposit-treasury-function-arn";

import { WalletFactory } from "../wallet-factory";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../src/service/api/handler/deposit-to-wallet";
import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { getCurrentPrice } from "../../src/remote/jupiterClient";

jest.mock("../../src/foundation/runtime", () => ({
  WALLETS_TABLE_ARN: WALLETS_TABLE_ARN,
  IDEMPOTENCY_TABLE_NAME: IDEMPOTENCY_TABLE_NAME,
  DEPOSIT_TREASURY_FUNCTION_ARN: DEPOSIT_TREASURY_FUNCTION_ARN,
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

describe("deposit-to-wallet-handler", () => {
  let lambda: AWS.Lambda;

  beforeAll(() => {
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.WALLETS_TABLE_ARN = WALLETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
    lambda = new AWS.Lambda();
  });

  it("should deposit to wallet successfully", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        txnSignature: "mock-txn-signature",
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
        depositAmount: 1,
        transactionId: "mock-transaction-id",
      }),
    };

    // Mock the promise method to return our desired payload
    (lambda.invoke().promise as jest.Mock).mockResolvedValue({
      StatusCode: 200,
      Payload: JSON.stringify(mockPayload),
    });

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(2);
    expect(dynamoMock.commandCalls(PutCommand)[1].args[0].input).toEqual({
      TableName: WALLETS_TABLE_ARN,
      Item: expect.objectContaining({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        balance: mockWallet.balance,
        wagerRequirement: mockWallet.wagerRequirement,
        createdAt: expect.any(Date),
        lockedAt: expect.any(String),
      }),
    });
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(3);
  });

  it("should fail when treasury function fails", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        txnSignature: "mock-txn-signature",
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

  it("should fail when wallet is locked", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        txnSignature: "mock-txn-signature",
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

    dynamoMock.on(UpdateCommand).rejects({});

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 500,
      body: expect.any(String),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
  });

  it("should fail when idempotency check fails", async () => {
    // given
    const requestId = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const event: APIGatewayProxyEventV2 = {
      body: JSON.stringify({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        txnSignature: "mock-txn-signature",
        requestId: requestId,
      }),
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).rejects({});

    // when
    const response = (await handler(event, context, callback)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 500,
      body: expect.any(String),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(0);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });
});
