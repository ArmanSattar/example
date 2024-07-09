import {
  Connection,
  Finality,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionSignature,
} from "@solana/web3.js";
import { BlockchainTransactionError, InvalidInputError } from "@solspin/errors";
import { COMMITMENT_LEVEL, HOUSE_WALLET_ADDRESS } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const logger = getLogger("treasury-value-verify");
let housePubKey: PublicKey;

export const getTransactionValueAndVerify = async (
  transaction: TransactionSignature,
  connection: Connection
): Promise<number> => {
  logger.info("Verifying transaction value", { transaction });

  try {
    if (!housePubKey) {
      housePubKey = new PublicKey(HOUSE_WALLET_ADDRESS);
    }

    console.log("House Pub Key", { housePubKey });

    // Get the transaction details
    const txDetail = await connection.getParsedTransaction(transaction, {
      commitment: COMMITMENT_LEVEL as Finality,
    });

    // Check if the transaction details are valid
    if (txDetail === null || txDetail.meta === null) {
      logger.error("Transaction meta data not found", { transaction });
      throw new BlockchainTransactionError("Transaction meta data not found");
    }

    const accountKeys = txDetail.transaction.message.accountKeys;
    let depositAmount = 0;

    // Iterate through the account keys to find the deposit amount
    accountKeys.forEach((account, index) => {
      console.log("Account", { account, index });
      if (txDetail.meta && account.pubkey.equals(housePubKey)) {
        depositAmount = txDetail.meta.postBalances[index] - txDetail.meta.preBalances[index];
      }
    });

    // Check if the deposit amount is valid
    if (depositAmount <= 0) {
      console.log("Invalid deposit amount", { depositAmount, transaction });
      throw new InvalidInputError("Invalid deposit amount");
    }

    const depositAmountInSol = depositAmount / LAMPORTS_PER_SOL;

    logger.info("Transaction value verified", { depositAmountInSol, transaction });
    return depositAmountInSol;
  } catch (error) {
    logger.error("Error in getTransactionValueAndVerify", { error });
    throw error;
  }
};
