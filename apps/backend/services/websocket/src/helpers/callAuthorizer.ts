import * as AWS from "aws-sdk";

const lambda = new AWS.Lambda();

export const callAuthorizer = async (token: string) => {
  const params = {
    FunctionName: process.env.AUTHORIZER_FUNCTION_NAME,
    Payload: JSON.stringify({
      queryStringParameters: {
        token,
      },
    }),
  };

  const response = await lambda.invoke(params).promise();
  const payload = JSON.parse(response.Payload as string);
  return payload;
};
