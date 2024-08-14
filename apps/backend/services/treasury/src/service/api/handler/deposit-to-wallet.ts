import { ZodError } from "zod";
import { Context } from "aws-lambda";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { v4 as uuidv4 } from "uuid";
import { DepositRequest, DepositRequestSchema } from "@solspin/types";
import { Commitment, Connection, Transaction } from "@solana/web3.js";
import { COMMITMENT_LEVEL, SOLANA_RPC_URL } from "../../../foundation/runtime";
import { broadcastTransactionAndVerify } from "../../../blockchain/broadcastTransactionAndVerify";
import { recordTransaction } from "../../../data-access/record-transaction";
import { TransactionType } from "../../../foundation/types";
import { InvalidInputError } from "@solspin/errors";
import { getTransactionValueAndVerify } from "../../../blockchain/getTransactionValueAndVerify";

const logger = getLogger("treasury-deposit-handler");
let connection: Connection;

export const handler = async (event: DepositRequest, context: Context) => {
  const depositId = uuidv4();
  logger.info("Received deposit request", { depositId, event });

  let userId = "";
  let walletAddress: string;
  let base64Transaction: string;

  try {
    if (!connection) {
      connection = new Connection(SOLANA_RPC_URL, COMMITMENT_LEVEL as Commitment);
      logger.info("Created new Solana connection", { rpcUrl: SOLANA_RPC_URL });
    }

    const parsedBody = event || "{}";
    const depositRequest = DepositRequestSchema.parse(parsedBody);
    ({ userId, walletAddress, base64Transaction } = depositRequest);

    logger.info("Parsed deposit request", { userId, walletAddress, depositId });

    const transactionSerialized = Buffer.from(base64Transaction, "base64");
    const transaction = Transaction.from(transactionSerialized);

    if (transaction.feePayer?.toBase58() === process.env.HOUSE_WALLET_ADDRESS) {
      logger.warn("Invalid fee payer detected", {
        feePayer: transaction.feePayer?.toBase58(),
        depositId,
      });
      throw new InvalidInputError("Invalid fee payer: Cannot use house wallet as fee payer");
    }

    const transactionSignature = await broadcastTransactionAndVerify(
      transactionSerialized,
      connection,
      COMMITMENT_LEVEL
    );

    logger.info("Transaction broadcasted and verified", { transactionSignature, depositId });

    const depositAmount = await getTransactionValueAndVerify(transactionSignature, connection);
    logger.info("Deposit amount verified", { depositAmount, depositId });

    await recordTransaction(
      depositId,
      userId,
      depositAmount,
      walletAddress,
      transactionSignature,
      TransactionType.DEPOSIT
    );

    return successResponse({
      message: "Deposit successful",
      depositAmount: depositAmount,
      transactionId: transactionSignature,
    });
  } catch (error) {
    logger.error(`Error processing deposit request for ${userId}`, { error, depositId });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }
    if (error instanceof InvalidInputError) {
      return errorResponse(error, 400);
    }
    if (error instanceof Error) {
      return errorResponse(error, 500);
    }

    return errorResponse(new Error("Unknown error occurred"), 500);
  }
};
