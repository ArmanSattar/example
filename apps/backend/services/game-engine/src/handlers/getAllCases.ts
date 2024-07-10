import { ApiHandler } from "sst/node/api";
import { listCases } from "../data-access/caseRepository";
import { getLogger } from "@solspin/logger";
import { errorResponse, successResponse } from "@solspin/gateway-responses";

const logger = getLogger("get-all-cases-handler");
export const handler = ApiHandler(async (event) => {
  logger.info(`Get all cases lambda invoked`);
  try {
    const cases = await listCases();
    successResponse(cases);
  } catch (error) {
    logger.error(`Error getting all cases: ${error}`);
    errorResponse(error as Error, 500);
  }
});
