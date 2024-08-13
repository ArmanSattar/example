import { ZodError } from "zod";
import { EventBridgeEvent } from "aws-lambda";
import { CreateWalletRequestSchema, CreateWalletsResponseSchema } from "@solspin/types";
import { createWallet } from "../../../data-access/create-wallet";
import { getLogger } from "@solspin/logger";
import { CreateWalletEvent } from "../schema/schema";

const logger = getLogger("create-wallet-handler");

export const handler = async (event: EventBridgeEvent<"event", CreateWalletEvent>) => {
  logger.info("Received create wallet request", { event });

  try {
    const eventDetails = CreateWalletRequestSchema.parse(event.detail.payload);
    const { userId, walletAddress } = eventDetails;

    const createdWallet = await createWallet(userId, walletAddress);

    const response = CreateWalletsResponseSchema.parse(createdWallet);

    logger.info("Wallet created successfully", { response, createdWallet });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error creating wallet", { error });
      return;
    }

    logger.error("Error creating wallet", { error });
  }
};
