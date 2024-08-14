import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { getBetStats } from "../../../data-access/get-bet-stats";
import {
  GetBetStatsRequestSchema,
  GetBetStatsResponseSchema,
} from "@solspin/events/src/service/betting/schemas";

const logger = getLogger("get-bet-stats-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get bet stats by ID request", { event });

  try {
    const { userId } = GetBetStatsRequestSchema.parse(event.pathParameters);

    const betStats = await getBetStats(userId);

    if (!betStats) {
      logger.info("Bet stats not found", { userId });

      return successResponse({
        totalBet: 0,
        totalProfit: 0,
      });
    }

    const response = GetBetStatsResponseSchema.parse(betStats);

    logger.info("Bet stats retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving bet stats", { error });

    return errorResponse(error as Error);
  }
};
