import { ConnectionInfo, WebSocketOrchestrationPayloadSchema } from "@solspin/websocket-types";
import { getConnectionInfo } from "../helpers/handleConnections";
import { debitUser } from "../helpers/debitUser";
import { callGetCase } from "../helpers/getCaseHelper";
import { performSpin } from "../helpers/performSpinHelper";
import { WebSocketApiHandler } from "sst/node/websocket-api";
import { sendWebSocketMessage } from "@solspin/web-socket-message";
import { ZodError } from "zod";
import { GameResult, publishEvent } from "@solspin/events";
import { BaseCaseItem, Service } from "@solspin/types";
import { GameOutcome } from "@solspin/betting-types";
import { getLogger } from "@solspin/logger";
import { BaseCase, BaseCaseItemSchema, BaseCaseSchema } from "@solspin/game-engine-types";

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
    const connectionInfo: ConnectionInfo | null = await getConnectionInfo(connectionId);

    if (!connectionInfo) {
      throw new Error("ConnectionId not found");
    }
    const user = connectionInfo;
    // let user: ConnectionInfo;
    // try {
    //   user = JSON.parse(connectionInfoPayload.body).connectionInfo;
    // } catch (error) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ message: "Invalid JSON format" }),
    //   };
    // }
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

    const caseModel: BaseCase = BaseCaseSchema.parse(JSON.parse(caseData.body));
    const amount = -1 * caseModel.price;
    logger.info(`Case price is :${caseModel.price}`);
    const updateBalance = await debitUser(userId, amount);

    if (updateBalance.statusCode !== 200) {
      throw new Error("Failed to update balance");
    }
    logger.info(
      `Invoking performSpin lambda with clientSeed: ${clientSeed} and serverSeed: ${serverSeed}`
    );
    const caseRollResult = await performSpin(caseModel, clientSeed, serverSeed);

    const caseRolledItem: BaseCaseItem = BaseCaseItemSchema.parse(JSON.parse(caseRollResult.body));

    logger.info(`Case roll result is: ${{ caseRollResult }}`);
    const responseMessage = {
      caseRolledItem,
    };

    try {
      const messageEndpoint = `${domainName}/${stage}`;
      await sendWebSocketMessage(messageEndpoint, connectionId, responseMessage);
    } catch (error) {
      logger.error("Error posting to connection:", error);
    }

    const outcome =
      caseModel.price < caseRolledItem.price
        ? GameOutcome.WIN
        : caseModel.price > caseRolledItem.price
        ? GameOutcome.LOSE
        : GameOutcome.NEUTRAL;

    const outcomeAmount = caseRolledItem.price;

    publishEvent(
      GameResult.gameResultEvent,
      {
        userId,
        gameType: GameResult.GameType.CASES,
        amountBet: caseModel.price,
        outcome,
        outcomeAmount,
        timestamp: new Date().toISOString(),
      } as GameResult.GameResultType,
      Service.ORCHESTRATION as unknown as EventConfig
    );
    logger.info("Event published with data: ", {
      userId,
      gameType: GameResult.GameType.CASES,
      amountBet: caseModel.price,
      outcome,
      outcomeAmount,
      timestamp: new Date().toISOString(),
    });

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
