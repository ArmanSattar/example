import React, { KeyboardEvent, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
// import UsersIcon from "../../../../public/icons/users-svgrepo-com.svg"; // Import your local SVG file

type ChatInputProps = {
  playersOnline: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ playersOnline }) => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useWebSocket();
  
  const handleSendMessage = () => {
    if (message.trim()) {
      const websocketMessage = JSON.stringify({ action: "chat", message });
      sendMessage(websocketMessage);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="px-4 py-2 w-full h-auto flex flex-col items-center justify-between z-50 border-t-green-500 gradient-border-top">
      <div className="w-full flex items-center">
        <textarea
          className="bg-dark rounded-lg p-4 text-white w-full h-auto resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 overflow-hidden"
          placeholder="Enter your text here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        ></textarea>
        <div className="ml-2 flex flex-col items-center ">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            onClick={handleSendMessage}
          >
            Send
          </button>
          <div className="flex items-center mt-2 rounded-full px-3 py-1">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 mr-2"
    viewBox="0 0 24 24"
    fill="#22C55E"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 9.5C5 7.01472 7.01472 5 9.5 5C11.9853 5 14 7.01472 14 9.5C14 11.9853 11.9853 14 9.5 14C7.01472 14 5 11.9853 5 9.5Z"
    />
    <path
      d="M14.3675 12.0632C14.322 12.1494 14.3413 12.2569 14.4196 12.3149C15.0012 12.7454 15.7209 13 16.5 13C18.433 13 20 11.433 20 9.5C20 7.567 18.433 6 16.5 6C15.7209 6 15.0012 6.2546 14.4196 6.68513C14.3413 6.74313 14.322 6.85058 14.3675 6.93679C14.7714 7.70219 15 8.5744 15 9.5C15 10.4256 14.7714 11.2978 14.3675 12.0632Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.64115 15.6993C5.87351 15.1644 7.49045 15 9.49995 15C11.5112 15 13.1293 15.1647 14.3621 15.7008C15.705 16.2847 16.5212 17.2793 16.949 18.6836C17.1495 19.3418 16.6551 20 15.9738 20H3.02801C2.34589 20 1.85045 19.3408 2.05157 18.6814C2.47994 17.2769 3.29738 16.2826 4.64115 15.6993Z"
    />
    <path
      d="M14.8185 14.0364C14.4045 14.0621 14.3802 14.6183 14.7606 14.7837V14.7837C15.803 15.237 16.5879 15.9043 17.1508 16.756C17.6127 17.4549 18.33 18 19.1677 18H20.9483C21.6555 18 22.1715 17.2973 21.9227 16.6108C21.9084 16.5713 21.8935 16.5321 21.8781 16.4932C21.5357 15.6286 20.9488 14.9921 20.0798 14.5864C19.2639 14.2055 18.2425 14.0483 17.0392 14.0008L17.0194 14H16.9997C16.2909 14 15.5506 13.9909 14.8185 14.0364Z"
    />
  </svg>
  <span className="text-white text-sm">{playersOnline}</span>
</div>

        </div>
      </div>
    </div>
  );
  
};