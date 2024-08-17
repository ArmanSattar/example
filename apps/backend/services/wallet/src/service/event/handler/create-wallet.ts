import { ZodError } from "zod";
import { EventBridgeEvent } from "aws-lambda";
import { CreateWalletRequestSchema, CreateWalletsResponseSchema } from "@solspin/types";
import { createWallet } from "../../../data-access/create-wallet";
import { getLogger } from "@solspin/logger";
import { CreateWalletEvent } from "../schema/schema";
import { checkIdempotencyAndThrow } from "../../../data-access/check-idempotency";
import { putIdempotencyKey } from "../../../data-access/put-idempotency-key";

const logger = getLogger("create-wallet-handler");

export const handler = async (event: EventBridgeEvent<"event", CreateWalletEvent>) => {
  try {
    const eventDetails = CreateWalletRequestSchema.parse(event.detail.payload);
    const { userId, walletAddress } = eventDetails;
    const requestId = event.detail.metadata.requestId;

    logger.info("Received create wallet request", { event, requestId });

    await checkIdempotencyAndThrow(requestId);
    await putIdempotencyKey(requestId);

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
