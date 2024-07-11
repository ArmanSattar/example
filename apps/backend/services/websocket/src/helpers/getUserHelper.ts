import * as AWS from "aws-sdk";
import { GET_USER_FUNCTION_NAME } from "../foundation/runtime";

const lambda = new AWS.Lambda();

export const callGetUser = async (userId: string) => {
  const params = {
    FunctionName: GET_USER_FUNCTION_NAME,
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({
      source: "lambda",
      userId: userId,
    }),
  };
  try {
    const result = await lambda.invoke(params).promise();
    const payload = JSON.parse(result.Payload as string);

    if (payload.statusCode !== 200) {
      throw new Error(`Failed to get user info: ${payload.body}`);
    }

    return JSON.parse(payload.body);
  } catch (error) {
    console.error("Error invoking getUserLambda:", error);
    throw error;
  }
};
