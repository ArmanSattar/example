import { ApiHandler } from "sst/node/api";
import { getUser } from "../data-access/userRepository";
import { ValidationError } from "@solspin/errors";
import { GetUserByIdRequestSchema } from "@solspin/user-management-types";
import { ZodError } from "zod";
import { getLogger } from "@solspin/logger";
import { errorResponse } from "@solspin/gateway-responses";
import { APIGatewayProxyEventV2, Context } from "aws-lambda";

const logger = getLogger("get-user-handler");

export const handler = ApiHandler(async (event: APIGatewayProxyEventV2, context: Context) => {
  try {
    let userId: string;

    // Determine if this is a direct Lambda invocation or an API Gateway event
    if ("requestContext" in event) {
      // This is an API Gateway event
      userId = event.requestContext.authorizer?.lambda?.userId;
    } else {
      // This is a direct Lambda invocation
      userId = (event as any).userId;
      console.log("direct lambda invocation");
    }

    logger.info(`Get user lambda called for user: ${userId}`);

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: User ID not found" }),
      };
    }

    // Validate the userId
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
    logger.error(`Error fetching user data: ${error as Error}`);
    if (error instanceof ValidationError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          message: "Parameters were not sent correctly",
          error: error.message,
        }),
      };
    }
    return errorResponse(error as Error);
  }
});
