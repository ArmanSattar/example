import { ApiHandler } from "sst/node/api";
import { deleteUser } from "../data-access/userRepository";
import { getLogger } from "@solspin/logger";
import { errorResponse, successResponse } from "@solspin/events/utils/gateway-responses";

const logger = getLogger("delete-user-handler");
export const handler = ApiHandler(async (event) => {
  try {
    const userId: string = event.requestContext.authorizer.lambda.userId;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: User ID not found in token" }),
      };
    }

    logger.info(`Deleting user data for userId: ${userId}`);

    await deleteUser(userId);

    successResponse({ message: "User successfuly deleted" });
  } catch (error) {
    logger.error(`Error deleting user data: ${error}`);

    errorResponse(error as Error);
  }
});
