import { ConnectionInfo, WebSocketOrchestrationPayloadSchema } from "@solspin/websocket-types";
import {
  generateServerSeed,
  getConnectionInfo,
  removeServerSeed,
} from "../helpers/handleConnections";
import { debitUser } from "../helpers/debitUser";
import { callGetCase } from "../helpers/getCaseHelper";
import { performSpin } from "../helpers/performSpinHelper";
import { WebSocketApiHandler } from "sst/node/websocket-api";
import { sendWebSocketMessage } from "@solspin/web-socket-message";
import { GameResult, publishEvent } from "@solspin/events";
import { BaseCaseItem, Service } from "@solspin/types";
import { GameOutcome } from "@solspin/betting-types";
import { getLogger } from "@solspin/logger";
import {
  BaseCase,
  BaseCaseItemSchema,
  BaseCaseSchema,
  SpinResult,
} from "@solspin/game-engine-types";
import { hashString } from "@solspin/hash";

const logger = getLogger("case-orchestration-handler");

export const handler = WebSocketApiHandler(async (event) => {
  const { stage, domainName } = event.requestContext;
  const messageEndpoint = `${domainName}/${stage}`;
  const connectionId = event.requestContext.connectionId;
  try {
    const TYPE = "case";
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is missing" }),
      };
    }
    logger.info(`Orchestration service was initiated with event body: ${event.body}`);

    const parsedBody = JSON.parse(event.body || "{}");

    let payload = WebSocketOrchestrationPayloadSchema.parse(parsedBody);
    const { caseId, clientSeed } = payload;

    if (!clientSeed || !connectionId || !caseId) {
      logger.error(`clientSeed or connectionId is missing`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "caseId, clientSeed, or connectionId is missing",
        }),
      };
    }

    logger.info(`Invoking getUserFromWebSocket lambda with connectionId: ${connectionId}`);
    const connectionInfo: ConnectionInfo | null = await getConnectionInfo(connectionId);

    if (!connectionInfo) {
      throw new Error("ConnectionId not found");
    }
    const user = connectionInfo;

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
    logger.info(`Invoking getCase lambda with caseId: ${caseId}`);
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

    const spinResultPayload = await performSpin(caseModel, clientSeed, serverSeed);
    if (spinResultPayload.statusCode !== 200) {
      throw new Error("Error occured in case spin handler");
    }

    const spinResult: SpinResult = JSON.parse(spinResultPayload.body);

    const caseRolledItem: BaseCaseItem = BaseCaseItemSchema.parse(spinResult.rewardItem);

    const rollValue: number = spinResult.rollValue;

    logger.info(`Case roll result is: ${{ caseRolledItem, rollValue }}`);

    // Invalidate server seed now to prevent malicious attacks on unhashed server seed

    await removeServerSeed(connectionId);

    // Send result to client
    const responseMessage = {
      "case-result": {
        caseItem: caseRolledItem,
        rollValue: rollValue,
        serverSeed,
      },
    };

    sendWebSocketMessage(messageEndpoint, connectionId, responseMessage, "case");

    // Send new server seed hash to user
    const newServerSeed = await generateServerSeed(connectionId);
    const hashedServerSeed = hashString(newServerSeed);
    const serverSeedMessage = {
      "server-seed-hash": hashedServerSeed,
    };

    sendWebSocketMessage(messageEndpoint, connectionId, serverSeedMessage, "server-seed");

    // Publish outcome to event bridge
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
      Service.ORCHESTRATION as EventConfig
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
    logger.error(`Error in orchestration handler: ${error}`);
    const errorMessage: string = (error as Error).message;
    sendWebSocketMessage(
      messageEndpoint,
      connectionId,
      { error: { message: errorMessage } },
      "error"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
});
