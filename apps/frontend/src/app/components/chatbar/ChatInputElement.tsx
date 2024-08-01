import React from "react";
import { ProfileComponent } from "./ProfileComponent";

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
    <div className="relative py-4 px-2">
      <div className="flex items-start space-x-2">
        <ProfileComponent level={85} profilePic={profilePicture} />
        <div className="flex flex-col space-y-1.5 flex-grow min-w-0">
          <span className="flex text-color_chat_text text-sm" title={username}>
            {truncatedUsername}
          </span>
          <div
            className={
              "relative flex items-center justify-center p-2.5 pb-3 bg-color_gray_2 rounded-[1px_8px_8px_8px]"
            }
          >
            <p className="text-gray-300 text-xs break-words overflow-hidden w-full h-full">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
