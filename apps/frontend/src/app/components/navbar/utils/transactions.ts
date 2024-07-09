import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export const createAndSignTransaction = async (
  connection: Connection,
  wallet: WalletContextState,
  toAddress: string,
  amount: number
): Promise<string> => {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  if (!wallet.signTransaction) {
    throw new Error("Wallet does not support signing transactions");
  }

  const signedTransaction = await wallet.signTransaction(transaction);

  // Serialize the signed transaction
  const serializedTransaction = signedTransaction.serialize({ requireAllSignatures: false });
  return serializedTransaction.toString("base64");
};
