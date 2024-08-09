import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  WalletTransactionStatsRequestSchema,
  WalletTransactionStatsResponseSchema,
} from "@solspin/types";
import { errorResponse, successResponse } from "@solspin/gateway-responses";
import { getLogger } from "@solspin/logger";
import { getTransactionStats } from "../../../data-access/getTransactions";

const logger = getLogger("get-wallet-transactions");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  logger.info("Received get wallet transactions by ID request", { event });

  try {
    const { userId } = WalletTransactionStatsRequestSchema.parse(event.pathParameters);

    const transactions = await getTransactionStats(userId);

    if (!transactions) {
      logger.info("Transaction stats not found", { userId });

      return errorResponse(new Error("Transaction stats not found"), 404);
    }

    const response = WalletTransactionStatsResponseSchema.parse(transactions);

    logger.info("Wallet transactions retrieved successfully", { response });

    return successResponse(response);
  } catch (error) {
    logger.error("Error retrieving wallet transactions", { error });

    return errorResponse(error as Error);
  }
};
