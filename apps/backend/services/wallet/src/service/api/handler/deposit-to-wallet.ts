import { ZodError } from "zod";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  DepositResponse,
  DepositToWalletRequestSchema,
  GatewayResponseSchema,
} from "@solspin/types";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { lockWallet } from "../../../data-access/lockWallet";
import { getCurrentPrice } from "../../../remote/jupiterClient";
import { unlockWallet } from "../../../data-access/unlockWallet";
import { deposit } from "../../../data-access/deposit";
import { Lambda } from "aws-sdk";
import { DEPOSIT_TREASURY_FUNCTION_ARN } from "../../../foundation/runtime";
import { UpdateBalanceResponseSchema } from "../../event/schema/schema";
import { checkIdempotencyAndThrow } from "../../../data-access/check-idempotency";
import { putIdempotencyKey } from "../../../data-access/put-idempotency-key";

const logger = getLogger("deposit-handler");
const lambda = new Lambda();

/**
 * Initiates a deposit to the user's wallet. The amount is reserved first,
 * then the treasury service is called to credit the wallet, and finally the withdrawal is finalized. If any step fails, the reservation is released.
 * @param event The API Gateway event
 * @returns The response object
 **/

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const parsedBody = JSON.parse(event.body || "{}");

    const depositRequest = DepositToWalletRequestSchema.parse(parsedBody);

    const { userId, walletAddress, txnSignature, requestId } = depositRequest;
    logger.info("Received deposit request", { event });

    if (!walletAddress || !txnSignature) {
      return errorResponse(new Error("Invalid request"), 400);
    }

    await checkIdempotencyAndThrow(requestId);
    await putIdempotencyKey(requestId);

    const wallet = await lockWallet(userId);
    try {
      const params = {
        FunctionName: DEPOSIT_TREASURY_FUNCTION_ARN,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
          userId,
          walletAddress,
          base64Transaction: txnSignature,
        }),
      };

      const response = await lambda.invoke(params).promise();
      const responsePayload = GatewayResponseSchema.parse(JSON.parse(response.Payload as string));

      if (response.StatusCode !== 200 || responsePayload.statusCode !== 200) {
        logger.error("Error processing deposit request", { responsePayload, requestId });
        return errorResponse(new Error("Internal server error"), 500);
      }

      const { depositAmount: depositAmountInCrypto, transactionId } =
        UpdateBalanceResponseSchema.parse(JSON.parse(responsePayload.body));

      logger.info("Deposit request processed", { depositAmountInCrypto, transactionId });

      // Dollars are converted into minor amounts to avoid floating point arithmetic issues (i.e x100)
      const currentPriceSolFpn = (await getCurrentPrice()) * 100;
      const depositAmountInUsdFpn = Math.round(depositAmountInCrypto * currentPriceSolFpn);

      await deposit(wallet, depositAmountInUsdFpn, transactionId);

      return successResponse({
        message: "Deposit successful",
        txnId: transactionId,
        depositAmount: depositAmountInUsdFpn / 100,
      } as DepositResponse);
    } catch (error) {
      logger.error("Error processing deposit request", { error, requestId });

      if (error instanceof ZodError) {
        return errorResponse(error, 400);
      }

      return errorResponse(new Error("Internal server error"), 500);
    } finally {
      // Always unlock the wallet
      await unlockWallet(userId);
    }
  } catch (error) {
    logger.error("Error processing deposit request", { error });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }

    return errorResponse(new Error("Internal server error"), 500);
  }
};
