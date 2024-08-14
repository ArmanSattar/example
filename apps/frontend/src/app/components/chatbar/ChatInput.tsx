"use client";

import React, { KeyboardEvent, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
import Send from "./../../../../public/icons/send.svg";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { ExpandButton } from "./ExpandButton";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";

export const ChatInput = () => {
  const isChatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const { sendMessage } = useWebSocket();
  const { user } = useAuth();

  const handleSendMessage = () => {
    console.log(user, "user");
    if (!user) {
      toast.error("You need to be logged in to send messages");
      return;
    }

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
    <div className="relative px-2 py-2.5 w-full max-h-20 flex items-center justify-between z-30 border-t-[1px] border-color_gray_3">
      <div className={`fixed z-50 bottom-[21px] -right-[49px]`}>
        <ExpandButton
          toggleChatOpen={() => {
            dispatch(toggleChatBarClicked());
          }}
        />
      </div>
      <div className={"relative flex w-full justify-center items-center"}>
        <textarea
          className="border-[1px] border-color_gray_3 focus:border-color_secondary text-white text-sm rounded-sm w-full min-h-[40px] max-h-[200px] pr-9 pl-[15px] py-3 resize-none outline-none bg-[#141419] h-12 placeholder:transition-opacity focus:placeholder:opacity-50 focus:outline-none flex justify-center items-center overflow-y-auto"
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
            <Send
              className={"text-gray-500 hover:text-gray-400 transition duration-250 ease-in-out"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
