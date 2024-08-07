import React from "react";
import { ProfilePictureWithEdit } from "./ProfilePictureWithEdit";

interface UserHeaderProps {
  username: string;
  profilePictureURL?: string;
  rank: string;
  progress: string;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  username,
  profilePictureURL,
  rank,
  progress,
}) => {
  return (
    <div className={"flex flex-col gap-y-2"}>
      <span className={"uppercase text-white text-lg font-bold"}>Profile</span>
      <div className="rounded-md flex flex-col justify-between w-full mx-auto py-4 px-6 bg-color_gray_3 relative gap-y-4">
        <div className={"relative w-full flex justify-center items-center"}>
          <ProfilePictureWithEdit profilePictureURL={profilePictureURL} />
        </div>
        <div className={"flex flex-col gap-y-1 justify-between items-start w-full"}>
          <div className="text-white text-xl font-bold">{username}</div>
          <div className="text-gray-400">{rank}</div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full w-full "
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-gray-400 text-sm mt-1">{progress}% to next rank</div>
        </div>
      </div>
    </div>
  );
};
