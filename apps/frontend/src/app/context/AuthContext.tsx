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
  checkToken: () => Promise<boolean>;
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

  const checkToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/user`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.ok) {
          const user = await response.json();
          setUser(user);
          return true;
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem("token");
      }
    }
    return false;
  }, []);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

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
      const loginResponse = await fetch(`${apiUrl}/auth/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          nonce,
        }),
      });

      if (loginResponse.ok) {
        const { message, data } = await loginResponse.json();
        
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
          toast.success("Successfully logged in!");
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Failed to log in!");
      setUser(null);
    }
  }, [publicKey, signMessage, connectionStatus, sendMessage]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      await disconnect();
      setUser(null);
      toast.success('Logged out successfully!');
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "unauthenticate",
            token: token,
          })
        );
      }
      localStorage.removeItem("token");
    } catch (error) {
      toast.error('Error occurred during logout!');
    }
  }, [disconnect, connectionStatus, sendMessage]);


  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    checkToken,
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
