import * as AWS from "aws-sdk";

const lambda = new AWS.Lambda();

export const callCreateWallet = async (userId: string, walletAddress: string) => {
  console.log(process.env.CREATE_WALLET_FUNCTION_NAME);
  const params = {
    FunctionName: process.env.CREATE_WALLET_FUNCTION_NAME,
    Payload: JSON.stringify({
      body: JSON.stringify({
        userId,
        walletAddress,
      }),
    }),
  };

  const response = await lambda.invoke(params).promise();
  const payload = JSON.parse(response.Payload as string);
  return payload;
};
