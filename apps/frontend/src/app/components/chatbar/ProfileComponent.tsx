import Image from "next/image";
import React from "react";

interface ProfileComponentProps {
  level: number;
  profilePic?: string;
}

export const ProfileComponent: React.FC<ProfileComponentProps> = ({ level, profilePic }) => {
  return (
    <div className="relative flex-shrink-0 w-[50px] h-[64px]">
      <div className="relative rounded-full border-purple-500 border-2 flex justify-center items-center w-[50px] h-[50px] p-1">
        <div className="absolute bg-black rounded-full flex justify-center items-center overflow-clip">
          <Image
            src={profilePic ? profilePic : "icons/portrait-09.png"}
            alt="profile"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 border-2 border-chatbar_bg inline-flex justify-center items-center z-30 px-[5px] py-[4px]">
        <span className="text-black text-2xs font-bold text-center">{level}</span>
      </div>
    </div>
  );
};
