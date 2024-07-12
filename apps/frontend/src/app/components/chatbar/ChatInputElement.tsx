import Image from "next/image";
interface ChatInputElementProps {
  message: string;
  username: string;
  timestamp: number;
  profilePicture: string;
}

export const ChatInputElement: React.FC<ChatInputElementProps> = ({ message, username, timestamp, profilePicture }) => {
  return (
    <div className="relative py-4 px-2 gradient-border-bottom">
      <div className="flex items-start space-x-2">
        <Image src={"/cases/dota_3.svg"} alt="Profile picture" width={48} height={48} className="flex-shrink-0" />
        <div className="flex flex-col space-y-1.5 flex-grow min-w-0">
          <span className="flex text-green-500 text-sm font-bold break-words overflow-hidden">{username}</span>
          <p className="text-gray-300 text-xs break-words overflow-hidden">{message}</p>
        </div>
      </div>
    </div>
  );
};