import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler as GetBetStatsHandler } from "../../src/service/api/handler/get-bet-stats";
import { BetFactory } from "../bet-factory";

const BET_STATS_TABLE_NAME = "mock-bet-stats-table-arn";

jest.mock("../../src/foundation/runtime", () => ({
  BET_STATS_TABLE_NAME: BET_STATS_TABLE_NAME,
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("get-bet-stats-handler", () => {
  beforeAll(() => {
    process.env.BET_STATS_TABLE_NAME = BET_STATS_TABLE_NAME;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should return bet stats by id", async () => {
    // given
    const userId = uuidv4();
    const mockBetStats = BetFactory.createMockBetStats();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { userId: userId },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BET_STATS_TABLE_NAME,
        Key: { userId },
      });

      return { Item: mockBetStats };
    });

    // when
    const response = (await GetBetStatsHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        totalBet: mockBetStats.totalBet,
        totalProfit: mockBetStats.totalProfit,
      }),
    });
  });

  it("should return 404 when bet stats not found", async () => {
    // given
    const userId = uuidv4();
    const event: APIGatewayProxyEventV2 = {
      pathParameters: { userId: userId },
    } as unknown as APIGatewayProxyEventV2;

    const context: Context = {} as unknown as Context;
    const callback = jest.fn();

    dynamoMock.on(GetCommand).callsFake((input) => {
      expect(input).toEqual({
        TableName: BET_STATS_TABLE_NAME,
        Key: { userId },
      });

      return { Item: null };
    });

    // when
    const response = (await GetBetStatsHandler(
      event,
      context,
      callback
    )) as APIGatewayProxyResultV2;

    // then
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        totalBet: 0,
        totalProfit: 0,
      }),
    });
  });
});
