import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Betting } from "@solspin/events";
import { queryBetById } from "../../../data-access/query-by-id";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-bet-by-id-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get bet by ID request", { event });

  try {
    const { id } = Betting.GetBetByIdRequestSchema.parse(event.pathParameters);

    const bet = await queryBetById(id);

    if (!bet) {
      logger.info("Bet not found", { id });

      return errorResponse(new Error("Bet not found"), 404);
    }

    const response = Betting.GetBetByIdResponseSchema.parse(bet);

    logger.info("Bet retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving bet", { error });

    return errorResponse(error as Error);
  }
};
