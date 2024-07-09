import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { BuildTransactionResponse } from "@solspin/types";
import { FEE, HOUSE_WALLET_ADDRESS, HOUSE_WALLET_PRIVATE_KEY } from "../foundation/runtime";
import { getLogger } from "@solspin/logger";

const logger = getLogger("treasury-build-transaction");
/**
 * Build a transaction to send on the SOL network
 * @param toWalletAddress - The wallet address to send the SOL to
 * @param amount - The amount of SOL to send
 * @param connection - The connection to the SOL network
 */

export const buildTransaction = async (
  toWalletAddress: string,
  amount: number,
  connection: Connection
): Promise<BuildTransactionResponse> => {
  try {
    // Get the latest blockhash and block height from the blockchain
    logger.info("Starting to build transaction", { toWalletAddress, amount });
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Set the sender and receiver public keys
    const fromPubKey = new PublicKey(HOUSE_WALLET_ADDRESS);
    const toPubKey = new PublicKey(toWalletAddress);

    // Calculate LAMPORTS to send. Subtract the fee from the amount (user pays the fee)
    const lamportsAmount = Math.round(amount * LAMPORTS_PER_SOL) - FEE;

    // Create a new transaction object
    const transaction = new Transaction({
      blockhash: blockhash,
      feePayer: fromPubKey,
      lastValidBlockHeight: lastValidBlockHeight,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromPubKey,
        toPubkey: toPubKey,
        lamports: lamportsAmount,
      })
    );

    const privateKeyBytes = bs58.decode(HOUSE_WALLET_PRIVATE_KEY);

    // Create a Keypair from the private key
    const houseWalletKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Sign the transaction
    transaction.sign(houseWalletKeypair);
    logger.info("Transaction signed successfully", { transaction });

    return {
      signedTransaction: transaction,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    };
  } catch (error) {
    logger.error("Error building transaction", { error });
    throw error;
  }
};
