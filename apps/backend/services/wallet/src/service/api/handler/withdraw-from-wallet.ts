import { ZodError } from "zod";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  GatewayResponseSchema,
  WithdrawFromWalletRequestSchema,
  WithdrawResponse,
} from "@solspin/types";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { lockWallet } from "../../../data-access/lockWallet";
import { getCurrentPrice } from "../../../remote/jupiterClient";
import { withdraw } from "../../../data-access/withdraw";
import { unlockWallet } from "../../../data-access/unlockWallet";
import { Lambda } from "aws-sdk";
import { WITHDRAW_TREASURY_FUNCTION_ARN } from "../../../foundation/runtime";
import { checkIdempotencyAndThrow } from "../../../data-access/check-idempotency";
import { putIdempotencyKey } from "../../../data-access/put-idempotency-key";

const logger = getLogger("withdraw-handler");
const lambda = new Lambda();

/**
 * Initiates a withdrawal from the user's wallet. The amount is reserved first,
 * then the treasury service is called to credit the wallet, and finally the withdrawal is finalized. If any step fails, the reservation is released.
 * @param event The API Gateway event
 * @returns The response object
 **/

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const parsedBody = JSON.parse(event.body || "{}");

    const withdrawRequest = WithdrawFromWalletRequestSchema.parse(parsedBody);

    const { userId, amount, walletAddress, requestId } = withdrawRequest;

    logger.info("Received withdraw request", { event, requestId });

    if (amount <= 0) {
      return errorResponse(new Error("Amount must be greater than 0"), 400);
    }

    await checkIdempotencyAndThrow(requestId);
    await putIdempotencyKey(requestId);

    try {
      // Convert amount to FPN ($16.45 -> 1645)
      const fpnAmount = Math.round(amount * 100);

      const wallet = await lockWallet(userId);

      if (!wallet) {
        return errorResponse(new Error("Wallet not found"), 404);
      }
      const currentPriceSolFpn = Math.round((await getCurrentPrice()) * 100);

      if (wallet.balance < fpnAmount) {
        console.log("gsg", wallet.balance, currentPriceSolFpn);
        return errorResponse(new Error("Insufficient balance"), 400);
      }

      if (wallet.wagerRequirement > 0) {
        return errorResponse(new Error("You still have an active wager requirement"), 400);
      }

      const withdrawalAmountInSol = fpnAmount / currentPriceSolFpn;

      const params = {
        FunctionName: WITHDRAW_TREASURY_FUNCTION_ARN,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
          userId: userId,
          walletAddress: walletAddress,
          amount: withdrawalAmountInSol,
        }),
      };

      const response = await lambda.invoke(params).promise();
      const responsePayload = GatewayResponseSchema.parse(JSON.parse(response.Payload as string));

      if (response.StatusCode !== 200 || responsePayload.statusCode !== 200) {
        logger.error("Error processing withdraw request", { responsePayload, requestId });
        return errorResponse(
          new Error(JSON.parse(responsePayload.body).error || "Internal server error"),
          responsePayload.statusCode
        );
      }

      const { txnSignature } = JSON.parse(responsePayload.body);
      console.log(responsePayload);

      logger.info("Withdrawal request processed on the blockchain", { txnSignature });

      await withdraw(wallet, fpnAmount);

      return successResponse({
        message: "Withdrawal successful",
        txnId: txnSignature,
      } as WithdrawResponse);
    } catch (error) {
      logger.error("Error processing withdrawal request", { error, requestId });

      if (error instanceof ZodError) {
        return errorResponse(error, 400);
      }

      return errorResponse(new Error("Internal server error"), 500);
    } finally {
      // Always unlock the wallet
      await unlockWallet(userId);
    }
  } catch (error) {
    logger.error("Error processing withdrawal request", { error });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }

    return errorResponse(new Error("Internal server error"), 500);
  }
};
