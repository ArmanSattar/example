import { WalletsDBObject } from "../foundation/types";
import { getLogger } from "@solspin/logger";
import { InvalidResourceError } from "@solspin/errors";
import { updateUser } from "./updateWallet";

const logger = getLogger("withdraw");

export const withdraw = async (wallet: WalletsDBObject, amount: number): Promise<void> => {
  try {
    // Check if the user has sufficient balance
    if (wallet.balance < amount) {
      throw new InvalidResourceError("Insufficient balance");
    }

    // Deduct the amount from the wallet
    wallet.balance -= amount;

    // Update the user's wallet
    await updateUser(wallet);

    logger.info("Withdrawal from db successful", { wallet, amount });
  } catch (error) {
    // Log and throw an error
    logger.error("Error withdrawing from wallet:", { error });
    throw error;
  }
};
