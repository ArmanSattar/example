import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler as GetBetHandler } from "../../src/service/api/handler/get-bet-by-id";
import { handler as GetBetByGameIdHandler } from "../../src/service/api/handler/list-bets-by-game-id";
import { handler as GetBetsByUserId } from "../../src/service/api/handler/list-bets-by-user-id";
import { BetFactory } from "../bet-factory";

const EVENT_BUS_ARN = "mock-event-bus-arn";
const BETS_TABLE_ARN = "mock-dynamo-db-arn";
const BET_STATS_TABLE_NAME = "mock-bet-stats-table-arn";
const IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table-arn";

jest.mock("../../src/foundation/runtime", () => ({
  EVENT_BUS_ARN: EVENT_BUS_ARN,
  BETS_TABLE_ARN: BETS_TABLE_ARN,
  IDEMPOTENCY_TABLE_NAME: IDEMPOTENCY_TABLE_NAME,
  BET_STATS_TABLE_NAME: BET_STATS_TABLE_NAME,
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("get-bet-handler", () => {
  beforeAll(() => {
    process.env.BETS_TABLE_ARN = BETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should return bet by id", async () => {
    // given
    const mockBet = BetFactory.createMockBet();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { id: mockBet.id },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BETS_TABLE_ARN,
        Key: { id: mockBet.id },
      });

      return { Item: mockBet };
    });

    // when
    const response = (await GetBetHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(GetCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual({ ...mockBet, createdAt: mockBet.createdAt.toISOString() });
  });

  it("should fail when bet is not found", async () => {
    // given
    const mockBet = BetFactory.createMockBet();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { id: mockBet.id },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).rejects({});

    // when
    const response = (await GetBetHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 500,
      body: expect.any(String),
    });
  });
});

describe("list-bets-by-game-type-handler", () => {
  beforeAll(() => {
    process.env.BETS_TABLE_ARN = BETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should return bet by game type", async () => {
    // given
    const mockBet = BetFactory.createMockBet();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { gameType: mockBet.gameType },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(QueryCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BETS_TABLE_ARN,
        IndexName: "byGame",
        KeyConditionExpression: "gameId = :gameId",
        ExpressionAttributeValues: { ":gameId": mockBet.gameType },
      });

      return { Items: [mockBet] };
    });

    // when
    const response = (await GetBetByGameIdHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(QueryCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual([{ ...mockBet, createdAt: mockBet.createdAt.toISOString() }]);
  });

  it("should fail when bet is not found", async () => {
    // given
    const mockBet = BetFactory.createMockBet();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { gameType: mockBet.gameType },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(QueryCommand).resolves({ Items: [] });

    // when
    const response = (await GetBetByGameIdHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(QueryCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual([]);
  });
});

describe("list-bets-by-user-id-handler", () => {
  beforeAll(() => {
    process.env.BETS_TABLE_ARN = BETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should return bet by user id", async () => {
    // given
    const userId = uuidv4();
    const mockUserBet = BetFactory.createMockBet({ userId: userId });
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { userId },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(QueryCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BETS_TABLE_ARN,
        IndexName: "byUser",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      });

      return { Items: [mockUserBet] };
    });

    // when
    const response = (await GetBetsByUserId(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(QueryCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual([
      { ...mockUserBet, createdAt: mockUserBet.createdAt.toISOString() },
    ]);
  });

  it("should return bet by user id with query params", async () => {
    // given
    const userId = uuidv4();
    const mockUserBet = BetFactory.createMockBet({ userId: userId });
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { userId },
      queryStringParameters: {
        gameOutcome: mockUserBet.outcome,
        outcomeAmount: mockUserBet.outcomeAmount,
        betAmount: mockUserBet.amountBet,
      },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(QueryCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BETS_TABLE_ARN,
        IndexName: "byUser",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":outcome": mockUserBet.outcome,
          ":outcomeAmount": mockUserBet.outcomeAmount,
          ":betAmount": mockUserBet.amountBet,
        },
        FilterExpression:
          "outcome = :outcome AND outcomeAmount = :outcomeAmount AND amountBet = :betAmount",
      });

      return { Items: [mockUserBet] };
    });

    // when
    const response = (await GetBetsByUserId(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(QueryCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual([
      { ...mockUserBet, createdAt: mockUserBet.createdAt.toISOString() },
    ]);
  });

  it("should return empty array when bet with user id not found", async () => {
    // given
    const userId = uuidv4();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { userId },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(QueryCommand).resolves({ Items: [] });

    // when
    const response = (await GetBetsByUserId(
      event,
      context,
      callback
    )) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    expect(dynamoMock.commandCalls(QueryCommand).length).toBe(1);
    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual([]);
  });
});
