import { Wallet } from "@solspin/types";
import { faker } from "@faker-js/faker";
import { EventBridgeEvent } from "aws-lambda";
import { CreateWalletEvent } from "../src/service/event/schema/schema";

export class WalletFactory {
  static createWallet(overrides: Partial<Wallet> = {}): Wallet {
    const mockWallet: Wallet = {
      userId: faker.string.uuid(),
      balance: faker.number.int({ min: 1, max: 100 }),
      wagerRequirement: faker.number.int({ min: 1, max: 100 }),
      walletAddress: faker.string.uuid(),
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
}
