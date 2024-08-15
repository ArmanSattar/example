import { ZodError } from "zod";
import { EventBridgeEvent } from "aws-lambda";
import { Service } from "@solspin/types";
import { BetTransaction, publishEvent } from "@solspin/events";
import { recordBet } from "../../../data-access/record-bet";
import { updateOrCreateBetStats } from "../../../data-access/update-bet-stats";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { CreateBetEvent, CreateBetPayloadSchema, CreateBetRequestSchema } from "../schemas/schema";
import { checkIdempotencyAndThrow } from "../../../data-access/check-idempotency";
import { putIdempotencyKey } from "../../../data-access/put-idempotency-key";
import { DuplicateResourceError } from "@solspin/errors";

const logger = getLogger("create-bet-handler");

export const handler = async (event: EventBridgeEvent<"CreateBetEvent", CreateBetEvent>) => {
  logger.info("Received create bet request", { event });

  try {
    const eventDetails = CreateBetRequestSchema.parse(event.detail);
    const { requestId, userId, gameType, amountBet, outcome, outcomeAmount } =
      CreateBetPayloadSchema.parse(eventDetails.payload);

    if (amountBet <= 0) {
      throw new Error("Amount bet must be greater than 0");
    }

    if (outcomeAmount < 0) {
      throw new Error("Outcome amount must not be negative");
    }

    const minorAmountBet = amountBet * 100;
    const minorOutcomeAmount = outcomeAmount * 100;

    await checkIdempotencyAndThrow(requestId);
    await putIdempotencyKey(requestId);
    // TODO - Check user exists

    const createdBet = await recordBet(userId, gameType, minorAmountBet, outcome, outcomeAmount);
    await updateOrCreateBetStats(userId, minorAmountBet, minorOutcomeAmount - minorAmountBet);

    await publishEvent(
      BetTransaction.event,
      {
        requestId: requestId,
        userId,
        amount: outcomeAmount,
      } as BetTransaction.type,
      Service.BETTING
    );

    logger.info("Bet created successfully", { createdBet });

    return successResponse(createdBet);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error creating bet", { error: error.errors });
      return errorResponse(error, 400);
    }

    if (error instanceof DuplicateResourceError) {
      logger.error("Bet has already been processed", { error });
      return errorResponse(error, error.statusCode);
    }

    logger.error("Error creating bet", { error });
    return errorResponse(error as Error);
  }
};
