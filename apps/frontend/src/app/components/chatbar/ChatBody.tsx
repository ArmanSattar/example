import React, { useEffect, useRef, useState } from "react";
import { ChatInputElement } from "./ChatInputElement";

interface Message {
  message: string;
  username: string;
  timestamp: number;
  profilePicture?: string;
}

const mockMessages = [
  {
    message: "What are you up to? It feels like it's been a while since we last talked. 😄!",
    username: "JohnDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "Hey, how are you?",
    username: "JaneDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "I'm good, thanks!",
    username: "JohnDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "How about you?",
    username: "JohnDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "I'm good too, thanks for asking!",
    username: "JaneDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "What are you up to? It feels like it's been a while since we last talked. 😄!",
    username: "JaneDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "Just working on some stuff",
    username: "JohnDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "Cool, cool",
    username: "JaneDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "Yeah",
    username: "JohnDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
  {
    message: "What are you up to? It feels like it's been a while since we last talked. 😄!",
    username: "JaneDoe",
    timestamp: Date.now(),
    profilePicture: "/icons/portrait-09.png",
  },
];

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
    // const latestMessages = messages.slice(-50);
    // setVisibleMessages(latestMessages);
    setVisibleMessages(mockMessages);
  }, []);

  return (
    <div className="relative flex-grow overflow-hidden">
      <div className="overflow-y-auto h-full pb-4" ref={chatBodyRef}>
        {visibleMessages.map((message, index) => (
          <div
            key={index}
            className={`transition-opacity duration-300 ${
              index === 0 ? "opacity-25" : index === 1 ? "opacity-50" : "opacity-100"
            }`}
          >
            <ChatInputElement
              message={message.message}
              username={message.username}
              timestamp={message.timestamp}
              profilePicture={message.profilePicture || ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
