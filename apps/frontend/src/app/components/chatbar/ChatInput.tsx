import React, { useContext, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext'; // Adjust the import path as needed

export const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useWebSocket();

  const handleSendMessage = () => {
    if (message.trim()) {
      const websocketMessage = JSON.stringify({ action: "chat", message })
      sendMessage(websocketMessage);
      setMessage('');
    }
  };

  return (
    <div className="flex-none px-4 w-full h-24 flex items-center justify-between z-50 border-t-green-500 gradient-border-top">
      <textarea
        className="bg-dark rounded-lg p-4 text-white w-full h-auto resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 overflow-hidden"
        placeholder="Enter your text here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
      <button
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={handleSendMessage}
      >
        Send
      </button>
    </div>
  );
};