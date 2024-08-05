import { WalletsDBObject } from "../foundation/types";
import { getLogger } from "@solspin/logger";
import { InvalidResourceError } from "@solspin/errors";
import { updateUser } from "./updateWallet";

const logger = getLogger("deposit");

export const deposit = async (
  wallet: WalletsDBObject,
  depositAmount: number,
  signature: string | null,
  isDeposit = true
): Promise<void> => {
  // Check if the signature is valid for a deposit
  try {
    if (isDeposit && signature === null) {
      throw new InvalidResourceError("Invalid signature");
    }

    // Update the balance
    console.log("wallet.balance", wallet.balance, "depositAmount", depositAmount);
    wallet.balance += depositAmount;

    await updateUser(wallet);
  } catch (error) {
    logger.error("Error depositing to wallet:", { error, wallet });
    throw error;
  }
};
