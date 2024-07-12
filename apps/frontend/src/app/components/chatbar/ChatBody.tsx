import { ChatInputElement } from "./ChatInputElement";
import { useEffect, useRef } from "react";

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
  }, [messages]);

  return (
    <div className="overflow-y-auto" ref={chatBodyRef}>
      {messages.map((message, index) => (
        <div key={index} className="chat-message-container">
          <ChatInputElement
            message={message.message}
            username={message.username}
            timestamp={message.timestamp}
            profilePicture={message.profilePicture || ""}
          />
          {index < messages.length - 1 && (
            <div className="border-b border-gray-800 my-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};