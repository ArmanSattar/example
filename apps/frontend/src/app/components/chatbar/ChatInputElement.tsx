import React, { useMemo } from "react";
import { ProfileComponent } from "./ProfileComponent";

interface ChatInputElementProps {
  message: string;
  username: string;
  profileImageUrl: string;
}

const truncateUsername = (username: string, maxLength = 20) => {
  if (!username) return "";
  if (username.length <= maxLength) return username;
  return `${username.slice(0, maxLength)}...`;
};

export const ChatInputElement: React.FC<ChatInputElementProps> = ({
  message,
  username,
  profileImageUrl,
}) => {
  const truncatedUsername = useMemo(() => truncateUsername(username), [username]);
  console.log(message, username, profileImageUrl);

  return (
    <div className="flex items-start space-x-2">
      <ProfileComponent level={85} profileImageUrl={profileImageUrl} />
      <div className="flex flex-col space-y-1.5 flex-grow min-w-0">
        <span className="flex text-color_chat_text text-sm" title={username}>
          {truncatedUsername}
        </span>
        <div
          className={
            "relative flex items-center justify-start max-w-full w-max p-2.5 pb-3 bg-color_gray_2 rounded-[1px_8px_8px_8px]"
          }
        >
          <p className="text-gray-300 text-xs break-words overflow-hidden h-full whitespace-nowrap">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
