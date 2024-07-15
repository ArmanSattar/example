"use client";

import React, { useEffect, useState } from "react";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import { ExpandButton } from "./ExpandButton";
import { DismissButton } from "./DismissButton";
import { useWebSocket } from "../../context/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";

interface ChatbarProps {
  chatOpenCallback: () => void;
}

interface Message {
  message: string;
  username: string;
  timestamp: number;
  profilePicture?: string;
}

export const Chatbar: React.FC<ChatbarProps> = ({ chatOpenCallback }) => {
  const dispatch = useDispatch();
  const isChatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket, sendMessage, connectionStatus } = useWebSocket();

  const toggleChatOpen = () => {
    dispatch(toggleChatBarClicked());
    chatOpenCallback();
  };

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
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if ("type" in data && data["type"] === "chat") {
          const newMessage: Message = data["message"];
          setMessages((prevMessages) => [...prevMessages, newMessage]);
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

  // TODO - Fix the height issue in mobile [ARMAN]

  return (
    <div
      className="absolute md:relative h-[calc(100dvh-5rem)] z-40 transition-all duration-500 ease-in-out flex-shrink-0 bg-background chat-bar shadow-2xl"
      style={{
        width: isChatOpen ? "320px" : "0px",
      }}
    >
      <div
        className={`h-full flex flex-col justify-between shadow-2xl transition-transform duration-500`}
        style={{
          width: "320px",
          transform: isChatOpen ? "translateX(0)" : "translateX(-320px)",
        }}
      >
        <ChatBody messages={messages} />
        <ChatInput />
      </div>
      <div
        className={`absolute bottom-12 -right-12 transform translate-x-full -translate-y-1/2 transition-transform duration-500 ${
          isChatOpen ? "hidden" : ""
        }`}
      >
        <ExpandButton toggleChatOpen={toggleChatOpen} />
      </div>
      <div
        className={`absolute top-6 right-12 transform translate-x-full -translate-y-1/2 transition-transform duration-500 ${
          !isChatOpen ? "hidden" : ""
        }`}
      >
        <DismissButton toggleChatClose={toggleChatOpen} />
      </div>
    </div>
  );
};
