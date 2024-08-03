import React from "react";

interface ChatHeaderProps {
  onlineCount: number;
  title: "General Chat";
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onlineCount, title }) => {
  return (
    <div
      className={
        "mt-2 sticky shadow-2xl w-[95%] z-50 flex items-center justify-between p-2 bg-navbar_bg rounded-md"
      }
    >
      <span className={"text-white font-semibold"}>{title}</span>
      <div className={"flex items-center space-x-1 justify-between"}>
        <div className={"rounded-full w-2 h-2 bg-green-500"}></div>
        <span className={"text-color_light_gray_1 text-xs"}>{onlineCount}</span>
      </div>
    </div>
  );
};
