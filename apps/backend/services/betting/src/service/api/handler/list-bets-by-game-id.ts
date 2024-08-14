import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Betting } from "@solspin/events";
import { queryBetsByGameId } from "../../../data-access/query-by-game-id";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-bets-by-game-id-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get bets by game ID request", { event });

  try {
    const { gameType } = Betting.GetBetsByGameIdRequestSchema.parse(event.pathParameters);

    const query = Betting.BetQuerySchema.parse(event.queryStringParameters || {});

    const { gameOutcome, outcomeAmount, betAmount } = query;

    const bets = await queryBetsByGameId(gameType, gameOutcome, outcomeAmount, betAmount);

    const response = Betting.GetBetsByGameIdResponseSchema.parse(bets);

    logger.info("Bets retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving bets", { error });

    return errorResponse(error as Error);
  }
};
