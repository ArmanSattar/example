import { ApiHandler } from "sst/node/api";
import { createUser, getUserByWalletAddress } from "../data-access/userRepository";
import { nonceExists, deleteNonce } from "../data-access/nonceRepository"; // Import necessary functions
import { UserSchema } from "@solspin/user-management-types";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";
import { randomUUID } from "crypto";
import { getLogger } from "@solspin/logger";
import { ZodError } from "zod";
import bs58 from "bs58";

const logger = getLogger("wallet-auth-handler");

let cachedSecret: string | undefined;

async function getSecret(): Promise<string> {
  if (cachedSecret) {
    return cachedSecret;
  }

  const secret = Config.TEST_SECRET;

  if (!secret) {
    logger.error("JWT_SECRET_KEY is not set in the environment variables.");
    throw new Error("JWT_SECRET_KEY is not set.");
  }

  cachedSecret = secret;
  return cachedSecret as string;
}

const validateUser = (user: any) => {
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
    const { walletAddress, signature, nonce } = payload;

    if (!walletAddress || !signature || !nonce) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "walletAddress, signedMessage, and nonce are required" }),
      };
    }

    const nonceRecord = await nonceExists(walletAddress);
    if (!nonceRecord) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid nonce" }),
      };
    }
    await deleteNonce(walletAddress);
    const message = new TextEncoder().encode(
      `Sign this message to log in to Solspin:\nNonce: ${nonce}`
    );
    const publicKey = new PublicKey(walletAddress);
    const signatureUint8 = bs58.decode(signature);

    if (!nacl.sign.detached.verify(message, signatureUint8, publicKey.toBytes())) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Invalid signature" }),
      };
    }

    let user = await getUserByWalletAddress(walletAddress);

    if (user) {
      logger.info(`User already exists with wallet address: ${walletAddress}...`);
    } else {
      logger.info(`Creating new user with wallet address: ${walletAddress}`);
      const now = new Date().toISOString();
      user = {
        userId: randomUUID(),
        username: walletAddress,
        walletAddress: walletAddress,
        createdAt: now,
        updatedAt: now,
        level: 0,
        discord: "",
        muteAllSounds: false,
        profileImageUrl: "",
      };

      validateUser(user);
      await createUser(user);
    }

    const jwtPayload = {
      sub: user.userId,
    };
    const secret = await getSecret();
    const token = jwt.sign(jwtPayload, secret, { algorithm: "HS256", expiresIn: "24h" });

    // Set the expiration date for the cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1); // 24 hours from now

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`,
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
      body: JSON.stringify({ message: "Authentication successful", data: { user, token } }),
    };
  } catch (error) {
    logger.error("Error processing wallet authentication:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
});
