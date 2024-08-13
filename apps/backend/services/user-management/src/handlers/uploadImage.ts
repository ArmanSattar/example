import { ApiHandler } from "sst/node/api";
import { getLogger } from "@solspin/logger";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { updateUser } from "../data-access/userRepository";

const logger = getLogger("upload-image-handler");
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = process.env.PROFILE_BUCKET_NAME;
const TABLE_NAME = process.env.USERS_TABLE_NAME;

const UploadImageRequestSchema = z.object({
  contentType: z.string().nonempty(),
});

if (!TABLE_NAME) {
  throw new Error("TABLE_NAME is not specified");
}

if (!BUCKET_NAME) {
  throw new Error("BUCKET_NAME is not specified");
}
export const handler = ApiHandler(async (event) => {
  try {
    const payload = JSON.parse(event.body || "{}");
    const userId = event.requestContext.authorizer.lambda.userId;

    const parsedPayload = UploadImageRequestSchema.safeParse(payload);
    if (!parsedPayload.success) {
      logger.error("Validation error in request payload", { error: parsedPayload.error.errors });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation Error",
          errors: parsedPayload.error.errors,
        }),
      };
    }

    const { contentType } = parsedPayload.data;
    const id = uuidv4();
    const key = `profile-images/${id}`;

    // Generate a pre-signed URL for S3 upload
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: 60, // URL expires in 60 seconds
    };

    const uploadUrl = s3.getSignedUrl("putObject", params);

    // Save the image link in DynamoDB
    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    logger.info(`Generated upload URL for userId: ${userId}, image URL: ${imageUrl}`);

    await updateUser(userId, {
      profileImageUrl: imageUrl,
    });

    logger.info(`Successfuly saved the s3 url in the database`);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl, imageUrl }),
    };
  } catch (error) {
    logger.error("Error generating upload URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
});
