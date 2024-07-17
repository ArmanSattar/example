import ChatIconSvg from "../../../../public/icons/chat-icon.svg";

interface ExpandButtonProps {
  toggleChatOpen: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ toggleChatOpen }) => {
  return (
    <button
      className="flex justify-center items-center bg-gray-700 rounded-full w-16 h-16 z-20 hover:cursor-pointer shadow-circle hover:bg-gray-600 transition-all duration-250 ease-in-out"
      onClick={() => {
        toggleChatOpen();
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
