import React, { useMemo } from "react";
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

function formatTimestamp(timestamp: string | number | Date) {
  const date = new Date(timestamp);

  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // @ts-ignore
  return date.toLocaleString("en-US", options);
}

export const ChatInputElement: React.FC<ChatInputElementProps> = ({
  message,
  username,
  timestamp,
  profilePicture,
}) => {
  const formattedTimestamp = useMemo(() => formatTimestamp(timestamp), [timestamp]);
  const truncatedUsername = useMemo(() => truncateUsername(username), [username]);
  console.log(timestamp);

  return (
    <div className="flex items-start space-x-2">
      <ProfileComponent level={85} profilePic={profilePicture} />
      <div className="flex flex-col space-y-1.5 flex-grow min-w-0">
        <span className="flex text-color_chat_text text-sm" title={username}>
          {truncatedUsername}
        </span>
        <div
          className={
            "relative flex items-center justify-start max-w-full w-max p-2.5 pb-3 bg-color_gray_2 rounded-[1px_8px_8px_8px]"
          }
        >
          <p className="text-gray-300 text-xs break-words overflow-hidden h-full">{message}</p>
        </div>
        <span className={"text-white text-3xs text-color_light_gray_1 whitespace-nowrap"}>
          Sent {formattedTimestamp}
        </span>
      </div>
    </div>
  );
};
