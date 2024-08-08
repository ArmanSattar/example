import ChatIconSvg from "../../../../public/icons/chat-icon.svg";

interface ExpandButtonProps {
  toggleChatOpen: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ toggleChatOpen }) => {
  return (
    <button
      className="flex justify-center items-center bg-chatbar_bg rounded-l-none rounded-r-md w-12 h-12 z-50 hover:cursor-pointer expand-button hover:bg-color_gray_4 transition-all duration-250 ease-in-out border-[1px] border-l-0 border-color_gray_3"
      onClick={() => {
        toggleChatOpen();
      }}
    >
      <ChatIconSvg
        className={
          "mt-1 fill-white text-white transition-all duration-250 ease-in-out w-8 h-8 bg-none"
        }
      />
    </button>
  );
};
