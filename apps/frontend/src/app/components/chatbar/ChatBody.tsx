import React, { useEffect, useRef, useState } from "react";
import { ChatInputElement } from "./ChatInputElement";

interface Message {
  message: string;
  username: string;
  profileImageUrl?: string;
}

interface ChatBodyProps {
  messages: Message[];
}

export const ChatBody: React.FC<ChatBodyProps> = ({ messages }) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const scrolledToBottom = useRef<boolean>(false);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatBodyRef.current || visibleMessages.length === 0) return;

    const scrollToBottom = () => {
      if (chatBodyRef.current && !scrolledToBottom.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: "smooth",
        });
        scrolledToBottom.current = true;
      }
    };

    scrollToBottom();
  }, [visibleMessages]);

  useEffect(() => {
    const latestMessages = messages.slice(-50);
    console.log(latestMessages[0]);
    setVisibleMessages(latestMessages.reverse());
  }, [messages]);

  return (
    <div className="relative flex-grow overflow-hidden w-full">
      <div
        className="overflow-y-auto overflow-x-hidden h-full flex flex-col-reverse"
        ref={chatBodyRef}
      >
        {visibleMessages.map((message, index) => (
          <div key={index} className={`transition-opacity relative px-2 py-3 duration-300`}>
            <ChatInputElement
              message={message.message}
              username={message.username}
              profileImageUrl={message.profileImageUrl || ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
