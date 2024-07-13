import React, { useEffect, useRef, useState } from "react";
import { ChatInputElement } from "./ChatInputElement";

interface Message {
  message: string;
  username: string;
  timestamp: number;
  profilePicture?: string;
}

interface ChatBodyProps {
  messages: Message[];
}

export const ChatBody: React.FC<ChatBodyProps> = ({ messages }) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatBodyRef.current) return;

    const scrollToBottom = () => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    scrollToBottom();
  }, [visibleMessages]);

  useEffect(() => {
    const latestMessages = messages.slice(-50);
    setVisibleMessages(latestMessages);
  }, [messages]);

  return (
    <div className="relative flex-grow overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10"></div>
      <div className="overflow-y-auto h-full pb-4" ref={chatBodyRef}>
        {visibleMessages.map((message, index) => (
          <div
            key={index}
            className={`chat-message-container transition-opacity duration-300 ${
              index === 0 ? "opacity-25" : index === 1 ? "opacity-50" : "opacity-100"
            }`}
          >
            <ChatInputElement
              message={message.message}
              username={message.username}
              timestamp={message.timestamp}
              profilePicture={message.profilePicture || ""}
            />
            {index < visibleMessages.length - 1 && (
              <div className="border-b border-gray-800 my-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};