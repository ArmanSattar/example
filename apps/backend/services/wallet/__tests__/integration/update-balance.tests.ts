const IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table-arn";
const WALLETS_TABLE_ARN = "mock-wallets-table-arn";

import { v4 as uuidv4 } from "uuid";
import { WalletFactory } from "../wallet-factory";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../src/service/event/handler/update-balance";

jest.mock("../../src/foundation/runtime", () => ({
  WALLETS_TABLE_ARN: WALLETS_TABLE_ARN,
  IDEMPOTENCY_TABLE_NAME: IDEMPOTENCY_TABLE_NAME,
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("update-balance-handler with EventBridge", () => {
  beforeAll(() => {
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.WALLETS_TABLE_ARN = WALLETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should update wallet balance successfully with positive amount", async () => {
    // given
    const mockWallet = WalletFactory.createWallet();
    const amountToUpdate = 100;
    const event = WalletFactory.createUpdateWalletBalanceEvent(mockWallet, amountToUpdate);

    dynamoMock.on(GetCommand).resolves({});

    dynamoMock.on(PutCommand).callsFakeOnce((input) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: event.detail.metadata.requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });

      return { Item: {} };
    });

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: {
        userId: mockWallet.userId,
        balance: mockWallet.balance + amountToUpdate,
        wagerRequirement: mockWallet.wagerRequirement,
        walletAddress: mockWallet.walletAddress,
        lockedAt: "0",
        createdAt: mockWallet.createdAt,
        updatedAt: expect.any(String),
      },
    });

    // when
    await handler(event);

    // then
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)[0].args[0].input).toMatchObject({
      TableName: WALLETS_TABLE_ARN,
      Key: { userId: mockWallet.userId },
      UpdateExpression: `SET balance = balance + :amount, updatedAt = :now`,
      ConditionExpression: `lockedAt <= :lockExpired AND attribute_exists(userId) AND balance >= :negativeAmount`,
      ExpressionAttributeValues: {
        ":amount": amountToUpdate * 100,
        ":now": expect.any(String),
        ":lockExpired": expect.any(String),
        ":negativeAmount": 0,
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("should update wallet balance successfully with negative amount", async () => {
    // given
    const mockWallet = WalletFactory.createWallet();
    const amountToUpdate = -50;
    const event = WalletFactory.createUpdateWalletBalanceEvent(mockWallet, amountToUpdate);

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: event.detail.metadata.requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });

      return { Item: {} };
    });

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: {
        userId: mockWallet.userId,
        balance: mockWallet.balance + amountToUpdate,
        wagerRequirement: mockWallet.wagerRequirement,
        walletAddress: mockWallet.walletAddress,
        lockedAt: "0",
        createdAt: mockWallet.createdAt,
        updatedAt: expect.any(String),
      },
    });

    // when
    await handler(event);

    // then
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)[0].args[0].input).toMatchObject({
      TableName: WALLETS_TABLE_ARN,
      Key: { userId: mockWallet.userId },
      UpdateExpression: `SET balance = balance + :amount, updatedAt = :now`,
      ConditionExpression: `lockedAt <= :lockExpired AND attribute_exists(userId) AND balance >= :negativeAmount`,
      ExpressionAttributeValues: {
        ":amount": amountToUpdate * 100,
        ":now": expect.any(String),
        ":lockExpired": expect.any(String),
        ":negativeAmount": -amountToUpdate * 100,
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("should return error response when amount is invalid", async () => {
    // given
    const event = WalletFactory.createUpdateWalletBalanceEvent(WalletFactory.createWallet(), 0);

    // when
    const response = await handler(event);

    // then
    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" }),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(0);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });

  it("should return error response when userId is missing", async () => {
    // given
    const event = WalletFactory.createUpdateWalletBalanceEvent(WalletFactory.createWallet(), 100);
    event.detail.payload.userId = "";

    // when
    const response = await handler(event);

    // then
    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" }),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(0);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });

  it("should return error response when UpdateCommand fails", async () => {
    // given
    const event = WalletFactory.createUpdateWalletBalanceEvent(WalletFactory.createWallet(), 100);

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce(async (input) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: event.detail.metadata.requestId,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });

      dynamoMock.on(UpdateCommand).rejects(new Error("ConditionalCheckFailedException"));

      // when
      const response = await handler(event);

      // then
      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" }),
      });
      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(1);
      expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
    });
  });

  it("should return error response when idempotency check fails", async () => {
    // given
    const event = WalletFactory.createUpdateWalletBalanceEvent(WalletFactory.createWallet(), 100);

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).rejects(new Error("ConditionalCheckFailedException"));

    // when
    const response = await handler(event);

    // then
    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
    expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });
});

