import Image from "next/image";
import React from "react";

interface ChatInputElementProps {
  message: string;
  username: string;
  timestamp: number;
  profilePicture: string;
}

const truncateUsername = (username: string, maxLength = 20) => {
  if (!username) return "";
  if (username.length <= maxLength) return username;
  return `${username.slice(0, maxLength)}...`;
};

export const ChatInputElement: React.FC<ChatInputElementProps> = ({
  message,
  username,
  timestamp,
  profilePicture,
}) => {
  const truncatedUsername = truncateUsername(username);

  return (
    <div className="relative py-4 px-2 gradient-border-bottom">
      <div className="flex items-start space-x-2">
        <Image
          src={"/cases/dota_3.svg"}
          alt="Profile picture"
          width={48}
          height={48}
          className="flex-shrink-0"
        />
        <div className="flex flex-col space-y-1.5 flex-grow min-w-0">
          <span className="flex text-emerald-500 text-sm font-bold" title={username}>
            {truncatedUsername}
          </span>
          <p className="text-gray-300 text-xs break-words overflow-hidden">{message}</p>
        </div>
      </div>
    </div>
  );
};
