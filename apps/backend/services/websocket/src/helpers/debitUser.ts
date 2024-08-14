import * as AWS from "aws-sdk";
import { BET_TRANSACTION_FUNCTION_NAME } from "../foundation/runtime";
import { v4 as uuid } from "uuid";

const lambda = new AWS.Lambda();

export const debitUser = async (userId: string, amount: number) => {
  const params = {
    FunctionName: BET_TRANSACTION_FUNCTION_NAME,
    Payload: JSON.stringify({
      body: JSON.stringify({
        requestId: uuid(),
        userId,
        amount,
      }),
    }),
  };
  const response = await lambda.invoke(params).promise();
  return JSON.parse(response.Payload as string);
};
