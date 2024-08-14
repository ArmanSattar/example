import { ZodError } from "zod";
import { APIGatewayProxyEvent, EventBridgeEvent } from "aws-lambda";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { updateWalletBalance } from "../../../data-access/updateWalletBalance";
import {
  UpdateBalanceEvent,
  UpdateBalanceEventSchema,
  UpdateBalanceRequestSchema,
} from "../schema/schema";

const logger = getLogger("update-balance");

/**
 * Updates the balance of a user's wallet. This can be invoked in two ways.
 * The first way is through direct invocation, where the userId and amount are passed in the body.
 * This is useful when speed and synchronous transactions are important. The second way
 * is through an EventBridge event, where the userId and amount are passed in the event detail.
 * This is useful when the update balance operation is not time-sensitive.
 * @param event The EventBridge event or API Gateway event
 * @returns The response object
 */

export const handler = async (
  event: EventBridgeEvent<"event", UpdateBalanceEvent> | APIGatewayProxyEvent
) => {
  logger.info("Received update balance request", { event });

  let userId: string | undefined;
  let amount: number | undefined;

  try {
    // Check if the event is from EventBridge or direct invocation
    if ("detail" in event) {
      // EventBridge event
      const eventDetails = UpdateBalanceEventSchema.parse(event.detail);
      ({ userId, amount } = eventDetails.payload);
    } else {
      // Direct invocation (assume APIGatewayProxyEvent)
      const body = JSON.parse(event.body || "{}");
      const directInvokeData = UpdateBalanceRequestSchema.parse(body);
      ({ userId, amount } = directInvokeData);
    }

    if (!userId || !amount) {
      return errorResponse(new Error("Invalid request"), 400);
    }

    const amountFpn = Math.round(amount * 100);
    await updateWalletBalance(userId, amountFpn);
    logger.info("Update balance successful", { userId, amount });

    return successResponse({
      message: "Update balance successful",
      data: {
        userId,
        amount: amount,
      },
    });
  } catch (error) {
    logger.error("Error processing update request", { error, userId });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }

    return errorResponse(new Error("Internal server error"), 500);
  }
};
