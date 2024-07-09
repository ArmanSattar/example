import { ZodError } from "zod";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DepositToWalletRequestSchema } from "@solspin/types";
import { errorResponse, successResponse } from "@solspin/gateway-responses";
import { getLogger } from "@solspin/logger";
import { v4 as uuidv4 } from "uuid";
import { lockWallet } from "../../../data-access/lockWallet";
import { getCurrentPrice } from "../../../remote/jupiterClient";
import { unlockWallet } from "../../../data-access/unlockWallet";
import { deposit } from "../../../data-access/deposit";
import { Lambda } from "aws-sdk";
import { DEPOSIT_TREASURY_FUNCTION_ARN } from "../../../foundation/runtime";

const logger = getLogger("deposit-handler");
const lambda = new Lambda();

/**
 * Initiates a deposit to the user's wallet. The amount is reserved first,
 * then the treasury service is called to credit the wallet, and finally the withdrawal is finalized. If any step fails, the reservation is released.
 * @param event The API Gateway event
 * @returns The response object
 **/

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const depositId = uuidv4(); // Generate a unique ID for this withdrawal attempt
  logger.info("Received deposit request", { event, depositId });

  try {
    const parsedBody = JSON.parse(event.body || "{}");

    const depositRequest = DepositToWalletRequestSchema.parse(parsedBody);

    const { userId, walletAddress, txnSignature } = depositRequest;

    if (!walletAddress || !txnSignature) {
      return errorResponse(new Error("Invalid request"), 400);
    }

    try {
      const wallet = await lockWallet(userId);
      const params = {
        FunctionName: DEPOSIT_TREASURY_FUNCTION_ARN,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
          userId,
          walletAddress,
          base64Transaction: txnSignature,
        }),
      };

      const responsePayload = await lambda.invoke(params).promise();

      if (responsePayload.StatusCode !== 200) {
        logger.error("Error processing deposit request", { responsePayload, depositId });
        return errorResponse(new Error("Internal server error"), 500);
      }

      // TODO - add schema validation
      const { depositAmount: depositAmountInCrypto, transactionId } = JSON.parse(
        JSON.parse(responsePayload.Payload as string).body
      );

      logger.info("Deposit request processed", { depositAmountInCrypto, transactionId });

      // Dollars are converted into FPN (floating point number) to avoid floating point arithmetic issues (i.e x100)
      const currentPriceSolFpn = (await getCurrentPrice()) * 100;
      const depositAmountInUsdFpn = Math.round(depositAmountInCrypto * currentPriceSolFpn);

      await deposit(wallet, depositAmountInUsdFpn, transactionId);

      return successResponse({
        message: "Deposit successful",
        txnId: txnSignature,
        depositAmount: depositAmountInUsdFpn / 100,
      });
    } catch (error) {
      logger.error("Error processing deposit request", { error, depositId });

      if (error instanceof ZodError) {
        return errorResponse(error, 400);
      }

      return errorResponse(new Error("Internal server error"), 500);
    } finally {
      // Always unlock the wallet
      await unlockWallet(userId);
    }
  } catch (error) {
    logger.error("Error processing deposit request", { error, depositId });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }

    return errorResponse(new Error("Internal server error"), 500);
  }
};
