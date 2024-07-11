import { randomBytes } from "crypto";
import { ConnectionInfo } from "@solspin/websocket-types";
import {
  saveConnectionInfo,
  deleteConnectionInfo,
  getConnectionInfoFromDB,
  updateConnectionInfo,
} from "../data-access/connectionRepository";

export const handleNewConnection = async (connectionId: string): Promise<string> => {
  const connectionInfo: ConnectionInfo = {
    isAuthenticated: false,
    connectionId,
  };

  await saveConnectionInfo(connectionId, connectionInfo);
  return connectionId;
};

export const removeServerSeed = async (connectionId: string): Promise<void> => {
  await updateConnectionInfo(connectionId, { serverSeed: "" });
};

export const authenticateUser = async (connectionId: string, userId: string): Promise<void> => {
  await updateConnectionInfo(connectionId, { isAuthenticated: true, userId });
};

export const unauthenticateUser = async (connectionId: string): Promise<void> => {
  await updateConnectionInfo(connectionId, { isAuthenticated: false });
};

export const generateServerSeed = async (connectionId: string): Promise<string> => {
  const connectionInfo = await getConnectionInfoFromDB(connectionId);
  if (!connectionInfo || !connectionInfo.isAuthenticated) {
    throw new Error("Unauthorized: User is not authenticated");
  }
  const serverSeed = randomBytes(32).toString("hex");
  await updateConnectionInfo(connectionId, { serverSeed });
  return serverSeed;
};

export const handleLogout = async (connectionId: string): Promise<void> => {
  await updateConnectionInfo(connectionId, {
    isAuthenticated: false,
    userId: undefined,
    serverSeed: undefined,
  });
};

export const handleConnectionClose = async (connectionId: string): Promise<void> => {
  await deleteConnectionInfo(connectionId);
};

export const getConnectionInfo = async (connectionId: string): Promise<ConnectionInfo | null> => {
  return await getConnectionInfoFromDB(connectionId);
};
