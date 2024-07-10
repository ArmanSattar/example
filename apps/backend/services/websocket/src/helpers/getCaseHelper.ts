import * as AWS from "aws-sdk";
import { GET_CASE_FUNCTION_NAME } from "../foundation/runtime";

const lambda = new AWS.Lambda();

export const callGetCase = async (caseId: string) => {
  console.log(GET_CASE_FUNCTION_NAME);
  const params = {
    FunctionName: GET_CASE_FUNCTION_NAME,
    Payload: JSON.stringify({
      queryStringParameters: {
        id: caseId,
      },
    }),
  };

  const response = await lambda.invoke(params).promise();
  return JSON.parse(response.Payload as string);
};
