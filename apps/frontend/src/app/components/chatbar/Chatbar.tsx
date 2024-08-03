"use client";

import React, { useEffect, useState } from "react";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import { useWebSocket } from "../../context/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { ChatHeader } from "./ChatHeader";
import { ExpandButton } from "./ExpandButton";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";

interface Message {
  message: string;
  username: string;
  timestamp: number;
  profilePicture?: string;
}

export const Chatbar = () => {
  const isChatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket, sendMessage, connectionStatus } = useWebSocket();
  const [playerCount, setPlayerCount] = useState<number>(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_MESSAGE_API_URL}/chats`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);
  useEffect(() => {
    console.log("in here");
    if (connectionStatus === "connected") {
      sendMessage(JSON.stringify({ action: "player-count" }));
    }
  }, [connectionStatus, sendMessage]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if ("type" in data && data["type"] === "chat") {
          const message = data["message"];
          console.log(message);
          if (message && "player-count" in message) {
            const playersCount = message["player-count"]["count"];
            setPlayerCount(playersCount);
          } else if (message && "chat-message" in message) {
            const newMessage: Message = message["chat-message"];
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, newMessage];
              if (updatedMessages.length > 10) {
                return updatedMessages.slice(1);
              }
              return updatedMessages;
            });
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    if (socket) {
      socket.addEventListener("message", handleMessage);
    }

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleMessage);
      }
    };
  }, [socket]);

  const [isOldestMessageVisible, setIsOldestMessageVisible] = useState(false);

  const handleOldestMessageVisible = (isVisible: boolean) => {
    setIsOldestMessageVisible(isVisible);
  };

  return (
    <div className="relative">
      <div
        className={`
        absolute lg:relative inset-0 md:h-[calc(100vh-5rem)]
        ${
          isChatOpen
            ? "w-[320px] border-r border-color_gray_3 translate-x-0"
            : "w-0 -translate-x-full"
        }
        z-40 transition-all duration-300 ease-in-out flex-shrink-0 bg-chatbar_bg shadow-2xl
      `}
      >
        <div className="h-full flex flex-col items-center justify-between shadow-2xl w-full overflow-x-hidden">
          <ChatHeader onlineCount={1234} title="General Chat" />
          <ChatBody messages={messages} />
          <ChatInput playersOnline={playerCount} />
        </div>
      </div>
      <div
        className={`
          absolute bottom-12
          ${isChatOpen ? "left-[320px]" : "left-0"}
          transition-all duration-300 ease-in-out z-50
        `}
      >
        <ExpandButton
          toggleChatOpen={() => {
            dispatch(toggleChatBarClicked());
          }}
        />
      </div>
    </div>
  );
};
