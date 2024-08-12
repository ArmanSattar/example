import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      setConnectionStatus('connected');
      toast.success('Connected to server');

      const token = localStorage.getItem('token');
      if (token) {
        socketRef.current?.send(JSON.stringify({ action: 'authenticate', token }));
      }
    };

    socketRef.current.onclose = () => {
      setConnectionStatus('disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
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

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketRef.current?.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn('WebSocket is not open. Ready state is:', socketRef.current?.readyState);
      toast.error('Connection lost. Attempting to reconnect...');
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
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};