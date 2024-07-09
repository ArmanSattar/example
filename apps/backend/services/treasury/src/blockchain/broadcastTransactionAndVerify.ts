import { Commitment, Connection, TransactionSignature } from "@solana/web3.js";
import { getLogger } from "@solspin/logger";
import { InsufficientBalanceError } from "@solspin/errors";

const logger = getLogger("broadcast-transaction-and-verify");

/**
 * Broadcast a transaction to the SOL network and verify it
 * @param transaction - The transaction to broadcast (in base64 format)
 * @param connection - The connection to the SOL network
 * @param commitment - The commitment level to use [processed, confirmed, finalized]
 * @param blockhash - The blockhash to use
 * @param lastValidBlockHeight - The last valid block height
 */

export const broadcastTransactionAndVerify = async (
  transaction: Buffer,
  connection: Connection,
  commitment = "finalized",
  blockhash?: string,
  lastValidBlockHeight?: number
): Promise<TransactionSignature> => {
  try {
    console.log(commitment);
    // Get the latest blockhash and block height if not provided (only in deposits is it not provided)
    if (!blockhash || !lastValidBlockHeight) {
      const latestBlock = await connection.getLatestBlockhash();
      blockhash = latestBlock.blockhash;
      lastValidBlockHeight = latestBlock.lastValidBlockHeight;
    }

    const signature = await connection.sendRawTransaction(transaction);
    logger.info("Transaction sent", { signature });

    const result = await connection.confirmTransaction(
      {
        signature: signature,
        lastValidBlockHeight: lastValidBlockHeight,
        blockhash: blockhash,
      },
      commitment as Commitment
    );

    if (result.value.err) {
      logger.error("Transaction failed", { error: result.value.err });
      throw new InsufficientBalanceError(
        "Wallet has insufficient balance to process the transaction"
      );
    }

    logger.info("Transaction confirmed", { signature });
    return signature;
  } catch (error) {
    logger.error("Error in broadcastTransactionAndVerify", { error });
    throw error;
  }
};
