import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  connectionStatus: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  url: string;
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ url, children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectIntervalRef = useRef(3000); // 3 seconds

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      setConnectionStatus("connected");
      toast.success("Connected to server");
      reconnectAttempts.current = 0;
      reconnectIntervalRef.current = 3000; 

      const token = localStorage.getItem("token");
      if (token) {
        socketRef.current?.send(JSON.stringify({ action: "authenticate", token }));
      }
    };

    socketRef.current.onclose = () => {
      setConnectionStatus("disconnected");
      attemptReconnect();
    }; 

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if ("type" in data && data["type"] == "error") {
        const message = data["message"];
        if ("message" in message) {
          const errorMessage: string = message["message"];
          toast.error(`Error occurred: ${errorMessage}`);
        }
      }
    };

    setSocket(socketRef.current);
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    reconnectAttempts.current++;


    setTimeout(() => {
      connect();
    }, reconnectIntervalRef.current);

    // Implement exponential backoff
    reconnectIntervalRef.current = Math.min(30000, reconnectIntervalRef.current * 2);
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      connect();
    }
  };

  const handleOnline = () => {
    connect();
  };

  useEffect(() => {
    connect();

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket is not open. Ready state is:", socketRef.current?.readyState);
      toast.error("Connection lost. Attempting to reconnect...");
      connect();
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage, connectionStatus }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};