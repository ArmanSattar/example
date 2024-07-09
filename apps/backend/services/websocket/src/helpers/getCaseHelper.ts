import * as AWS from "aws-sdk";

const lambda = new AWS.Lambda();

export const callGetCase = async (caseId: string) => {
  const params = {
    FunctionName: process.env.GET_CASE_FUNCTION_NAME,
    Payload: JSON.stringify({
      queryStringParameters: {
        id: caseId,
      },
    }),
  };

  const response = await lambda.invoke(params).promise();
  return JSON.parse(response.Payload as string);
};
