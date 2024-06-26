import { ConnectionInfo } from "@solspin/websocket-types";
import { CaseItem, Case } from "@solspin/game-engine-types";
import { getUserFromWebSocket } from "../helpers/getUserFromWebSocket";
import { debitUser } from "../helpers/debitUser";
import { callGetCase } from "../helpers/getCaseHelper";
import { performSpin } from "../helpers/performSpinHelper";
import { WebSocketApiHandler } from "sst/node/websocket-api";
import { sendWebSocketMessage } from "@solspin/web-socket-message";
import { WebSocketOrchestrationPayloadSchema } from "@solspin/websocket-types";
import { ZodError } from "zod";
import { publishEvent, GameResult, EventConfig } from "@solspin/events";
import { Service } from "@solspin/types";
import { GameOutcome } from "@solspin/betting-types";
import { getLogger } from "@solspin/logger";

const logger = getLogger("case-orchestration-handler");

export const handler = WebSocketApiHandler(async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is missing" }),
    };
  }
  logger.info("Orchestration service was initiated with event body: ", event.body);

  const parsedBody = JSON.parse(event.body || "{}");

  let payload;
  try {
    payload = WebSocketOrchestrationPayloadSchema.parse(parsedBody);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error("Validation error in WebSocket orchestration payload", { error });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation Error",
          errors: error.errors,
        }),
      };
    }
    throw error;
  }
  try {
    const { caseId, clientSeed } = payload;
    const connectionId = event.requestContext.connectionId;
    const { stage, domainName } = event.requestContext;
    if (!clientSeed || !connectionId || !caseId) {
      logger.error(`clientSeed or connectionId is missing`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "caseId, clientSeed, or connectionId is missing",
        }),
      };
    }

    logger.info("Invoking getUserFromWebSocket lambda with connectionId: ", connectionId);
    const connectionInfoPayload = await getUserFromWebSocket(connectionId);

    let user: ConnectionInfo;
    try {
      user = JSON.parse(connectionInfoPayload.body).connectionInfo;
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON format" }),
      };
    }
    logger.info(`Received connection info from getUserFromWebSocket lambda.`);

    if (!user || !user.isAuthenticated) {
      logger.error(`User with connectionId: ${connectionId} is unauthenticated`);
      return {
        statusCode: 403,
        body: JSON.stringify({ isAuthorized: false, message: "Unauthenticated" }),
      };
    }

    if (!user.serverSeed) {
      logger.error(`User with connectionId: ${connectionId} has not requested a server seed`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Server seed is missing. Please request a server seed before opening a case.",
        }),
      };
    }

    const serverSeed = user.serverSeed;
    const userId = user.userId as string;
    logger.info("Invoking getCase lambda with caseId: ", caseId);
    const caseData = await callGetCase(caseId);

    if (caseData.statusCode !== 200) {
      throw new Error("Failed to fetch case details");
    }

    const caseModel: Case = JSON.parse(caseData.body);
    const amount = -1 * caseModel.casePrice;
    logger.info(`Case price is :${caseModel.casePrice}`);
    const updateBalance = await debitUser(userId, amount);

    if (updateBalance.statusCode !== 200) {
      throw new Error("Failed to update balance");
    }
    logger.info(
      `Invoking performSpin lambda with clientSeed: ${clientSeed} and serverSeed: ${serverSeed}`
    );
    const caseRollResult = await performSpin(caseModel, clientSeed, serverSeed);

    const caseRolledItem: CaseItem = JSON.parse(caseRollResult.body);

    logger.info(`Case roll result is: ${{ caseRollResult }}`);
    const outcome =
      caseModel.casePrice < caseRolledItem.price
        ? GameOutcome.WIN
        : caseModel.casePrice > caseRolledItem.price
        ? GameOutcome.LOSE
        : GameOutcome.NEUTRAL;

    const outcomeAmount = caseRolledItem.price;

    publishEvent(
      GameResult.gameResultEvent,
      {
        userId,
        gameType: GameResult.GameType.CASES,
        amountBet: caseModel.casePrice,
        outcome,
        outcomeAmount,
        timestamp: new Date().toISOString(),
      } as GameResult.GameResultType,
      Service.ORCHESTRATION as unknown as EventConfig
    );
    logger.info("Event published with data: ", {
      userId,
      gameType: GameResult.GameType.CASES,
      amountBet: caseModel.casePrice,
      outcome,
      outcomeAmount,
      timestamp: new Date().toISOString(),
    });

    const responseMessage = {
      caseRolledItem,
    };

    try {
      const messageEndpoint = `${domainName}/${stage}`;
      await sendWebSocketMessage(messageEndpoint, connectionId, responseMessage);
    } catch (error) {
      logger.error("Error posting to connection:", error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(responseMessage),
    };
  } catch (error) {
    logger.error("Error in orchestration handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
});
