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
          const message = data["message"]
          console.log(message)
          if (message && "player-count" in message){
            const playerCount = message["player-count"]["count"]
            console.log(`player count is ${playerCount}`)

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
  console.log(isChatOpen);
  return (
    <div
      className={`absolute lg:relative inset-0 md:h-[calc(100vh-5rem)] ${
        isChatOpen ? "w-screen md:w-[320px]" : "w-0"
      } z-40 transition-all duration-500 ease-in-out flex-shrink-0 bg-background shadow-2xl`}
    >
      <div
        className={`h-full flex flex-col justify-between shadow-2xl transition-transform duration-500 w-full ${
          !isChatOpen ? "-translate-x-full hidden" : "translate-x-0"
        }`}
      >
        <ChatBody messages={messages} />
        <div className="w-full">
          <ChatInput />
        </div>
      </div>
      <div
        className={`absolute hidden md:block bottom-4 -right-10 transform translate-x-full -translate-y-1/2 ${
          isChatOpen ? "!hidden" : ""
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
