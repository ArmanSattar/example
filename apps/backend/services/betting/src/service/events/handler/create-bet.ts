import { ZodError } from "zod";
import { EventBridgeEvent } from "aws-lambda";
import { Service } from "@solspin/types";
import { Betting, BetTransaction, publishEvent } from "@solspin/events";
import { recordBet } from "../../../data-access/record-bet";
import { updateOrCreateBetStats } from "../../../data-access/update-bet-stats";
import { errorResponse, successResponse } from "@solspin/gateway-responses";
import { getLogger } from "@solspin/logger";
import { EVENT_BUS_ARN } from "../../../foundation/runtime";
import { CreateBetEvent, CreateBetRequestSchema } from "../schemas/schema";

const logger = getLogger("create-bet-handler");

export const handler = async (event: EventBridgeEvent<"CreateBetEvent", CreateBetEvent>) => {
  logger.info("Received create bet request", { event });

  try {
    const eventDetails = CreateBetRequestSchema.parse(event.detail);
    const { userId, gameType, amountBet, outcome, outcomeAmount } = eventDetails.payload;

    // TODO - Accept Idempotency Key and check if bet already exists
    // TODO - Check user exists
    // TODO - Check game exists

    const createdBet = await recordBet(userId, gameType, amountBet, outcome, outcomeAmount);
    await updateOrCreateBetStats(userId, amountBet, outcomeAmount);

    const response = Betting.CreateBetResponseSchema.parse(createdBet);

    logger.info("EventBus ARN", { EVENT_BUS_ARN });

    await publishEvent(
      BetTransaction.event,
      {
        userId,
        amount: outcomeAmount,
      } as BetTransaction.type,
      Service.BETTING
    );

    logger.info("Bet created successfully", { response, createdBet });

    return successResponse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error creating bet", { error: error.errors });
      return errorResponse(error, 400);
    }

    logger.error("Error creating bet", { error });
    return errorResponse(error as Error);
  }
};
