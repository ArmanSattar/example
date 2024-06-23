import { ZodError } from "zod";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Service } from "@solspin/types";
import { Betting, BetTransaction, publishEvent } from "@solspin/events";
import { recordBet } from "../../../data-access/record-bet";
import { errorResponse, successResponse } from "@solspin/gateway-responses";
import { getLogger } from "@solspin/logger";
import { EVENT_BUS_ARN } from "../../../foundation/runtime";

const logger = getLogger("create-bet-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received create bet request", { event });

  try {
    const parsedBody = JSON.parse(event.body || "{}");

    let createBetRequest;
    try {
      createBetRequest = Betting.CreateBetRequestSchema.parse(parsedBody);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error("Validation error creating bet", { error });
        return errorResponse(error as Error, 400);
      }
      throw error;
    }

    // TODO - Check user exists

    // TODO - Check game exists

    const { userId, gameId, amountBet, outcome, outcomeAmount } = createBetRequest;

    const createdBet = await recordBet(userId, gameId, amountBet, outcome, outcomeAmount);

    const response = Betting.CreateBetResponseSchema.parse(createdBet);

    console.log("eventbusname", EVENT_BUS_ARN);

    publishEvent(
      BetTransaction.event,
      {
        userId,
        betId: response.id,
        amount: outcomeAmount - amountBet,
      } as BetTransaction.type,
      Service.BETTING
    );

    logger.info("Bet created successfully", { response, createdBet });

    return successResponse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error creating bet", { error });
      return errorResponse(error as Error, 400);
    }

    logger.error("Error creating bet", { error });

    return errorResponse(error as Error);
  }
};
