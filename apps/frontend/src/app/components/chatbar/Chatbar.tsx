"use client";

import React, { useEffect, useState } from "react";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";
import { ExpandButton } from "./ExpandButton";
import { useWebSocket } from "../../context/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";
import { ChatHeader } from "./ChatHeader";

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
  const [playerCount, setPlayerCount] = useState<number>(0);
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
    <div
      className={`absolute lg:relative inset-0 md:h-[calc(100vh-5rem)] ${
        isChatOpen ? "w-screen md:w-[320px] border-r-[1px] border-color_gray_3" : "w-0"
      } z-40 transition-all duration-250 ease-in-out flex-shrink-0 bg-chatbar_bg shadow-2xl`}
    >
      <div
        className={`h-full flex flex-col items-center justify-between shadow-2xl transition-transform duration-500 w-full ${
          !isChatOpen ? "-translate-x-full hidden" : "translate-x-0"
        }`}
      >
        <ChatHeader onlineCount={1234} title={"General Chat"} />
        <ChatBody messages={messages} />
        <div className="w-full">
          <ChatInput playersOnline={playerCount} />
        </div>
      </div>
      <div
        className={`absolute hidden md:block bottom-4 -right-10 transform translate-x-full -translate-y-1/2 ${
          isChatOpen ? "!hidden" : ""
        }`}
      >
        <ExpandButton toggleChatOpen={toggleChatOpen} />
      </div>
      {/*<div*/}
      {/*  className={`absolute top-6 right-12 transform translate-x-full -translate-y-1/2 transition-transform duration-500 ${*/}
      {/*    !isChatOpen ? "hidden" : ""*/}
      {/*  }`}*/}
      {/*>*/}
      {/*  <DismissButton toggleChatClose={toggleChatOpen} />*/}
      {/*</div>*/}
    </div>
  );
};
