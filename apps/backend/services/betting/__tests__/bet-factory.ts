import { faker } from "@faker-js/faker";
import { Bet, GameOutcome, GameType } from "@solspin/types";
import { CreateBetEvent } from "../src/service/events/schemas/schema";
import { EventBridgeEvent } from "aws-lambda";
import { BetStats } from "@solspin/events/src/service/betting/schemas";

export class BetFactory {
  static createMockBet(overrides: Partial<Bet> = {}): Bet {
    const defaultBet: Bet = {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      gameType: GameType.CASES,
      amountBet: faker.number.int({ min: 1, max: 100 }),
      outcome: faker.helpers.arrayElement(Object.values(GameOutcome)),
      outcomeAmount: faker.number.int({ min: 1, max: 200 }),
      createdAt: faker.date.recent(),
    };

    return {
      ...defaultBet,
      ...overrides,
    };
  }

  static createMockBetStats(): BetStats {
    return {
      totalProfit: faker.number.int({ min: 1, max: 100 }),
      totalBet: faker.number.int({ min: 1, max: 100 }),
    };
  }

  static createMockEvent(bet: Bet): EventBridgeEvent<"CreateBetEvent", CreateBetEvent> {
    const defaultEvent: EventBridgeEvent<"CreateBetEvent", CreateBetEvent> = {
      detail: {
        publisher: faker.string.uuid(),
        metadata: { requestId: faker.string.uuid() },
        payload: { ...bet, requestId: faker.string.uuid() },
      },
      id: faker.string.uuid(),
      version: "some-version",
      account: "some-account",
      time: faker.date.recent().toISOString(),
      region: "some-region",
      resources: [],
      source: "some-source",
      "detail-type": "CreateBetEvent",
    };

    return {
      ...defaultEvent,
      detail: {
        ...defaultEvent.detail,
      },
    };
  }
}
