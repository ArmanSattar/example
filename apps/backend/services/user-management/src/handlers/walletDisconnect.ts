import { ApiHandler } from "sst/node/api";
import { getLogger } from "@solspin/logger";

const logger = getLogger("wallet-disconnect-handler");

export const handler = ApiHandler(async (event) => {
  try {
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie":
          "token=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
      body: JSON.stringify({ message: "Logout successful" }),
    };
  } catch (error) {
    logger.error("Error processing wallet disconnection:", { error });
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
});
