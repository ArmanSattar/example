import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Betting } from "@solspin/events";
import { queryBetsByUserId } from "../../../data-access/query-by-user-id";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-bets-by-user-id-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get bets by user ID request", { event });

  try {
    const { userId } = Betting.GetBetsByUserIdRequestSchema.parse(event.pathParameters);
    const query = Betting.BetQuerySchema.parse(event.queryStringParameters || {});

    const { gameOutcome, outcomeAmount, betAmount } = query;

    const bets = await queryBetsByUserId(userId, gameOutcome, outcomeAmount, betAmount);

    const response = Betting.GetBetsByUserIdResponseSchema.parse(bets);

    logger.info("Bets retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving bets", { error });

    return errorResponse(error as Error);
  }
};
