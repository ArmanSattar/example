import Image from "next/image";
import { useDispatch } from "react-redux";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";

interface ChatHeaderProps {
  onlineCount: number;
  title: "General Chat";
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onlineCount, title }) => {
  const dispatch = useDispatch();

  return (
    <div
      className={
        "mt-2 sticky w-[95%] z-50 flex items-center justify-between p-2 bg-navbar_bg rounded-md"
      }
    >
      <span className={"text-color_chat_text font-semibold"}>{title}</span>
      <div className={"flex items-center justify-between space-x-2"}>
        <div className={"flex items-center space-x-1 justify-between"}>
          <div className={"rounded-full w-2 h-2 bg-green-500"}></div>
          <span className={"text-color_light_gray_1 text-xs"}>{onlineCount}</span>
        </div>
        <Image
          width={24}
          height={24}
          src={"/icons/close-left.svg"}
          alt={"close"}
          onClick={() => {
            dispatch(toggleChatBarClicked());
          }}
          className={"cursor-pointer"}
        />
      </div>
    </div>
  );
};
