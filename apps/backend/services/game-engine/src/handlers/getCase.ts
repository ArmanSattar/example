import { ApiHandler } from "sst/node/api";
import { getCase } from "../data-access/caseRepository";
import { GetCaseByIdRequestSchema, GetCaseByIdResponseSchema } from "@solspin/game-engine-types";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-case-handler");
export const handler = ApiHandler(async (event) => {
  try {
    const { id } = GetCaseByIdRequestSchema.parse(event.queryStringParameters);
    logger.info(`Get case lambda invoked with id: ${id}`);
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "caseName is missing" }),
      };
    }

    const caseData = await getCase(id);

    const response = GetCaseByIdResponseSchema.parse(caseData);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error(`Error getting case data: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
});
