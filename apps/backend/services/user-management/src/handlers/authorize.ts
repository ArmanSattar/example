import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";
import { getLogger } from "@solspin/logger";
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";

const logger = getLogger("authenticate-user-handler");

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

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const secret = await getSecret();
  console.log(event);
  if (!event.authorizationToken) {
    logger.error("No authorization token provided");
    return generatePolicy("user", "Deny", event.methodArn);
  }

  const token = event.authorizationToken.split(" ")[1];

  try {
    logger.info(`Authenticate user lambda handler invoked`);

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded || typeof decoded === "string" || !decoded.sub) {
      throw new Error("Unauthorized");
    }

    const userId = decoded.sub;
    logger.info(`User authenticated successfully for userId: ${userId}`);

    return generatePolicy(userId, "Allow", event.methodArn, { userId });
  } catch (error) {
    logger.error(`Error in authenticate user lambda: ${(error as Error).message}`);
    return generatePolicy("user", "Deny", event.methodArn);
  }
};

// Helper function to generate an IAM policy
function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  context?: { [key: string]: any }
): APIGatewayAuthorizerResult {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  return authResponse;
}
