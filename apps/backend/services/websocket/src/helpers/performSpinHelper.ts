import { Case } from "@solspin/game-engine-types";
import * as AWS from "aws-sdk";
import { PERFORM_SPIN_FUNCTION_NAME } from "../foundation/runtime";

const lambda = new AWS.Lambda();

export const performSpin = async (
  caseModel: Case,
  clientSeed: string,
  serverSeed: string,
  spins: number
) => {
  const params = {
    FunctionName: PERFORM_SPIN_FUNCTION_NAME,
    Payload: JSON.stringify({
      body: JSON.stringify({
        caseModel,
        clientSeed,
        serverSeed,
        spins,
      }),
    }),
  };

  const response = await lambda.invoke(params).promise();
  const payload = JSON.parse(response.Payload as string);
  return payload;
};
