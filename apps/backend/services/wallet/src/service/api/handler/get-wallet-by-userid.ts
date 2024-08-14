import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetWalletsByIdRequestSchema, GetWalletsByIdResponseSchema } from "@solspin/types";
import { queryWalletById } from "../../../data-access/query-by-id";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-Wallet-by-id-handler");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get wallet by ID request", { event });

  try {
    const { userId } = GetWalletsByIdRequestSchema.parse(event.pathParameters);

    const wallet = await queryWalletById(userId);

    if (!wallet) {
      logger.info("Wallet not found", { userId });

      return errorResponse(new Error("Wallet not found"), 404);
    }

    const response = GetWalletsByIdResponseSchema.parse(wallet);

    logger.info("Wallet retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving Wallet", { error });

    return errorResponse(error as Error);
  }
};
