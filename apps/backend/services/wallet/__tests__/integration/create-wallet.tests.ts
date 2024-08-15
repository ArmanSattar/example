import { WalletFactory } from "../wallet-factory";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../src/service/event/handler/create-wallet";

const IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table-arn";
const WALLETS_TABLE_ARN = "mock-wallets-table-arn";

jest.mock("../../src/foundation/runtime", () => ({
  WALLETS_TABLE_ARN: WALLETS_TABLE_ARN,
  IDEMPOTENCY_TABLE_NAME: IDEMPOTENCY_TABLE_NAME,
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("create-bet-handler", () => {
  beforeAll(() => {
    process.env.IDEMPOTENCY_TABLE_NAME = IDEMPOTENCY_TABLE_NAME;
    process.env.WALLETS_TABLE_ARN = WALLETS_TABLE_ARN;
  });

  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should create a wallet successfully", async () => {
    // given
    const mockWallet = WalletFactory.createWallet();
    const event = WalletFactory.createEvent(mockWallet);

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

    // when
    await handler(event);

    // then
    expect(dynamoMock.commandCalls(PutCommand)).toHaveLength(2);
    expect(dynamoMock.commandCalls(PutCommand)[1].args[0].input).toMatchObject({
      TableName: WALLETS_TABLE_ARN,
      Item: expect.objectContaining({
        userId: mockWallet.userId,
        walletAddress: mockWallet.walletAddress,
        balance: 0,
        wagerRequirement: 0,
        createdAt: expect.any(String),
        lockedAt: "0",
      }),
      ConditionExpression: "attribute_not_exists(walletAddress)",
    });
  });
});
