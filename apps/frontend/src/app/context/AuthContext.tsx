import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWebSocket } from "./WebSocketContext";
import { toast } from 'sonner';
import bs58 from 'bs58';

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
}

const apiUrl: string = `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API_URL}`;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { connected, disconnect, publicKey, signMessage } = useWallet();
  const { sendMessage, connectionStatus } = useWebSocket();
  const { connection } = useConnection();

  useEffect(() => {
    if (connected && publicKey && signMessage) {
      login();
    } else {
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [connected, publicKey, signMessage, connection, connectionStatus, sendMessage]);

  const login = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast.error('Wallet not connected or does not support message signing!');
      return;
    }

    try {
      // Request a nonce from the server
      const nonceResponse = await fetch(`${apiUrl}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce from server');
      }

      const { nonce } = await nonceResponse.json();

      // Create the message to be signed
      const message = new TextEncoder().encode(
        `Sign this message to log in to Solspin:\nNonce: ${nonce}`
      );

      // Sign the message
      const signedMessage = await signMessage(message);
      const signature = bs58.encode(signedMessage);

      // Send the signed message to the server
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          nonce,
        }),
      });

      if (loginResponse.ok) {
        const { user, token } = await loginResponse.json();
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
        toast.success("Successfully logged in!");
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Failed to log in!");
      setUser(null);
    }
  }, [publicKey, signMessage, connectionStatus, sendMessage]);

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");

      await disconnect();
      setUser(null);
      toast.success('Logged out successfully!');
      sendMessage(
        JSON.stringify({
          action: "unauthenticate",
          token: token,
        })
      );
      localStorage.removeItem("token");
    } catch (error) {
      toast.error('Error occurred during logout!');
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}