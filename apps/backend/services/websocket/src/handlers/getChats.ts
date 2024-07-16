import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getLogger } from "@solspin/logger";
import { getMessageHistory } from "../data-access/chatMessageRepository";
import { errorResponse, successResponse } from "@solspin/gateway-responses";
const logger = getLogger("recent-messages-handler");

const MESSAGE_HISTORY_MAX_NUMBER: number = 10;
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    logger.info("Recent messages handler invoked");

    const recentMessages = await getMessageHistory(MESSAGE_HISTORY_MAX_NUMBER);

    return successResponse(recentMessages);
  } catch (error) {
    logger.error(`Error occurred in recent messages handler: ${error}`);

    return errorResponse(error as Error);
  }
};
