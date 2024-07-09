import * as AWS from "aws-sdk";

const lambda = new AWS.Lambda();

export const callGetCase = async (caseId: string) => {
  const params = {
    FunctionName: process.env.GET_CASE_FUNCTION_NAME,
    Payload: JSON.stringify({
      queryStringParameters: {
        caseId,
      },
    }),
  };

  const response = await lambda.invoke(params).promise();
  const payload = JSON.parse(response.Payload as string);
  return payload;
};
