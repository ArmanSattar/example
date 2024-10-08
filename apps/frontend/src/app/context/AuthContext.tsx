import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWebSocket } from "./WebSocketContext";
import { toast } from "sonner";
import bs58 from "bs58";
import { useLoading } from "./LoadingContext";
import { userManagementUrl } from "../libs/constants";

interface User {
  userId: string;
  username: string;
  updatedAt: string;
  createdAt: string;
  level: number;
  discord: string;
  walletAddress: string;
  muteAllSounds: boolean;
  profileImageUrl: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkToken: () => Promise<boolean>;
  updateUser: (updatedUserData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { connected, disconnect, publicKey, signMessage } = useWallet();
  const { sendMessage, connectionStatus } = useWebSocket();
  const { connection } = useConnection();
  const { startLoading, finishLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(true);

  const checkToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const response = await fetch(`${userManagementUrl}/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setUser(user);
          return true;
        } else {
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("token");
    } finally {
      finishLoading();
      setIsLoading(false);
    }
    return false;
  }, []);

  useEffect(() => {
    startLoading();
    setIsLoading(true);
    console.log("Checking token...");
    checkToken();
  }, [checkToken]);

  const login = useCallback(async () => {
    startLoading();
    setIsLoading(true);
    try {
      if (!connected || !publicKey || !signMessage) {
        toast.error("Wallet not connected or does not support message signing!");
        return;
      }

      // Request a nonce from the server
      const nonceResponse = await fetch(`${userManagementUrl}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce } = await nonceResponse.json();

      // Create the message to be signed
      const message = new TextEncoder().encode(
        `Sign this message to log in to Solspin:\nNonce: ${nonce}`
      );

      const signedMessage = await signMessage(message);
      const signature = bs58.encode(signedMessage);

      // Send the signed message to the server
      const loginResponse = await fetch(`${userManagementUrl}/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          nonce,
        }),
      });

      if (loginResponse.ok) {
        const { data } = await loginResponse.json();

        if (data && data.user && data.token) {
          const token = data.token;
          const user = data.user;

          setUser(user);
          localStorage.setItem("token", token);
          if (connectionStatus === "connected") {
            sendMessage(
              JSON.stringify({
                action: "authenticate",
                token: token,
              })
            );
          }
          location.reload();
          toast.success("Successfully logged in!");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      if ((error as Error).name === "WalletSignMessageError") {
        await disconnect();
      }
      toast.error((error as Error).message);
    } finally {
      finishLoading();
      setIsLoading(false);
    }

    setUser(null);
  }, [publicKey, signMessage, connectionStatus, sendMessage, connected, disconnect]);

  const logout = useCallback(async () => {
    startLoading();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      await disconnect();
      setUser(null);
      toast.success("Logged out successfully!");
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "unauthenticate",
            token: token,
          })
        );
        sendMessage(
          JSON.stringify({
            action: "logout",
          })
        );
      }
      localStorage.removeItem("token");
    } catch (error) {
      toast.error("Error occurred during logout!");
    } finally {
      finishLoading();
      setIsLoading(false);
    }
  }, [disconnect, connectionStatus, sendMessage]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser((currentUser) => {
      if (currentUser) {
        return { ...currentUser, ...updatedUserData };
      }
      return currentUser;
    });
  }, []);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    checkToken,
    updateUser,
    isLoading,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
