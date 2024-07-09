import { ApiHandler } from "sst/node/api";
import { createNonce, nonceExists } from "../data-access/nonceRepository";
import { ValidationError } from "@solspin/errors";

import { ZodError } from "zod";
import { getLogger } from "@solspin/logger";
import { v4 as uuidv4 } from "uuid";

const logger = getLogger("nonce-handler");

export const handler = ApiHandler(async (event) => {
  const walletAddress = JSON.parse(event.body || "{}").walletAddress;
  logger.info(`Nonce request for wallet address: ${walletAddress}`);

  if (!walletAddress) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "walletAddress is required" }),
    };
  }

  //   try {
  //     NonceRequestSchema.parse({ walletAddress });
  //   } catch (error) {
  //     if (error instanceof ZodError) {
  //       logger.error("Validation error in walletAddress", { error });
  //       return {
  //         statusCode: 400,
  //         body: JSON.stringify({
  //           message: "Validation Error",
  //           errors: error.errors,
  //         }),
  //       };
  //     }
  //     throw error;
  //   }

  try {
    logger.info(`Generating nonce for wallet address: ${walletAddress}`);

    // Check if a nonce already exists for this wallet
    const exists = await nonceExists(walletAddress);
    if (exists) {
      // If a nonce exists, we could either return an error or delete the old one and create a new one
      // For this example, we'll create a new one
      logger.info(`Nonce already exists for ${walletAddress}. Creating a new one.`);
    }

    // Generate a new nonce
    const nonce = uuidv4();
    const createdAt = new Date().toISOString();
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const fiveMinutesInSeconds = 5 * 60;
    let expiresAtNumber: number = now + fiveMinutesInSeconds;
    let expiresAt: string = expiresAtNumber.toString();
    // Save the nonce
    await createNonce({
      walletAddress,
      nonce,
      createdAt,
      expiresAt,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ nonce }),
    };
  } catch (error) {
    logger.error("Error generating nonce:", error);
    if (error instanceof ValidationError) {
      return {
        statusCode: (error as ValidationError).statusCode,
        body: JSON.stringify({
          message: "Parameters were not sent correctly ",
          error: (error as ValidationError).message,
        }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: (error as Error).message }),
    };
  }
});
