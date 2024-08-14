import { ZodError } from "zod";
import { Context } from "aws-lambda";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";
import { getLogger } from "@solspin/logger";
import { v4 as uuidv4 } from "uuid";
import { BuildTransactionResponse, WithdrawRequest } from "@solspin/types";
import { buildTransaction } from "../../../blockchain/buildTransaction";
import { Commitment, Connection } from "@solana/web3.js";
import { COMMITMENT_LEVEL, SOLANA_RPC_URL } from "../../../foundation/runtime";
import { broadcastTransactionAndVerify } from "../../../blockchain/broadcastTransactionAndVerify";
import { recordTransaction } from "../../../data-access/record-transaction";
import { TransactionType } from "../../../foundation/types";
import { InvalidInputError } from "@solspin/errors";

const logger = getLogger("treasury-withdraw-handler");
let connection: Connection;

/**
 * Initiate a withdrawal from the treasury wallet. The user must provide a wallet address to send the funds to.
 * The amount to withdraw must be greater than 0.1 SOL. The transaction is built and broadcasted to the SOL network.
 * @param event The WithdrawRequest object
 * @param context The AWS Lambda context
 * @returns The response object
 **/

export const handler = async (event: WithdrawRequest, context: Context) => {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_URL, COMMITMENT_LEVEL as Commitment);
  }

  const withdrawId = uuidv4(); // Generate a unique ID for this withdrawal attempt
  logger.info("Received withdraw request", { event, withdrawId });

  let userId = "";
  let amount: number;
  let walletAddress: string;

  try {
    const withdrawRequest = event || {};

    logger.info("Parsed withdraw request", { withdrawRequest, withdrawId });

    ({ userId, amount, walletAddress } = withdrawRequest);

    logger.info("Parsed withdraw request", { userId, amount, walletAddress });

    if (amount < 0.1) {
      throw new InvalidInputError("Minimum withdrawal amount is 0.1 SOL");
    }

    const { signedTransaction, blockhash, lastValidBlockHeight }: BuildTransactionResponse =
      await buildTransaction(walletAddress, amount, connection);

    const txnSignature = await broadcastTransactionAndVerify(
      signedTransaction.serialize(),
      connection,
      COMMITMENT_LEVEL,
      blockhash,
      lastValidBlockHeight
    );

    logger.info(
      `User: ${userId}, Withdrawal successful. Amount: ${amount} SOL, Transaction signature: ${txnSignature}`,
      { txnSignature }
    );

    await recordTransaction(
      withdrawId,
      userId,
      amount,
      walletAddress,
      txnSignature,
      TransactionType.WITHDRAW
    );

    return successResponse({
      txnSignature: txnSignature,
    });
  } catch (error) {
    logger.error(`Error processing withdrawal request for ${userId}`, { error, withdrawId });

    if (error instanceof ZodError) {
      return errorResponse(error, 400);
    }

    if (error instanceof InvalidInputError) {
      return errorResponse(error, 400);
    }

    return errorResponse(new Error("Internal server error"), 500);
  }
};
