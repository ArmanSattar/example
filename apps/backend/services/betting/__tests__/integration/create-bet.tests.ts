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

import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../src/service/events/handler/create-bet";
import { BetFactory } from "../bet-factory";

const dynamoMock = mockClient(DynamoDBDocumentClient);
const eventBridgeMock = mockClient(EventBridgeClient);

describe("create-bet-handler", () => {
  beforeAll(() => {
    process.env.BETS_TABLE_ARN = BETS_TABLE_ARN;
    process.env.EVENT_BUS_ARN = EVENT_BUS_ARN;
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.BET_STATS_TABLE_NAME = BET_STATS_TABLE_NAME;
  });

  beforeEach(() => {
    dynamoMock.reset();
    eventBridgeMock.reset();

    dynamoMock.on(PutCommand).resolves({});
    eventBridgeMock.on(PutEventsCommand).resolves({});
    dynamoMock.on(GetCommand).resolves({});
    dynamoMock.on(UpdateCommand).resolves({});
  });

  it("should create a bet successfully", async () => {
    // given
    const mockBet = BetFactory.createMockBet();
    const event = BetFactory.createMockEvent(mockBet);

    // when
    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(String),
    });

    const parsedBody = JSON.parse(response.body || "");
    expect(parsedBody).toEqual({
      id: expect.any(String),
      userId: mockBet.userId,
      gameType: mockBet.gameType,
      amountBet: mockBet.amountBet * 100,
      outcome: mockBet.outcome,
      outcomeAmount: mockBet.outcomeAmount,
      createdAt: expect.any(String),
    });

    expect(dynamoMock.commandCalls(PutCommand).length).toBe(2);
    expect(dynamoMock.commandCalls(GetCommand).length).toBe(1);

    expect(dynamoMock.commandCalls(PutCommand)[0].args[0].input).toMatchObject({
      TableName: IDEMPOTENCY_TABLE_NAME,
      Item: {
        id: expect.any(String),
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
      },
    });

    expect(dynamoMock.commandCalls(PutCommand)[1].args[0].input).toMatchObject({
      TableName: "mock-dynamo-db-arn",
      Item: {
        id: expect.any(String),
        userId: mockBet.userId,
        gameType: mockBet.gameType,
        amountBet: mockBet.amountBet * 100,
        outcome: mockBet.outcome,
        outcomeAmount: mockBet.outcomeAmount,
        createdAt: expect.any(String),
      },
    });

    expect(eventBridgeMock.commandCalls(PutEventsCommand).length).toBe(1);
    expect(eventBridgeMock.commandCalls(PutEventsCommand)[0].args[0].input).toMatchObject({
      Entries: [
        {
          EventBusName: "mock-event-bus-arn",
          Source: "betting_service.BetTransaction",
          DetailType: "event",
          Detail: expect.any(String),
        },
      ],
    });
  });

  it("should return a validation error for missing required fields", async () => {
    const mockBet = BetFactory.createMockBet({
      userId: undefined,
      gameType: undefined,
    });
    const event = BetFactory.createMockEvent(mockBet);

    dynamoMock.on(PutCommand).resolves({});
    eventBridgeMock.on(PutEventsCommand).resolves({});

    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
  });

  it("should return a validation error for invalid data types", async () => {
    const mockBet = BetFactory.createMockBet({
      amountBet: -1,
      outcomeAmount: -1,
    });
    const event = BetFactory.createMockEvent(mockBet);

    dynamoMock.on(PutCommand).resolves({});
    eventBridgeMock.on(PutEventsCommand).resolves({});

    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
    // Add more assertions as needed
  });

  // Add more unhappy path tests...

  // Validation Tests
  it("should create a bet without providing the id field", async () => {
    const mockBet = BetFactory.createMockBet({
      id: undefined,
    });
    const event = BetFactory.createMockEvent(mockBet);

    dynamoMock.on(PutCommand).resolves({});
    eventBridgeMock.on(PutEventsCommand).resolves({});

    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(200);
    // Add more assertions as needed
  });

  it("should return a validation error for an invalid userId format", async () => {
    const mockBet = BetFactory.createMockBet({
      userId: "invalid-user-id",
    });
    const event = BetFactory.createMockEvent(mockBet);

    dynamoMock.on(PutCommand).resolves({});
    eventBridgeMock.on(PutEventsCommand).resolves({});

    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(400);
  });

  it("should fail on idempotency check if the request has already been processed", async () => {
    const mockBet = BetFactory.createMockBet();
    const event = BetFactory.createMockEvent(mockBet);

    dynamoMock.on(GetCommand).resolves({
      Item: {
        id: "some-id",
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000,
      },
    });

    const response = (await handler(event)) as APIGatewayProxyStructuredResultV2;

    expect(response.statusCode).toBe(409);
    expect(dynamoMock.commandCalls(PutCommand).length).toBe(0);
    expect(dynamoMock.commandCalls(UpdateCommand).length).toBe(0);
  });
});