describe("update-balance-handler with direct invocation", () => {
  beforeAll(() => {
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.WALLETS_TABLE_ARN = WALLETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should update wallet balance successfully with positive amount", async () => {
    // given
    const idempotencyKey = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const amountToUpdate = 100;
    const event = WalletFactory.createUpdateWalletBalanceDirectInvokeEvent(
      idempotencyKey,
      mockWallet,
      amountToUpdate
    );

    dynamoMock.on(GetCommand).resolves({});

    dynamoMock.on(PutCommand).callsFakeOnce((input) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: idempotencyKey,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });

      return { Item: {} };
    });

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: {
        userId: mockWallet.userId,
        balance: mockWallet.balance + amountToUpdate,
        wagerRequirement: mockWallet.wagerRequirement,
        walletAddress: mockWallet.walletAddress,
        lockedAt: "0",
        createdAt: mockWallet.createdAt,
        updatedAt: expect.any(String),
      },
    });

    // when
    await handler(event);

    // then
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)[0].args[0].input).toMatchObject({
      TableName: WALLETS_TABLE_ARN,
      Key: { userId: mockWallet.userId },
      UpdateExpression: `SET balance = balance + :amount, updatedAt = :now`,
      ConditionExpression: `lockedAt <= :lockExpired AND attribute_exists(userId) AND balance >= :negativeAmount`,
      ExpressionAttributeValues: {
        ":amount": amountToUpdate * 100,
        ":now": expect.any(String),
        ":lockExpired": expect.any(String),
        ":negativeAmount": 0,
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("should update wallet balance successfully with negative amount", async () => {
    // given
    const idempotencyKey = uuidv4();
    const mockWallet = WalletFactory.createWallet();
    const amountToUpdate = -50;
    const event = WalletFactory.createUpdateWalletBalanceDirectInvokeEvent(
      idempotencyKey,
      mockWallet,
      amountToUpdate
    );

    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(PutCommand).callsFakeOnce((input) => {
      expect(input).toEqual({
        TableName: IDEMPOTENCY_TABLE_NAME,
        Item: {
          id: idempotencyKey,
          createdAt: expect.any(Number),
          expiresAt: expect.any(Number),
        },
      });

      return { Item: {} };
    });

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: {
        userId: mockWallet.userId,
        balance: mockWallet.balance + amountToUpdate,
        wagerRequirement: mockWallet.wagerRequirement,
        walletAddress: mockWallet.walletAddress,
        lockedAt: "0",
        createdAt: mockWallet.createdAt,
        updatedAt: expect.any(String),
      },
    });

    // when
    await handler(event);

    // then
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    expect(dynamoMock.commandCalls(UpdateCommand)[0].args[0].input).toMatchObject({
      TableName: WALLETS_TABLE_ARN,
      Key: { userId: mockWallet.userId },
      UpdateExpression: `SET balance = balance + :amount, updatedAt = :now`,
      ConditionExpression: `lockedAt <= :lockExpired AND attribute_exists(userId) AND balance >= :negativeAmount`,
      ExpressionAttributeValues: {
        ":amount": amountToUpdate * 100,
        ":now": expect.any(String),
        ":lockExpired": expect.any(String),
        ":negativeAmount": -amountToUpdate * 100,
      },
      ReturnValues: "ALL_NEW",
    });
  });

  it("should return error response when amount is invalid", async () => {
    // given
    const idempotencyKey = uuidv4();
    const event = WalletFactory.createUpdateWalletBalanceDirectInvokeEvent(
      idempotencyKey,
      WalletFactory.createWallet(),
      0
    );

    // when
    const response = await handler(event);

    // then
    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" }),
    });
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(0);
    expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
  });
});
