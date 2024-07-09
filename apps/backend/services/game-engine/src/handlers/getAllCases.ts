import { ApiHandler } from "sst/node/api";
import { listCases } from "../data-access/caseRepository";
import { getLogger } from "@solspin/logger";

const logger = getLogger("get-all-cases-handler");
export const handler = ApiHandler(async (event) => {
  logger.info(`Get all cases lambda invoked`);
  try {
    const cases = await listCases();
    return {
      statusCode: 200,
      body: JSON.stringify(cases),
    };
  } catch (error) {
    logger.error(`Error getting all cases: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
});
