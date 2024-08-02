"use client";

import ChatIconSvg from "../../../../public/icons/chat-icon.svg";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface ExpandButtonProps {
  toggleChatOpen: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ toggleChatOpen }) => {
  const isChatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);

  return (
    <button
      className="flex justify-center items-center bg-color_gray_3 rounded-full w-16 h-16 z-50 hover:cursor-pointer shadow-circle hover:bg-gray-600 transition-all duration-250 ease-in-out"
      onClick={() => {
        if (!isChatOpen) toggleChatOpen();
      }}
    >
      <ChatIconSvg
        className={
          "mt-1 fill-white text-white transition-all duration-250 ease-in-out w-10 h-10 bg-none"
        }
      />
    </button>
  );
};
