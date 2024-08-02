import { useDispatch } from "react-redux";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";
import BackArrow from "../../../../public/icons/back-arrow.svg";
import React from "react";

interface ChatHeaderProps {
  onlineCount: number;
  title: "General Chat";
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onlineCount, title }) => {
  const dispatch = useDispatch();

  return (
    <div
      className={
        "mt-2 sticky shadow-2xl w-[95%] z-50 flex items-center justify-between p-2 bg-navbar_bg rounded-md"
      }
    >
      <span className={"text-color_chat_text font-semibold"}>{title}</span>
      <div className={"flex items-center justify-between space-x-2"}>
        <div className={"flex items-center space-x-1 justify-between"}>
          <div className={"rounded-full w-2 h-2 bg-green-500"}></div>
          <span className={"text-color_light_gray_1 text-xs"}>{onlineCount}</span>
        </div>
        <BackArrow
          className={
            "w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors duration-200"
          }
          onClick={() => dispatch(toggleChatBarClicked())}
        />
      </div>
    </div>
  );
};
