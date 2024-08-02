import React, { KeyboardEvent, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
// import UsersIcon from "../../../../public/icons/users-svgrepo-com.svg"; // Import your local SVG file
import Send from "./../../../../public/icons/send.svg";

type ChatInputProps = {
  playersOnline: number;
};

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
    <div className="px-2 py-2.5 w-full h-auto flex items-center justify-between z-30">
      {/*<div className="w-full flex items-center justify-between bg-[#171920] rounded-2xl p-[9px] pl-[16px]">*/}
      <div className={"relative flex w-full justify-center items-center"}>
        <textarea
          className="border-[1px] border-color_gray_3 text-white text-sm rounded-sm w-full min-h-[30px] max-h-[200px] pr-9 pl-[15px] py-3 resize-none outline-none bg-[#141419] h-12 placeholder:transition-opacity focus:placeholder:opacity-50 focus:outline-none flex justify-center items-center overflow-y-auto"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        ></textarea>
        <div className="ml-2 flex flex-col items-center ">
          <button
            className="shadow-xl absolute inset-y-0 right-4 z-10 my-auto mr-md"
            onClick={handleSendMessage}
          >
            <Send className={"text-gray-400"} />
          </button>
        </div>
      </div>
    </div>
  );
};
