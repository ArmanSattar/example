import { ApiHandler } from "sst/node/api";
import { getUser } from "../data-access/userRepository";
import { ValidationError } from "@solspin/errors";
import { GetUserByIdRequestSchema } from "@solspin/user-management-types";
import { ZodError } from "zod";
import { getLogger } from "@solspin/logger";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const logger = getLogger("get-user-handler");

export const handler = ApiHandler(async (event) => {
  const userId: string = event.requestContext.authorizer.lambda.userId;
  logger.info(`Get user lambda called for authenticated user: ${userId}`);

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized: User ID not found in token" }),
    };
  }

  try {
    GetUserByIdRequestSchema.parse({ userId });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error in userId", { error });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation Error",
          errors: error.errors,
        }),
      };
    }
    throw error;
  }

  try {
    logger.info(`Fetching user data for userId: ${userId}`);

    const result = await getUser(userId);

    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    logger.error("Error fetching user data:", error as Error);
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
