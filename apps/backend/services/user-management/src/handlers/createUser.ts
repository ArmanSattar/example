import { ApiHandler } from "sst/node/api";
import { CreateUserRequestSchema, User, UserSchema } from "@solspin/user-management-types";
import { createUser } from "../data-access/userRepository";
import { randomUUID } from "crypto";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";
import { getLogger } from "@solspin/logger";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";

const logger = getLogger("create-user-handler");

let cachedSecret: string | undefined;

async function getSecret(): Promise<string> {
  if (cachedSecret) {
    return cachedSecret;
  }

  // Directly use the secret from Config
  const secret = Config.TEST_SECRET;

  if (!secret) {
    logger.error("JWT_SECRET_KEY is not set in the environment variables.");
    throw new Error("JWT_SECRET_KEY is not set.");
  }

  cachedSecret = secret;
  return cachedSecret as string;
}

const validatePayload = (payload: any) => {
  try {
    return CreateUserRequestSchema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error in create user payload", { error: error.errors });
      throw new Error(JSON.stringify({ message: "Validation Error", errors: error.errors }));
    }
    throw error;
  }
};

const validateUser = (user: User) => {
  try {
    UserSchema.parse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error in user object", { error: error.errors });
      throw new Error(JSON.stringify({ message: "Validation Error", errors: error.errors }));
    }
    throw error;
  }
};

export const handler = ApiHandler(async (event) => {
  try {
    const payload = JSON.parse(event.body || "{}");

    const validatedPayload = validatePayload(payload);

    logger.info(`Creating user with wallet address: ${validatedPayload.walletAddress}`);

    const now = new Date().toISOString();
    const user: User = {
      userId: randomUUID(),
      username: validatedPayload.walletAddress,
      walletAddress: validatedPayload.walletAddress,
      createdAt: now,
      updatedAt: now,
      level: 0, // Default level to 0
      discord: "", // Default discord to empty string
      muteAllSounds: false,
      profileImageUrl: "",
    };

    validateUser(user);

    await createUser(user);

    const userId = user.userId;
    const jwtpayload = {
      sub: userId,
    };
    const secret = await getSecret();
    const token = jwt.sign(jwtpayload, secret, { algorithm: "HS256", expiresIn: "24h" });
    successResponse({ user, token }, 201);
  } catch (error) {
    logger.error(`Error creating user:" ${error}`);

    errorResponse(error as Error);
  }
});
