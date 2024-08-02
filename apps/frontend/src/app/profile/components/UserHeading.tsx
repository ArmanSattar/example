import React from "react";
import { ProfileComponent } from "../../components/chatbar/ProfileComponent";

interface UserInfoProps {
  username: string;
  profilePictureURL?: string;
  rank: string;
  progress: string;
}

export const UserHeading: React.FC<UserInfoProps> = ({
  username,
  profilePictureURL,
  rank,
  progress,
}) => {
  return (
    <div className="w-full md:w-11/12 lg:w-4/5 mx-auto my-8 p-4 sm:p-6 bg-background rounded-lg relative">
      <div className="relative w-20 h-20 rounded-full">
        <ProfileComponent level={45} />
      </div>
      <div className="ml-4">
        <div className="text-white text-xl font-bold">{username}</div>
        <div className="text-gray-400">{rank}</div>
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-gray-400 text-sm mt-1">{progress}% to next rank</div>
        </div>
      </div>
    </div>
  );
};
