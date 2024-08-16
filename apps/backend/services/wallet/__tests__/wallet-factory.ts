import { Wallet } from "@solspin/types";
import { faker } from "@faker-js/faker";
import { APIGatewayProxyEvent, EventBridgeEvent } from "aws-lambda";
import { CreateWalletEvent } from "../src/service/event/schema/schema";
import { UpdateBalanceEvent } from "../src/service/event/schema/schema";

export class WalletFactory {
  static createWallet(overrides: Partial<Wallet> = {}): Wallet {
    const mockWallet: Wallet = {
      userId: faker.string.uuid(),
      balance: faker.number.int({ min: 1, max: 100 }),
      wagerRequirement: faker.number.int({ min: 1, max: 100 }),
      walletAddress: faker.string.alphanumeric(32),
      lockedAt: Date.now().toString(),
      createdAt: faker.date.recent(),
    };

    return {
      ...mockWallet,
      ...overrides,
    };
  }

  static createEvent(mockWallet: Wallet): EventBridgeEvent<"event", CreateWalletEvent> {
    const defaultEvent: EventBridgeEvent<"event", CreateWalletEvent> = {
      detail: {
        publisher: faker.string.uuid(),
        metadata: { requestId: faker.string.uuid() },
        payload: {
          userId: mockWallet.userId,
          walletAddress: mockWallet.walletAddress,
        },
      },
      id: faker.string.uuid(),
      version: "some-version",
      account: "some-account",
      time: faker.date.recent().toISOString(),
      region: "some-region",
      resources: [],
      source: "some-source",
      "detail-type": "event",
    };

    return {
      ...defaultEvent,
      detail: {
        ...defaultEvent.detail,
      },
    };
  }

  static createUpdateWalletBalanceEvent(
    mockWallet: Wallet,
    amount: number
  ): EventBridgeEvent<"event", UpdateBalanceEvent> {
    const defaultEvent: EventBridgeEvent<"event", UpdateBalanceEvent> = {
      detail: {
        publisher: faker.string.uuid(),
        metadata: { requestId: faker.string.uuid() },
        payload: {
          userId: mockWallet.userId,
          requestId: faker.string.uuid(),
          amount,
        },
      },
      id: faker.string.uuid(),
      version: "some-version",
      account: "some-account",
      time: faker.date.recent().toISOString(),
      region: "some-region",
      resources: [],
      source: "some-source",
      "detail-type": "event",
    };

    return {
      ...defaultEvent,
      detail: {
        ...defaultEvent.detail,
      },
    };
  }

  static createUpdateWalletBalanceDirectInvokeEvent(
    requestId: string,
    mockWallet: Wallet,
    amount: number
  ): APIGatewayProxyEvent {
    const body = JSON.stringify({
      userId: mockWallet.userId,
      amount,
      requestId: requestId,
    });

    const defaultEvent: APIGatewayProxyEvent = {
      body,
      headers: {
        "Content-Type": "application/json",
      },
      httpMethod: "POST",
      isBase64Encoded: false,
      path: "/wallet/balance/update",
      pathParameters: null,
      queryStringParameters: null,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {
        accountId: "test-account",
        apiId: "test-api",
        authorizer: null,
        protocol: "HTTP/1.1",
        httpMethod: "POST",
        identity: {
          accessKey: null,
          accountId: null,
          apiKey: null,
          apiKeyId: null,
          caller: null,
          clientCert: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: "127.0.0.1",
          user: null,
          userAgent: "Custom User Agent String",
          userArn: null,
        },
        path: "/wallet/balance/update",
        stage: "test",
        requestId: requestId,
        requestTimeEpoch: Date.now(),
        resourceId: "test-resource",
        resourcePath: "/wallet/balance/update",
      },
      resource: "/wallet/balance/update",
    };

    return defaultEvent;
  }
}
